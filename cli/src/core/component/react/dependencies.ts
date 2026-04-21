import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { MISSING_REACT_DEPENDENCIES_MESSAGE } from '../constants';
import type { ReactDependencyPaths } from './types';

export const resolveReactDependencies = (
  componentPath: string,
): ReactDependencyPaths => {
  const componentRequire = createRequire(
    join(dirname(componentPath), 'package.json'),
  );

  try {
    return {
      react: componentRequire.resolve('react'),
      reactDom: componentRequire.resolve('react-dom'),
      reactDomClient: componentRequire.resolve('react-dom/client'),
    };
  } catch (error) {
    const dependencyError = new Error(
      MISSING_REACT_DEPENDENCIES_MESSAGE,
    ) as Error & { cause?: unknown };
    dependencyError.cause = error;
    throw dependencyError;
  }
};
