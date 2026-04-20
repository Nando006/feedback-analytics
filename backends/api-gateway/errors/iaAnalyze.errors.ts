/**
 * Erro customizado para falhas no serviço de análise IA.
 *
 * Permite informar status HTTP e código de erro além da mensagem,
 * facilitando o tratamento padronizado de erros em toda a aplicação.
 *
 * Usado para diferenciar falhas do serviço IA de outros erros genéricos.
 */
export class IaAnalyzeServiceError extends Error {
  public statusCode: number;

  public code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
