import type { ConfidenceTier, Interval } from 'lib/interfaces/domain/feedback.domain';

/**
 * Formatação e rótulos para as métricas estatísticas das análises.
 * A MATEMÁTICA vive no backend (libs/statistics); aqui só apresentamos.
 */

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/** Net Sentiment Score com sinal explícito (+40, -12, 0). */
export function formatNss(nss: number): string {
  const rounded = Math.round(nss);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

/** IC vindo em fração (0..1) → "31–50%". */
export function formatFractionIntervalPct(ci: Interval, decimals = 0): string {
  return `${(ci.lower * 100).toFixed(decimals)}–${(ci.upper * 100).toFixed(decimals)}%`;
}

/** IC já na unidade do campo (ex.: nota 1-5 ou %); `suffix` opcional. */
export function formatInterval(ci: Interval, decimals = 1, suffix = ''): string {
  return `${ci.lower.toFixed(decimals)}–${ci.upper.toFixed(decimals)}${suffix}`;
}

export const CONFIDENCE_TIER_LABEL: Record<ConfidenceTier, string> = {
  insufficient: 'Dados insuficientes',
  low: 'Confiança baixa',
  moderate: 'Confiança média',
  good: 'Confiança alta',
};

/** Classes utilitárias (borda/fundo/texto) por camada de confiança. */
export const CONFIDENCE_TIER_TONE: Record<ConfidenceTier, string> = {
  insufficient: 'border-(--negative)/40 bg-(--negative)/10 text-(--negative)',
  low: 'border-(--neutral)/40 bg-(--neutral)/10 text-(--neutral)',
  moderate: 'border-(--primary-color)/40 bg-(--primary-color)/10 text-(--primary-color)',
  good: 'border-(--positive)/40 bg-(--positive)/10 text-(--positive)',
};

/** NSS é instável em amostra pequena: só exibir o número com n suficiente. */
export function shouldShowNss(tier: ConfidenceTier | undefined): boolean {
  return tier === 'moderate' || tier === 'good';
}

export type ClimateTone = 'positive' | 'neutral' | 'negative';

export type Climate = {
  label: string;
  tone: ClimateTone;
  description: string;
};

/**
 * Clima emocional a partir do Net Sentiment Score (substitui o voto majoritário).
 * Banda neutra de ±5 para não ler ruído como tendência; sem dados/insuficiente
 * retorna estado explícito.
 */
export function climateFromNss(
  nss: number | undefined,
  tier: ConfidenceTier | undefined,
  total: number,
): Climate {
  if (total === 0 || tier === 'insufficient' || nss == null) {
    return {
      label: 'Dados insuficientes',
      tone: 'neutral',
      description:
        'Ainda não há feedbacks analisados suficientes para determinar o clima com confiança.',
    };
  }
  if (nss > 5) {
    return {
      label: 'Clima Positivo',
      tone: 'positive',
      description:
        'Há mais comentários positivos do que negativos no escopo selecionado.',
    };
  }
  if (nss < -5) {
    return {
      label: 'Clima de Atenção',
      tone: 'negative',
      description:
        'Há mais comentários negativos do que positivos: pontos que pedem ação.',
    };
  }
  return {
    label: 'Clima Neutro',
    tone: 'neutral',
    description:
      'Comentários positivos e negativos estão equilibrados.',
  };
}

/**
 * O QUE o `n` da confiança está contando — deixa explícito se a amostra é granular
 * (respostas de UMA pergunta) ou geral (feedbacks do escopo / analisados pela IA),
 * evitando a confusão entre, ex., "21 respostas a esta pergunta" e "20 analisados".
 */
export type ConfidenceSampleUnit = 'feedbacks' | 'respostas' | 'analyzed';

/** Sufixo curto exibido no selo: "21 feedbacks" / "21 respostas" / "20 analisados pela IA". */
export function confidenceCountSuffix(n: number, unit: ConfidenceSampleUnit): string {
  if (unit === 'respostas') return `${n} resposta${n === 1 ? '' : 's'}`;
  if (unit === 'analyzed') return `${n} analisado${n === 1 ? '' : 's'} pela IA`;
  return `${n} feedback${n === 1 ? '' : 's'}`;
}

/** Frase do modal que explica a origem da amostra daquele resultado. */
export function confidenceSampleSentence(n: number, unit: ConfidenceSampleUnit): string {
  if (unit === 'respostas') {
    return `Esta pergunta recebeu ${n} resposta${n === 1 ? '' : 's'} — a confiança é calculada só com base nelas.`;
  }
  if (unit === 'analyzed') {
    return `A IA analisou ${n} feedback${n === 1 ? '' : 's'} para este resultado (pode ser menor que o total, pois feedbacks novos ainda não foram analisados).`;
  }
  return `Este resultado considera ${n} feedback${n === 1 ? '' : 's'} recebido${n === 1 ? '' : 's'}.`;
}
