import MetricCard from "components/user/shared/cards/MetricCard";
import MetricHelp from "components/user/shared/MetricHelp";
import FormatToCurrencyReal from "src/lib/utils/FormatToReal";
import { formatInterval } from "src/lib/utils/statistics";
import {
  FaComments,
  FaFrown,
  FaSmile,
  FaStar,
} from 'react-icons/fa';
import type { SectionMetricProps } from './ui.types';

export default function SectionMetric({ totalFeedbacks, averageRating, positive, negative, starMeanCI }: SectionMetricProps) {
  // Faixa provável (IC t da média de estrelas): só faz sentido com feedbacks no escopo.
  const showRatingRange = starMeanCI != null && totalFeedbacks > 0;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Média de satisfação"
        value={FormatToCurrencyReal(averageRating, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        helper={
          <>
            Avaliação média em estrelas
            {showRatingRange && (
              <span className="mt-1 flex items-center gap-1">
                faixa provável {formatInterval(starMeanCI, 1)}
                <MetricHelp term="confidenceInterval" />
              </span>
            )}
          </>
        }
        icon={FaStar}
      />
      <MetricCard
        title="Feedbacks recebidos"
        value={FormatToCurrencyReal(totalFeedbacks)}
        helper="Total acumulado no workspace"
        icon={FaComments}
      />
      <MetricCard
        title="Feedbacks positivos"
        value={FormatToCurrencyReal(positive)}
        helper="Notas 4 ★ e 5 ★"
        icon={FaSmile}
      />
      <MetricCard
        title="Feedbacks críticos"
        value={FormatToCurrencyReal(negative)}
        helper="Notas 1 ★ e 2 ★"
        icon={FaFrown}
      />
    </section>
  );
}
