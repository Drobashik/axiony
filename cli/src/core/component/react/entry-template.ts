import type { ComponentExportSelection } from '../types';
import type { ReactDependencyPaths } from './types';
import { toBrowserImportPath } from './path';

const selectedComponentExpression = (
  selection: ComponentExportSelection,
): string =>
  selection.kind === 'default'
    ? 'ComponentModule.default'
    : `ComponentModule[${JSON.stringify(selection.exportName)}]`;

export const createReactRenderEntry = (
  componentPath: string,
  selection: ComponentExportSelection,
  dependencies: ReactDependencyPaths,
): string => `
import React from ${JSON.stringify(toBrowserImportPath(dependencies.react))};
import { flushSync } from ${JSON.stringify(toBrowserImportPath(dependencies.reactDom))};
import { createRoot } from ${JSON.stringify(toBrowserImportPath(dependencies.reactDomClient))};

const setStatus = (status) => {
  window.__AXIONY_COMPONENT_RENDER__ = status;
};

const messageFromError = (error) =>
  error instanceof Error ? error.message : 'unknown render error';

const componentRenderErrorMessage = (error) =>
  [
    'Component could not be rendered with zero-config mode: it may require props, providers, or runtime context.',
    'Create a small wrapper component, for example Component.axiony.jsx, and pass required props or providers there.',
    \`Cause: \${messageFromError(error)}\`,
  ].join('\\n');

const renderFailure = (error) => {
  setStatus({
    ok: false,
    message: componentRenderErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
};

class AxionyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    renderFailure(error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const CommitProbe = () => {
  React.useEffect(() => {
    if (!window.__AXIONY_COMPONENT_RENDER__) {
      setStatus({ ok: true });
    }
  }, []);

  return null;
};

const render = async () => {
  try {
    const ComponentModule = await import(${JSON.stringify(toBrowserImportPath(componentPath))});
    const Component = ${selectedComponentExpression(selection)};

    if (typeof Component !== 'function') {
      setStatus({ ok: false, message: 'no React component export found' });
      return;
    }

    const rootElement = document.getElementById('root');

    if (!rootElement) {
      throw new Error('render root was not found');
    }

    const root = createRoot(rootElement, {
      onCaughtError: renderFailure,
      onUncaughtError: renderFailure,
    });
    flushSync(() => {
      root.render(
        React.createElement(
          AxionyErrorBoundary,
          null,
          React.createElement(Component, {}),
          React.createElement(CommitProbe),
        ),
      );
    });
  } catch (error) {
    renderFailure(error);
  }
};

render();
`;
