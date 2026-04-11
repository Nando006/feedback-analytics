/**
 * Garante que o valor e um objeto literal utilizavel.
 * Serve como base para validacoes de payload sem depender de bibliotecas externas.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}