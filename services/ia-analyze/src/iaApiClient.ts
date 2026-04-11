import { GoogleGenAI } from '@google/genai';
import { buildIaPromptByScope } from './iaAnalyzePromptBuilders.js';
import { extractJsonFromText } from '../lib/extractJsonFromText.js';
import type {
  AiResponseShape,
  AnalyzeBatchWithIaParams,
  IaApiClient,
  IaApiClientErrorCode,
  ParsedIaResponse,
} from '../types/iaApiClient.types.js';

export class IaApiClientError extends Error {
  public code: IaApiClientErrorCode;

  constructor(message: string, code: IaApiClientErrorCode) {
    super(message);
    this.code = code;
  }
}

/**
 * Cria um cliente de IA com API key fixa para a execucao atual.
 * Serve para reutilizar a conexao com o modelo ao longo dos batches.
 */
export function createIaApiClient(apiKey: string): IaApiClient {
  const ai = new GoogleGenAI({ apiKey });

  return {
    /**
     * Envia um batch para o modelo e devolve a resposta parseada em JSON.
     * Serve para encapsular prompt, chamada do modelo e parser em um unico ponto.
     */
    async analyzeBatch(params: AnalyzeBatchWithIaParams): Promise<ParsedIaResponse> {
      const prompt = buildIaPromptByScope({
        scopeType: params.scopeType,
        enterpriseContext: params.enterpriseContext,
        feedbacks: params.feedbacks,
      });

      let rawText = '';

      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const maybeText = (aiResponse as AiResponseShape).text;
        rawText = (typeof maybeText === 'function' ? maybeText() : maybeText) ?? '';
      } catch {
        throw new IaApiClientError(
          'Failed to call model API',
          'failed_ia_request',
        );
      }

      try {
        const jsonString = extractJsonFromText(rawText);
        return JSON.parse(jsonString) as ParsedIaResponse;
      } catch {
        throw new IaApiClientError(
          'Invalid AI response JSON',
          'invalid_ai_response',
        );
      }
    },
  };
}
