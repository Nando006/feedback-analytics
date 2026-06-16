/**
 * Avaliação de classificador (sentimento da IA vs rótulos humanos).
 *
 * Funções PURAS para medir a confiabilidade da extração: Cohen's kappa
 * (concordância além do acaso), matriz de confusão e precision/recall/F1 por
 * classe + macro-F1. Base honesta para afirmar qualidade e pegar regressões a
 * cada mudança de prompt/modelo. Referência das faixas: Landis & Koch (1977).
 */

export type LabeledPair = { model: string; human: string };

export type ConfusionMatrix = {
  labels: string[];
  /** matrix[human][model] = contagem. */
  matrix: Record<string, Record<string, number>>;
};

function collectLabels(pairs: LabeledPair[]): string[] {
  const set = new Set<string>();
  for (const p of pairs) {
    set.add(p.human);
    set.add(p.model);
  }
  return Array.from(set).sort();
}

export function buildConfusionMatrix(pairs: LabeledPair[]): ConfusionMatrix {
  const labels = collectLabels(pairs);
  const matrix: Record<string, Record<string, number>> = {};
  for (const human of labels) {
    matrix[human] = {};
    for (const model of labels) matrix[human][model] = 0;
  }
  for (const p of pairs) matrix[p.human][p.model] += 1;
  return { labels, matrix };
}

/** Cohen's kappa = (Po − Pe) / (1 − Pe). Retorna 0 para amostra vazia. */
export function cohensKappa(pairs: LabeledPair[]): number {
  const n = pairs.length;
  if (n === 0) return 0;

  const labels = collectLabels(pairs);
  const humanCount: Record<string, number> = {};
  const modelCount: Record<string, number> = {};
  for (const label of labels) {
    humanCount[label] = 0;
    modelCount[label] = 0;
  }

  let agree = 0;
  for (const p of pairs) {
    if (p.human === p.model) agree += 1;
    humanCount[p.human] += 1;
    modelCount[p.model] += 1;
  }

  const po = agree / n;
  let pe = 0;
  for (const label of labels) {
    pe += (humanCount[label] / n) * (modelCount[label] / n);
  }

  if (pe === 1) return 1;
  return (po - pe) / (1 - pe);
}

export type ClassMetric = {
  label: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
};

export type ClassMetricsResult = {
  perClass: ClassMetric[];
  macroF1: number;
  accuracy: number;
};

export function classMetrics(pairs: LabeledPair[]): ClassMetricsResult {
  const labels = collectLabels(pairs);
  const perClass: ClassMetric[] = labels.map((label) => {
    let tp = 0;
    let fp = 0;
    let fn = 0;
    let support = 0;
    for (const p of pairs) {
      const isHuman = p.human === label;
      const isModel = p.model === label;
      if (isHuman) support += 1;
      if (isHuman && isModel) tp += 1;
      else if (!isHuman && isModel) fp += 1;
      else if (isHuman && !isModel) fn += 1;
    }
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    return { label, precision, recall, f1, support };
  });

  const correct = pairs.reduce((sum, p) => sum + (p.human === p.model ? 1 : 0), 0);
  const macroF1 =
    perClass.length === 0 ? 0 : perClass.reduce((sum, c) => sum + c.f1, 0) / perClass.length;
  const accuracy = pairs.length === 0 ? 0 : correct / pairs.length;

  return { perClass, macroF1, accuracy };
}

export type KappaBand =
  | 'none'
  | 'slight'
  | 'fair'
  | 'moderate'
  | 'substantial'
  | 'almost_perfect';

/** Faixas de Landis & Koch para interpretar o kappa. */
export function interpretKappa(kappa: number): KappaBand {
  if (kappa < 0) return 'none';
  if (kappa <= 0.2) return 'slight';
  if (kappa <= 0.4) return 'fair';
  if (kappa <= 0.6) return 'moderate';
  if (kappa <= 0.8) return 'substantial';
  return 'almost_perfect';
}
