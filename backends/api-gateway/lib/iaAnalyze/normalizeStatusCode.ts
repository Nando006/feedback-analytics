export function normalizeStatusCode(status: number): number {
  if (status >= 400 && status <= 599) {
    return status;
  }

  return 502;
}
