export type Sentiment = 'positive' | 'neutral' | 'negative';

export function sentimentLabel(sentiment: Sentiment): string {
  if (sentiment === 'positive') return 'Positivo';
  if (sentiment === 'negative') return 'Negativo';
  return 'Neutro';
}
