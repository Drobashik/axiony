import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { scanUrl } from '../scan-url';
import { BLOCKED_SCAN_PAGE_ERROR, REFRESH_OR_CHALLENGE_PAGE_ERROR } from '../page-readiness';

const listen = async (html: string): Promise<{ server: Server; url: string }> => {
  return listenWithHandler(() => html);
};

const listenWithHandler = async (
  handler: (request: IncomingMessage) => string,
): Promise<{ server: Server; url: string }> => {
  const server = createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(handler(request));
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Could not start test server.');
  }

  return {
    server,
    url: `http://127.0.0.1:${address.port}`,
  };
};

const listenWithResponseHandler = async (
  handler: (request: IncomingMessage, response: ServerResponse) => void,
): Promise<{ server: Server; url: string }> => {
  const server = createServer(handler);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Could not start test server.');
  }

  return {
    server,
    url: `http://127.0.0.1:${address.port}`,
  };
};

const closeServer = async (server: Server): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

test('fails clearly when URL scan remains on a meta-refresh page', async () => {
  const { server, url } = await listen(`
    <!doctype html>
    <html lang="en">
      <head>
        <title>Refresh page</title>
        <meta http-equiv="refresh" content="360">
      </head>
      <body>
        <main><h1>Refresh page</h1></main>
      </body>
    </html>
  `);

  try {
    await assert.rejects(
      () => scanUrl(url),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message, REFRESH_OR_CHALLENGE_PAGE_ERROR);
        assert.equal(error.name, 'ScanDiagnosticError');

        const diagnostic = (
          error as Error & {
            diagnostic?: {
              finalUrl?: string;
              metaRefresh?: string;
              title?: string;
            };
          }
        ).diagnostic;

        assert.equal(diagnostic?.finalUrl, new URL(url).href);
        assert.equal(diagnostic?.metaRefresh, '360');
        assert.equal(diagnostic?.title, 'Refresh page');
        return true;
      },
    );
  } finally {
    await closeServer(server);
  }
});

test('retries when the first URL scan response is a refresh page', async () => {
  let requestCount = 0;
  const { server, url } = await listenWithHandler(() => {
    requestCount += 1;

    if (requestCount === 1) {
      return `
        <!doctype html>
        <html lang="en">
          <head>
            <title>Refresh page</title>
            <meta http-equiv="refresh" content="360">
          </head>
          <body>
            <main><h1>Refresh page</h1></main>
          </body>
        </html>
      `;
    }

    return `
      <!doctype html>
      <html lang="en">
        <head><title>Ready page</title></head>
        <body>
          <main>
            <h1>Ready page</h1>
            <input type="text">
          </main>
        </body>
      </html>
    `;
  });

  try {
    const result = await scanUrl(url);

    assert.equal(result.metadata?.warnings, undefined);
    assert.equal(
      result.issues.some((issue) => issue.id === 'label'),
      true,
    );
  } finally {
    await closeServer(server);
  }
});

test('allows a URL scan with refresh warnings when the page has meaningful findings', async () => {
  let requestCount = 0;
  const { server, url } = await listenWithHandler(() => {
    requestCount += 1;

    return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>Real page with refresh metadata</title>
          <meta http-equiv="refresh" content="360">
        </head>
        <body>
          <main>
            <h1>Real page with content</h1>
            <input type="text">
          </main>
        </body>
      </html>
    `;
  });

  try {
    const result = await scanUrl(url);

    assert.equal(requestCount, 1);
    assert.equal(result.metadata?.warnings?.length, 1);
    assert.equal(
      result.issues.some((issue) => issue.id === 'label'),
      true,
    );
  } finally {
    await closeServer(server);
  }
});

test('allows a short meta refresh to resolve naturally', async () => {
  const { server, url } = await listenWithHandler((request) => {
    if (request.url === '/ready') {
      return `
        <!doctype html>
        <html lang="en">
          <head><title>Ready page</title></head>
          <body>
            <main>
              <h1>Ready page</h1>
              <input type="text">
            </main>
          </body>
        </html>
      `;
    }

    return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>Moving to ready page</title>
          <meta http-equiv="refresh" content="0.2; url=/ready">
        </head>
        <body><main><h1>Loading</h1></main></body>
      </html>
    `;
  });

  try {
    const result = await scanUrl(url);

    assert.equal(new URL(result.url).pathname, '/ready');
    assert.equal(result.metadata?.warnings, undefined);
    assert.equal(
      result.issues.some((issue) => issue.id === 'label'),
      true,
    );
  } finally {
    await closeServer(server);
  }
});

