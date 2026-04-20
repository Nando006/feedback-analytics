import { isObject } from '../isObject.js';

export async function parseJsonSafe(response: Response) {
  try {
    const payload = (await response.json()) as unknown;
    return isObject(payload) ? payload : null;
  } catch {
    return null;
  }
}
