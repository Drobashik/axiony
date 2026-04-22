export type BrowserRenderResult = { ok: true } | { ok: false; message: string; stack?: string };

export type ReactComponentBundle = {
  scriptPath: string;
  sourceMapPath: string;
};

export type ReactDependencyPaths = {
  react: string;
  reactDom: string;
  reactDomClient: string;
};
