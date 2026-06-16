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
  low: 'Baixa confiança',
  moderate: 'Confiança moderada',
  good: 'Boa confiança',
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
        'O sentimento líquido (positivos − negativos) está favorável no escopo selecionado.',
    };
  }
  if (nss < -5) {
    return {
      label: 'Clima de Atenção',
      tone: 'negative',
      description:
        'O sentimento líquido está negativo: há pontos críticos que pedem ação.',
    };
  }
  return {
    label: 'Clima Neutro',
    tone: 'neutral',
    description:
      'Positivos e negativos se equilibram; sentimento líquido próximo de zero.',
  };
}
