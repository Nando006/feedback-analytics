import HelpPopover from './HelpPopover';
import type { MetricHelpProps } from './ui.types';
import { METRIC_EXPLANATIONS } from 'src/lib/constants/metricExplanations';

/**
 * Ícone "?" clicável que abre um modal explicando, em linguagem simples, o que é a
 * métrica (ex.: Saldo de satisfação, Saldo de sentimento, Faixa provável). O conteúdo
 * vem do dicionário central `METRIC_EXPLANATIONS`. Pensado para ficar ao lado do
 * rótulo da métrica.
 */
export default function MetricHelp({ term, className = '' }: MetricHelpProps) {
  const info = METRIC_EXPLANATIONS[term];

  return (
    <HelpPopover
      title={info.title}
      paragraphs={info.paragraphs}
      example={info.example}
      idBase={`metric-help-${term}`}
      className={className}
    />
  );
}
