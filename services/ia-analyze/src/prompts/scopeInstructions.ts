import type { IaAnalyzeScopeType } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import type { ScopeInstructionsByType } from '../../types/iaAnalyzePromptBuilders.types.js';

/**
 * Instruções específicas para cada tipo de escopo de análise.
 *
 * Define orientações para o modelo de IA priorizar categorias e comportamentos
 * diferentes conforme o contexto: empresa, produto, serviço ou departamento.
 *
 * Ajuda a IA a focar nos aspectos mais relevantes de cada cenário.
 */
const INSTRUCTIONS_BY_SCOPE: ScopeInstructionsByType = {
  COMPANY: [
    'Contexto: feedbacks gerais da empresa (visao ampla da experiencia).',
    'Priorize categorias como atendimento, comunicacao, preco, ambiente, experiencia geral e confianca.',
    'Considere respostas dinamicas apenas como sinal auxiliar de polaridade, sem copiar rotulos para categorias/keywords.',
  ],
  PRODUCT: [
    'Contexto: feedbacks de produto especifico.',
    'Priorize categorias como qualidade, durabilidade, custo-beneficio, funcionalidades e embalagem.',
    'Use o nome/descricao do produto e respostas dinamicas apenas para enriquecer contexto da analise textual.',
  ],
  SERVICE: [
    'Contexto: feedbacks de servico especifico.',
    'Priorize categorias como tempo de resposta, eficiencia, cordialidade, clareza e resolucao de problemas.',
    'Considere respostas dinamicas apenas para apoiar inferencias do texto, sem virar palavras-chave literais.',
  ],
  DEPARTMENT: [
    'Contexto: feedbacks de departamento/setor especifico.',
    'Priorize categorias como processo interno, comunicacao da equipe, agilidade e qualidade da interacao.',
    'Use respostas dinamicas para apoiar recomendacoes praticas, mas extraia termos prioritariamente da descricao.',
  ],
};


/**
 * Retorna as instruções específicas para o tipo de escopo informado.
 *
 * Ajuda a montar o prompt correto para cada contexto de análise.
 */
export function getScopeInstructions(scopeType: IaAnalyzeScopeType): string[] {
  return INSTRUCTIONS_BY_SCOPE[scopeType];
}
