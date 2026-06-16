/**
 * Estatística para análise de feedback — métodos comprovados de mercado.
 *
 * Funções PURAS (sem efeitos colaterais), testáveis isoladamente. A camada de
 * controllers usa estas funções para enriquecer as respostas de stats/análise.
 *
 * Referências: Net Sentiment Score (Thematic), Net Satisfaction / CSAT Top-2-Box
 * (Qualtrics/ACSI), intervalo de Wilson (Brown, Cai & DasGupta 2001), intervalo t
 * para média, camadas de confiança (Cochran), média Bayesiana (IMDb).
 */

/** Intervalo (limites inferior/superior). A UNIDADE depende do contexto do campo. */
export type Interval = { lower: number; upper: number };

/** Camada de confiança derivada do tamanho da amostra (n). */
export type ConfidenceTier = 'insufficient' | 'low' | 'moderate' | 'good';

/** z para 95% bicaudal. */
const Z_95 = 1.959963984540054;

/** Valores críticos de t (95% bicaudal) por graus de liberdade 1..30; acima usa z. */
const T_95: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365,
  8: 2.306, 9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179, 13: 2.16, 14: 2.145,
  15: 2.131, 16: 2.12, 17: 2.11, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.08,
  22: 2.074, 23: 2.069, 24: 2.064, 25: 2.06, 26: 2.056, 27: 2.052, 28: 2.048,
  29: 2.045, 30: 2.042,
};

function tCritical(df: number): number {
  if (df <= 0) return Z_95;
  if (df <= 30) return T_95[df];
  return Z_95;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Intervalo de confiança de Wilson (95% por padrão) para uma proporção x/n.
 * Retorna fração em [0,1]. Preciso em n pequeno e perto de 0/1 (ao contrário do
 * Wald). Use `pctInterval` para já obter em porcentagem.
 */
export function wilsonInterval(x: number, n: number, z = Z_95): Interval {
  if (n <= 0) return { lower: 0, upper: 0 };
  const p = x / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return {
    lower: Math.max(0, (centre - margin) / denom),
    upper: Math.min(1, (centre + margin) / denom),
  };
}

/** Limite inferior de Wilson — chave de ranking justa para amostras pequenas. */
export function wilsonLowerBound(x: number, n: number, z = Z_95): number {
  if (n <= 0) return 0;
  return wilsonInterval(x, n, z).lower;
}

/** Intervalo de Wilson já em porcentagem (0..100), arredondado a 1 casa. */
export function pctInterval(x: number, n: number, z = Z_95): Interval {
  const ci = wilsonInterval(x, n, z);
  return { lower: round(ci.lower * 100, 1), upper: round(ci.upper * 100, 1) };
}

/** Net Sentiment Score = (pos - neg)/total * 100 → [-100, 100]. */
export function netSentimentScore(positive: number, negative: number, total: number): number {
  if (total <= 0) return 0;
  return round(((positive - negative) / total) * 100, 1);
}

/** Net Satisfaction = %(top-2) − %(bottom-2) → [-100, 100]. */
export function netSatisfaction(top2: number, bottom2: number, total: number): number {
  if (total <= 0) return 0;
  return round(((top2 - bottom2) / total) * 100, 1);
}

/** Camada de confiança pelo n (Cochran): <10 insuficiente, <30 baixa, <100 moderada, senão boa. */
export function confidenceTier(n: number): ConfidenceTier {
  if (n < 10) return 'insufficient';
  if (n < 30) return 'low';
  if (n < 100) return 'moderate';
  return 'good';
}

export type RatingStats = {
  n: number;
  mean: number;
  sd: number;
  se: number;
  /** IC t da média, em unidades de nota e clampado em [1,5]. */
  ci: Interval;
};

/**
 * Estatística de notas 1..5 a partir das contagens por nota.
 * `counts` é um mapa { 1: n1, ..., 5: n5 } (chaves ausentes = 0).
 */
export function ratingStats(counts: Record<number, number>): RatingStats {
  let n = 0;
  let sum = 0;
  for (let k = 1; k <= 5; k++) {
    const c = counts[k] ?? 0;
    n += c;
    sum += k * c;
  }
  if (n === 0) return { n: 0, mean: 0, sd: 0, se: 0, ci: { lower: 0, upper: 0 } };

  const mean = sum / n;
  let ssd = 0;
  for (let k = 1; k <= 5; k++) {
    ssd += (counts[k] ?? 0) * (k - mean) ** 2;
  }
  const variance = n > 1 ? ssd / (n - 1) : 0;
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);
  const margin = tCritical(n - 1) * se;

  return {
    n,
    mean: round(mean, 2),
    sd: round(sd, 3),
    se: round(se, 3),
    ci: {
      lower: round(Math.max(1, mean - margin), 2),
      upper: round(Math.min(5, mean + margin), 2),
    },
  };
}

export type CsatResult = {
  /** % satisfeitos (notas 4-5), 0..100. */
  pct: number;
  /** IC de Wilson em porcentagem (0..100). */
  ci: Interval;
};

/** CSAT Top-2-Box: % de notas 4-5 sobre o total, com IC de Wilson. */
export function csatTopTwoBox(counts: Record<number, number>): CsatResult {
  let n = 0;
  let top2 = 0;
  for (let k = 1; k <= 5; k++) {
    const c = counts[k] ?? 0;
    n += c;
    if (k >= 4) top2 += c;
  }
  if (n === 0) return { pct: 0, ci: { lower: 0, upper: 0 } };
  return { pct: round((top2 / n) * 100, 1), ci: pctInterval(top2, n) };
}

/**
 * Média Bayesiana (encolhimento estilo IMDb) — puxa a média de um item com
 * poucos votos em direção à média global. WR = (v·R + m·C)/(v + m).
 * v = nº de votos do item, R = média do item, C = média global (prior),
 * m = força do prior (nº de "votos" equivalentes).
 */
export function bayesianAverage(
  itemMean: number,
  itemCount: number,
  globalMean: number,
  m: number,
): number {
  if (itemCount + m <= 0) return round(globalMean, 2);
  return round((itemCount * itemMean + m * globalMean) / (itemCount + m), 2);
}
