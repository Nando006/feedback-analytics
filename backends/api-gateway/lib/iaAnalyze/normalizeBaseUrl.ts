export function normalizeBaseUrl(rawValue: string): string | null {
  const value = String(rawValue ?? '').trim();

  if (!value) {
    return null;
  }

  return value.replace(/\/+$/, '');
}
