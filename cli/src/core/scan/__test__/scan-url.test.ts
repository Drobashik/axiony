import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { scanUrl } from '../scan-url';
import { POSSIBLE_CHALLENGE_PAGE_WARNING } from '../page-readiness';

const listen = async (
  html: string,
): Promise<{ server: Server; url: string }> => {
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

test('warns when URL scan lands on a meta-refresh page', async () => {
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
    const result = await scanUrl(url);

    assert.deepEqual(result.metadata?.warnings, [
      POSSIBLE_CHALLENGE_PAGE_WARNING,
    ]);
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
