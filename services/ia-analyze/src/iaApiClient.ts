import { GoogleGenAI } from '@google/genai';
import { buildIaPromptByScope } from './iaAnalyzePromptBuilders.js';
import { extractJsonFromText } from '../lib/extractJsonFromText.js';
import type {
  IaAnalyzeEnterpriseContext,
  IaAnalyzeFeedbackInput,
  IaAnalyzeInsights,
  IaAnalyzeRemoteFeedbackAnalysis,
  IaAnalyzeScopeType,
} from '../../../shared/lib/interfaces/contracts/ia-analyze.contract.js';

export type ParsedIaResponse = {
  feedbacks?: IaAnalyzeRemoteFeedbackAnalysis[];
  global_insights?: IaAnalyzeInsights;
};

export class IaApiClientError extends Error {
  public code: 'failed_ia_request' | 'invalid_ai_response';

  constructor(message: string, code: 'failed_ia_request' | 'invalid_ai_response') {
    super(message);
    this.code = code;
  }
}

export type AnalyzeBatchWithIaParams = {
  scopeType: IaAnalyzeScopeType;
  enterpriseContext: IaAnalyzeEnterpriseContext;
  feedbacks: IaAnalyzeFeedbackInput[];
};

export type IaApiClient = {
  analyzeBatch: (params: AnalyzeBatchWithIaParams) => Promise<ParsedIaResponse>;
};

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

        type AiResponseShape = {
          text?: string | (() => string);
        };

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
