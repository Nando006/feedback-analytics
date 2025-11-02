import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouteLoaderData } from 'react-router-dom';
import type { IconType } from 'react-icons';
import CardSimple from 'components/user/shared/cards/cardSimple';
import type {
  PropsCollectingDataEnterprise,
  PropsEnterprise,
} from 'lib/interfaces/entities/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import type { Feedback, FeedbackStats } from 'lib/interfaces/user/feedback';
import { ServiceGetFeedbacks, ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';
import {
  FaArrowRight,
  FaChartLine,
  FaComments,
  FaFrown,
  FaMeh,
  FaSmile,
  FaStar,
} from 'react-icons/fa';

type LoaderData = {
  user: PropsAuthUser['user'];
  enterprise: PropsEnterprise;
  collecting: PropsCollectingDataEnterprise | null;
};

type MetricCardProps = {
  title: string;
  value: string;
  helper?: string;
  loading?: boolean;
  icon: IconType;
};

const RATING_ORDER = [5, 4, 3, 2, 1] as const;
const LATEST_LIMIT = 5;

function MetricCard({ title, value, helper, loading, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[var(--shadow-primary)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-neutral-100">
            {loading ? <span className="skeleton inline-block h-8 w-20" /> : value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800/70 text-neutral-200">
          <Icon size={20} />
        </div>
      </div>
      {helper ? (
        <p className="mt-3 text-xs text-neutral-500">{helper}</p>
      ) : null}
    </div>
  );
}

function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return value.toLocaleString('pt-BR', options);
}

function truncateMessage(message: string, maxLength = 200) {
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength - 1)}…`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const loaderData = useRouteLoaderData('user') as LoaderData | undefined;
  const user = loaderData?.user;
  const enterprise = loaderData?.enterprise;
  const collecting = loaderData?.collecting ?? null;
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [latestFeedbacks, setLatestFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [statsResponse, feedbackResponse] = await Promise.all([
          ServiceGetFeedbackStats(),
          ServiceGetFeedbacks({ limit: LATEST_LIMIT, page: 1 }),
        ]);
        if (!active) return;
        setStats(statsResponse);
        setLatestFeedbacks(feedbackResponse.feedbacks);
      } catch (err) {
        console.error('Erro ao carregar o dashboard:', err);
        if (!active) return;
        setStats(null);
        setLatestFeedbacks([]);
        setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
      } finally {
        if (active) {
          setLoading(false);
          hasLoadedOnceRef.current = true;
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const distribution = useMemo(() => {
    if (!stats) return [] as Array<{ rating: number; count: number; percent: number }>;
    const total = stats.totalFeedbacks || 0;
    return RATING_ORDER.map((rating) => {
      const count = stats.ratingDistribution[rating];
      const percent = total ? Math.round((count / total) * 100) : 0;
      return { rating, count, percent };
    });
  }, [stats]);

  const displayName =
    user?.user_metadata?.full_name || enterprise?.full_name || user?.email || 'Dashboard';

  const totalFeedbacks = stats?.totalFeedbacks ?? 0;
  const averageRating = stats?.averageRating ?? 0;
  const positive = stats?.sentimentBreakdown.positive ?? 0;
  const neutral = stats?.sentimentBreakdown.neutral ?? 0;
  const negative = stats?.sentimentBreakdown.negative ?? 0;

  return (
    <div className="font-inter space-y-6">
      <CardSimple type="header">
        <div className="flex-1 space-y-2">
          <p className="text-sm uppercase tracking-wide text-neutral-400">Visão Geral</p>
          <h1 className="text-3xl font-semibold text-neutral-100 md:text-4xl">
            Olá, {displayName}
          </h1>
          <p className="text-sm text-neutral-300 md:text-base">
            Acompanhe o desempenho dos seus feedbacks, veja tendências e monitore como os
            clientes estão interagindo com a sua empresa.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <Link
            to="/user/feedbacks/all"
            className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold">
            Ver feedbacks
            <FaArrowRight className="text-xs" />
          </Link>
          <Link
            to="/user/qrcode/enterprise"
            className="inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-neutral-100">
            Compartilhar formulário de feedback
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </CardSimple>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Feedbacks recebidos"
          value={formatNumber(totalFeedbacks)}
          helper="Total acumulado no workspace"
          loading={loading && !hasLoadedOnceRef.current}
          icon={FaComments}
        />
        <MetricCard
          title="Média de satisfação"
          value={formatNumber(averageRating, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
          helper="Avaliação média em estrelas"
          loading={loading && !hasLoadedOnceRef.current}
          icon={FaStar}
        />
        <MetricCard
          title="Feedbacks positivos"
          value={formatNumber(positive)}
          helper="Notas 4 ★ e 5 ★"
          loading={loading && !hasLoadedOnceRef.current}
          icon={FaSmile}
        />
        <MetricCard
          title="Feedbacks críticos"
          value={formatNumber(negative)}
          helper="Notas 1 ★ e 2 ★"
          loading={loading && !hasLoadedOnceRef.current}
          icon={FaFrown}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[var(--shadow-primary)]">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Distribuição das avaliações
                </h2>
                <p className="text-sm text-neutral-400">
                  Percentual de feedbacks por nota nos últimos registros
                </p>
              </div>
              <FaChartLine className="text-neutral-400" size={20} />
            </header>

            <div className="mt-6 space-y-4">
              {loading && !hasLoadedOnceRef.current ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3">
                      <span className="skeleton inline-block h-5 w-12" />
                      <div className="skeleton h-2 flex-1" />
                      <span className="skeleton inline-block h-5 w-10" />
                    </div>
                  ))}
                </div>
              ) : distribution.length === 0 ? (
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 p-6 text-center text-sm text-neutral-400">
                  Ainda não há avaliações suficientes para compor a distribuição.
                </div>
              ) : (
                distribution.map(({ rating, count, percent }) => (
                  <div
                    key={rating}
                    className="flex items-center gap-3">
                    <div className="flex w-12 items-center gap-1 text-sm text-neutral-300">
                      <FaStar className="text-yellow-400" size={12} />
                      <span>{rating}</span>
                    </div>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs text-neutral-400">
                      {percent}% · {count}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[var(--shadow-primary)]">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Feedbacks recentes
                </h2>
                <p className="text-sm text-neutral-400">
                  Últimos {LATEST_LIMIT} retornos enviados pelos clientes
                </p>
              </div>
              <Link
                to="/user/feedbacks/all"
                className="inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-neutral-100">
                Ver todos
                <FaArrowRight className="text-xs" />
              </Link>
            </header>

            <div className="mt-6 space-y-4">
              {loading && !hasLoadedOnceRef.current ? (
                <div className="space-y-4">
                  {Array.from({ length: LATEST_LIMIT }).map((_, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-xl border border-neutral-800/60 bg-neutral-900/80 p-4">
                      <span className="skeleton inline-block h-5 w-16" />
                      <p className="skeleton h-16" />
                      <span className="skeleton inline-block h-4 w-28" />
                    </div>
                  ))}
                </div>
              ) : latestFeedbacks.length === 0 ? (
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 p-6 text-center text-sm text-neutral-400">
                  Nenhum feedback foi recebido até o momento.
                </div>
              ) : (
                latestFeedbacks.map((feedback) => (
                  <article
                    key={feedback.id}
                    className="space-y-2 rounded-xl border border-neutral-800/60 bg-neutral-900/80 p-4">
                    <div className="flex items-center gap-3 text-sm text-neutral-300">
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-2 py-1 text-xs uppercase tracking-wide text-neutral-400">
                        {feedback.collection_points?.type ?? 'N/A'}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {Array.from({ length: feedback.rating }).map((_, starIndex) => (
                          <FaStar key={starIndex} size={12} />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500">
                        {formatDateTime(feedback.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-200">
                      {truncateMessage(feedback.message)}
                    </p>
                    {feedback.tracked_devices?.customer ? (
                      <p className="text-xs text-neutral-500">
                        Cliente:{' '}
                        <span className="text-neutral-300">
                          {feedback.tracked_devices.customer.name ?? 'Não identificado'}
                        </span>
                      </p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[var(--shadow-primary)]">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Estratégia de coleta
                </h2>
                <p className="text-sm text-neutral-400">
                  Informações configuradas para orientar o time
                </p>
              </div>
              <FaMeh className="text-neutral-400" size={18} />
            </header>

            <div className="mt-6 space-y-5 text-sm text-neutral-300">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Objetivo da empresa
                </p>
                <p className="mt-1 leading-relaxed">
                  {collecting?.company_objective ?? 'Nenhum objetivo cadastrado ainda.'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Objetivo analítico
                </p>
                <p className="mt-1 leading-relaxed">
                  {collecting?.analytics_goal ?? 'Adicione como pretende utilizar os feedbacks.'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Resumo do negócio
                </p>
                <p className="mt-1 leading-relaxed">
                  {collecting?.business_summary ?? 'Explique brevemente o contexto do negócio.'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Produtos/Serviços monitorados
                </p>
                {collecting?.uses_company_products && collecting?.main_products_or_services?.length ? (
                  <ul className="mt-1 space-y-1 text-neutral-200">
                    {collecting.main_products_or_services.map((item) => (
                      <li key={item} className="rounded-md border border-neutral-800/80 bg-neutral-900/70 px-3 py-2 text-xs">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 leading-relaxed text-neutral-400">
                    Nenhum item configurado. Aproveite para mapear os produtos que devem receber feedback.
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/user/edit/collecting-data-enterprise"
              className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-neutral-100">
              Ajustar informações de coleta
              <FaArrowRight className="text-xs" />
            </Link>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[var(--shadow-primary)]">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Radar de satisfação</h2>
                <p className="text-sm text-neutral-400">
                  Panorama resumido dos sentimentos capturados
                </p>
              </div>
            </header>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                <div className="flex items-center gap-2">
                  <FaSmile />
                  Positivos
                </div>
                <span className="font-semibold text-green-100">{formatNumber(positive)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                <div className="flex items-center gap-2">
                  <FaMeh />
                  Neutros
                </div>
                <span className="font-semibold text-yellow-100">{formatNumber(neutral)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <div className="flex items-center gap-2">
                  <FaFrown />
                  Negativos
                </div>
                <span className="font-semibold text-red-100">{formatNumber(negative)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
