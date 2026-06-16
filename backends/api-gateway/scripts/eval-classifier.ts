/**
 * Avalia a concordância da IA com rótulos humanos (gold set).
 *
 * Uso:
 *   npx tsx backends/api-gateway/scripts/eval-classifier.ts <gold.json>
 *
 * O <gold.json> é um array de pares: [{ "human": "positive", "model": "positive", "feedback_id"?: "..." }, ...]
 * onde "human" é o rótulo humano e "model" é o sentimento que a IA gravou para o mesmo feedback.
 * Monte-o exportando feedback_analysis.sentiment e rotulando uma amostra à mão
 * (recomendado: ≥150–300 itens, ≥50 por classe; meta de kappa ≥ 0,6).
 */
import { readFileSync } from 'node:fs';
import {
  cohensKappa,
  buildConfusionMatrix,
  classMetrics,
  interpretKappa,
  type LabeledPair,
} from '../src/libs/eval/classifierEval.js';

function loadPairs(path: string): LabeledPair[] {
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(raw)) {
    throw new Error('O arquivo deve conter um array de pares { human, model }.');
  }
  return raw
    .map((entry) => entry as { model?: unknown; human?: unknown })
    .filter((entry) => typeof entry.model === 'string' && typeof entry.human === 'string')
    .map((entry) => ({ model: String(entry.model), human: String(entry.human) }));
}

function main(): void {
  const path = process.argv[2];
  if (!path) {
    console.error('Uso: npx tsx backends/api-gateway/scripts/eval-classifier.ts <gold.json>');
    process.exitCode = 1;
    return;
  }

  const pairs = loadPairs(path);
  if (pairs.length === 0) {
    console.error('Nenhum par { human, model } válido encontrado no arquivo.');
    process.exitCode = 1;
    return;
  }

  const kappa = cohensKappa(pairs);
  const { labels, matrix } = buildConfusionMatrix(pairs);
  const { perClass, macroF1, accuracy } = classMetrics(pairs);

  console.log(`\nPares avaliados: ${pairs.length}`);
  console.log(`Cohen's kappa: ${kappa.toFixed(3)} (${interpretKappa(kappa)})`);
  console.log(`Acuracia: ${(accuracy * 100).toFixed(1)}%  |  Macro-F1: ${macroF1.toFixed(3)}`);

  console.log('\nMatriz de confusao (linha=humano, coluna=modelo):');
  console.log(['humano\\modelo', ...labels].join('\t'));
  for (const human of labels) {
    console.log([human, ...labels.map((model) => String(matrix[human][model]))].join('\t'));
  }

  console.log('\nPor classe (precision / recall / f1 / suporte):');
  for (const metric of perClass) {
    console.log(
      `${metric.label}\t${metric.precision.toFixed(2)}\t${metric.recall.toFixed(2)}\t${metric.f1.toFixed(2)}\t${metric.support}`,
    );
  }
  console.log('');
}

main();
