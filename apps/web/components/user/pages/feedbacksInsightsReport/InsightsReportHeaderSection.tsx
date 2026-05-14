import { Link } from 'react-router-dom';
import type { InsightsReportHeaderSectionProps } from './ui.types';

export default function InsightsReportHeaderSection({
  updatedLabel,
  canAnalyze,
  analysisBlockedMessage,
}: InsightsReportHeaderSectionProps) {
  return (
    <div className="font-work-sans flex flex-col gap-1">
      <h2 className="text-lg font-montserrat font-semibold text-(--text-primary)">
        Relatório de Insights da IA
      </h2>
      <p className="max-w-2xl text-sm text-(--text-tertiary)">
        Resumo estratégico gerado automaticamente a partir dos feedbacks,
        sentimentos e categorias identificadas pela IA, com foco em
        oportunidades de melhoria e pontos fortes da experiência do cliente.
      </p>

      {updatedLabel && (
        <span className="text-[10px] uppercase tracking-wide text-(--text-tertiary)">
          Última atualização: {updatedLabel}
        </span>
      )}

      {!canAnalyze && analysisBlockedMessage && (
        <p className="mt-1 text-xs text-(--text-tertiary)">
          {analysisBlockedMessage}
          {' '}
          <Link
            to="/user/edit/collecting-data-enterprise"
            className="font-semibold text-(--text-primary) underline underline-offset-2"
          >
            Configurar agora
          </Link>
          .
        </p>
      )}
    </div>
  );
}
