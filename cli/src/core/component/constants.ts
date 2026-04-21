export const COMPONENT_SCAN_PROFILE = 'component';

export const COMPONENT_SCAN_SELECTOR = '#root';

export const COMPONENT_SCAN_DISABLED_RULES = [
  'landmark-one-main',
  'page-has-heading-one',
  'region',
];

export const COMPONENT_SUPPORTED_EXTENSIONS = new Set([
  '.tsx',
  '.jsx',
  '.ts',
  '.js',
]);

export const COMPONENT_TEMP_DIR_PREFIX = 'axiony-component-';

export const COMPONENT_HARNESS_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Axiony Component Scan</title></head><body><div id="root"></div></body></html>';

export const MISSING_REACT_DEPENDENCIES_MESSAGE =
  'React dependencies were not found. Install react and react-dom in the target project.';

export const COMPONENT_RENDER_TIMEOUT_ERROR =
  'Component could not be rendered with zero-config mode';
