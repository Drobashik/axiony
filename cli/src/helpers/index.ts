export const validateUrl = (value: string) => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }

  const isHttpProtocol =
    parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';

  if (!isHttpProtocol) {
    throw new Error(
      `Invalid URL protocol: ${parsedUrl.protocol}. Please use http:// or https://`,
    );
  }
};
