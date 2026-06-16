import HelpPopover from './HelpPopover';
import { HELP_TOPICS } from 'src/lib/constants/helpTopics';
import type { HelpHintProps } from './ui.types';

/**
 * Ícone "?" clicável que abre um modal explicando, em linguagem simples, um
 * CONCEITO DE CONFIGURAÇÃO DA COLETA (ex.: o que é o Catálogo, o toggle "Ativa",
 * a Prévia, o limite de caracteres, o QR Code). O conteúdo vem do dicionário
 * central `HELP_TOPICS`. Pensado para ficar ao lado do rótulo/título do controle.
 */
export default function HelpHint({ topic, className = '' }: HelpHintProps) {
  const info = HELP_TOPICS[topic];

  return (
    <HelpPopover
      title={info.title}
      paragraphs={info.paragraphs}
      example={info.example}
      idBase={`help-${topic}`}
      className={className}
    />
  );
}
