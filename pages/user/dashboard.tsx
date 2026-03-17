import { Link, useLoaderData, useRouteLoaderData } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import {
  FaArrowRight,
} from 'react-icons/fa';
import SectionMetric from 'components/user/pages/dashboard/SectionMetric';
import SectionEvaluationDistribution from 'components/user/pages/dashboard/SectionEvaluationDistribution';
import SectionLatestFeedbacks from 'components/user/pages/dashboard/SectionLatestFeedbacks';
import SectionCollectingStrategy from 'components/user/pages/dashboard/SectionCollectingStrategy';
import SectionSatisfactionRadar from 'components/user/pages/dashboard/SectionSatisfactionRadar';
import type { DashboardLoaderData, UserLoaderData } from './ui.types';


const LATEST_LIMIT = 5;

export default function Dashboard() {
  const userLoaderData = useRouteLoaderData<UserLoaderData>('user');
  const dashboardLoaderData = useLoaderData<DashboardLoaderData>();

  const user = userLoaderData?.user;
  const enterprise = userLoaderData?.enterprise;
  const collecting = userLoaderData?.collecting ?? null;
  const stats = dashboardLoaderData?.stats ?? null;
  const latestFeedbacks = dashboardLoaderData?.latestFeedbacks ?? [];
  const error = dashboardLoaderData?.dashboardError ?? null;

  const displayName =
    user?.user_metadata?.full_name || enterprise?.full_name || user?.email || 'Dashboard';

  const totalFeedbacks = stats?.totalFeedbacks ?? 0;
  const averageRating = stats?.averageRating ?? 0;
  const positive = stats?.sentimentBreakdown.positive ?? 0;
  const neutral = stats?.sentimentBreakdown.neutral ?? 0;
  const negative = stats?.sentimentBreakdown.negative ?? 0;

  return (
    <div className="font-work-sans space-y-6">
      <CardSimple type="header">
        <div className="flex-1 space-y-2">
          <p className="text-sm uppercase tracking-wide text-(--text-tertiary)">Visão Geral</p>
          <h1 className="font-montserrat text-3xl font-semibold text-(--text-primary) md:text-4xl">
            Olá, {displayName}
          </h1>
          <p className="text-sm text-(--text-secondary) md:text-base">
            Acompanhe o desempenho dos seus feedbacks, veja tendências e monitore como os
            clientes estão interagindo com a sua empresa.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <Link
            to="/user/feedbacks/all"
            className="btn-primary font-poppins inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold">
            Ver feedbacks
            <FaArrowRight className="text-xs" />
          </Link>
          <Link
            to="/user/qrcode/enterprise"
            className="inline-flex items-center gap-2 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)">
            Compartilhar formulário de feedback
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </CardSimple>

      {error ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">
          {error}
        </div>
      ) : null}

      <SectionMetric
        totalFeedbacks={totalFeedbacks}
        averageRating={averageRating}
        positive={positive}
        negative={negative}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <SectionEvaluationDistribution stats={stats} />

          <SectionLatestFeedbacks
            latestFeedbacks={latestFeedbacks}
            latestLimit={LATEST_LIMIT}
          />
        </div>

        <div className="space-y-6">
          <SectionCollectingStrategy collecting={collecting} />

          <SectionSatisfactionRadar
            positive={positive}
            neutral={neutral}
            negative={negative}
          />
        </div>
      </div>
    </div>
  );
}
