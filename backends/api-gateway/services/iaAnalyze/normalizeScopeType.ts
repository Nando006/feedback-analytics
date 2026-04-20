import type {
  IaAnalyzeScopeType,
} from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

/**
 * Normaliza o tipo de escopo recebido, garantindo um valor válido.
 *
 * Converte a string para maiúsculo e retorna um dos tipos aceitos:
 * 'PRODUCT', 'SERVICE', 'DEPARTMENT' ou, por padrão, 'COMPANY'.
 *
 * Útil para evitar erros de digitação/capitalização e garantir consistência nos filtros.
 */
export function normalizeScopeType(kind: string | null | undefined): IaAnalyzeScopeType {
  const normalized = String(kind ?? '').toUpperCase();

  if (normalized === 'PRODUCT') return 'PRODUCT';
  if (normalized === 'SERVICE') return 'SERVICE';
  if (normalized === 'DEPARTMENT') return 'DEPARTMENT';
  return 'COMPANY';
}