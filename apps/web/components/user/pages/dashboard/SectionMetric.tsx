import MetricCard from "components/user/shared/cards/MetricCard";
import FormatToCurrencyReal from "src/lib/utils/FormatToReal";
import {
  FaComments,
  FaFrown,
  FaSmile,
  FaStar,
} from 'react-icons/fa';
import type { SectionMetricProps } from './ui.types';

export default function SectionMetric({ totalFeedbacks, averageRating, positive, negative }: SectionMetricProps) {

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Feedbacks recebidos"
        value={FormatToCurrencyReal(totalFeedbacks)}
        helper="Total acumulado no workspace"
        icon={FaComments}
      />
      <MetricCard
        title="Média de satisfação"
        value={FormatToCurrencyReal(averageRating, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        helper="Avaliação média em estrelas"
        icon={FaStar}
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
