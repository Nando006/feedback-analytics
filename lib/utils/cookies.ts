export const setCookie = (
  key: string,
  value: string,
  days: number = 365,
  path: string = '/',
): void => {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  ).toUTCString();
  const encodedKey = encodeURIComponent(key);
  const encodedValue = encodeURIComponent(value);

  document.cookie = `${encodedKey}=${encodedValue}; expires=${expires}; path=${path}`;
};

export const getCookie = (key: string): string | null => {
  const encodedKey = encodeURIComponent(key);
  const entries = document.cookie ? document.cookie.split('; ') : [];

  for (const entry of entries) {
    const [name, ...rest] = entry.split('=');
    if (name === encodedKey) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
};
