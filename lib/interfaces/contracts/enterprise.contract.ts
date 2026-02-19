/**
 * Resposta mínima de empresa usada na validação de QR Code.
 * Usado em: src/services/serviceEnterprise.ts.
 */
export interface EnterpriseContractResponse {
  id: string;
  name: string;
}

/**
 * Resposta de erro ao consultar empresa.
 * Usado em: contratos de erro do fluxo em src/services/serviceEnterprise.ts.
 */
export interface EnterpriseContractErrorResponse {
  error: string;
}