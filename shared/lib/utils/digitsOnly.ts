export function digitsOnly(value: string): string {
  return (value || '').replace(/\D+/g, '');
}
