export const validateUrl = (value: string) => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('Invalid URL. Use a full http:// or https:// URL.');
  }

  const isHttpProtocol =
    parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';

  if (!isHttpProtocol) {
    throw new Error('Invalid URL. Use a full http:// or https:// URL.');
  }
};