test('retries the original target after a redirect to a challenge URL', async () => {
  let targetRequests = 0;
  const { server, url } = await listenWithHandler((request) => {
    if (request.url === '/challenge') {
      return `
        <!doctype html>
        <html lang="en">
          <head>
            <title>Checking your browser</title>
            <meta http-equiv="refresh" content="360">
          </head>
          <body><main><h1>Checking your browser</h1></main></body>
        </html>
      `;
    }

    targetRequests += 1;
    if (targetRequests === 1) {
      return `
        <!doctype html>
        <html lang="en">
          <head><title>Redirecting</title></head>
          <body>
            <main><h1>Redirecting</h1></main>
            <script>window.location.replace('/challenge');</script>
          </body>
        </html>
      `;
    }

    return `
      <!doctype html>
      <html lang="en">
        <head><title>Ready target</title></head>
        <body>
          <main>
            <h1>Ready target</h1>
            <input type="text">
          </main>
        </body>
      </html>
    `;
  });

  try {
    const result = await scanUrl(url);

    assert.equal(targetRequests, 2);
    assert.equal(new URL(result.url).pathname, '/');
    assert.equal(result.metadata?.warnings, undefined);
    assert.equal(
      result.issues.some((issue) => issue.id === 'label'),
      true,
    );
  } finally {
    await closeServer(server);
  }
});

test('retries a persistent refresh placeholder with a fresh browser context', async () => {
  let targetRequests = 0;
  const { server, url } = await listenWithHandler((request) => {
    targetRequests += 1;
    const hasChallengeCookie = request.headers.cookie?.includes('challenge-session=1');

    if (targetRequests === 1 || hasChallengeCookie) {
      return `
        <!doctype html>
        <html lang="en">
          <head>
            <title>Refresh page</title>
            <meta http-equiv="refresh" content="360">
          </head>
          <body>
            <main><h1>Refresh page</h1></main>
            <script>document.cookie = 'challenge-session=1; path=/'</script>
          </body>
        </html>
      `;
    }

    return `
      <!doctype html>
      <html lang="en">
        <head><title>Fresh session ready</title></head>
        <body>
          <main>
            <h1>Fresh session ready</h1>
            <input type="text">
          </main>
        </body>
      </html>
    `;
  });

  try {
    const result = await scanUrl(url);

    assert.equal(result.metadata?.warnings, undefined);
    assert.equal(
      result.issues.some((issue) => issue.id === 'label'),
      true,
    );
  } finally {
    await closeServer(server);
  }
});

test('reuses a successful public site session for a later scan', async () => {
  let requestCount = 0;
  const { server, url } = await listenWithResponseHandler((request, response) => {
    if (request.url !== '/') {
      response.writeHead(404);
      response.end();
      return;
    }

    requestCount += 1;
    const hasTrustedCookie = request.headers.cookie?.includes('trusted-scan=1');
    const isFirstRequest = requestCount === 1;

    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      ...(isFirstRequest ? { 'set-cookie': 'trusted-scan=1; Path=/; HttpOnly; SameSite=Lax' } : {}),
    });

    if (!isFirstRequest && !hasTrustedCookie) {
      response.end(`
        <!doctype html>
        <html lang="en">
          <head>
            <title>Refresh page</title>
            <meta http-equiv="refresh" content="360">
          </head>
          <body><main><h1>Refresh page</h1></main></body>
        </html>
      `);
      return;
    }

    response.end(`
      <!doctype html>
      <html lang="en">
        <head><title>Trusted page</title></head>
        <body>
          <main>
            <h1>Trusted page</h1>
            <input type="text">
          </main>
        </body>
      </html>
    `);
  });

  try {
    const first = await scanUrl(url);
    const second = await scanUrl(url);

    assert.equal(first.metadata?.warnings, undefined);
    assert.equal(second.metadata?.warnings, undefined);
    assert.equal(requestCount, 2);
  } finally {
    await closeServer(server);
  }
});

test('fails clearly when a URL scan lands on an access-denied page', async () => {
  const { server, url } = await listen(`
    <!doctype html>
    <html lang="en">
      <head><title>Access Denied</title></head>
      <body>
        <h1>Access Denied</h1>
        You don't have permission to access "http://www.tui.co.uk/" on this server.
        <p>https://errors.edgesuite.net/18.example</p>
      </body>
    </html>
  `);

  try {
    await assert.rejects(() => scanUrl(url), {
      message: BLOCKED_SCAN_PAGE_ERROR,
    });
  } finally {
    await closeServer(server);
  }
});

test('waits for delayed client-rendered accessible names before running axe', async () => {
  const { server, url } = await listen(`
    <!doctype html>
    <html lang="en">
      <head><title>Hydrating links</title></head>
      <body>
        <main>
          <h1>Offers</h1>
          <a id="delayed-link" href="/offers"></a>
        </main>
        <script>
          window.setTimeout(() => {
            document.querySelector('#delayed-link').textContent = 'View current offers';
          }, 1_000);
        </script>
      </body>
    </html>
  `);

  try {
    const result = await scanUrl(url);

    assert.equal(
      result.issues.some((issue) => issue.id === 'link-name'),
      false,
    );
  } finally {
    await closeServer(server);
  }
});
