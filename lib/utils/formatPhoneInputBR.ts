import { digitsOnly } from './digitsOnly';

export function formatPhoneInputBR(raw: string): string {
  const d = digitsOnly(raw).slice(0, 13); // 55 + 11
  const only = d.startsWith('55') ? d : `55${d}`;
  const country = '+55';
  const local = only.slice(2);
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);

  if (rest.length <= 4) {
    return `${country} (${ddd}${rest ? `) ${rest}` : ')'}`;
  }

  if (rest.length <= 9) {
    return `${country} (${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
  }

  return `${country} (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}
