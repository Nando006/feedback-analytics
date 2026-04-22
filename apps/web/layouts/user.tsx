import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useFetcher, useLoaderData, useNavigation } from 'react-router-dom';
import Header from 'components/user/layout/Header';
import {
  InsightsControlsProvider,
  useInsightsControlsState,
} from 'src/lib/context/insightsControls';
import type { InsightsControlsInitialData } from 'src/lib/context/insightsControls.types';
import Sidebar from 'components/user/layout/Sidebar';
import DashboardSkeleton from 'components/user/pages/dashboard/DashboardSkeleton';
import ProfileSkeleton from 'components/user/pages/profile/ProfileSkeleton';
import QrCodeEnterpriseSkeleton from 'components/user/pages/qrcodes/QrCodeEnterpriseSkeleton';
import QrCodeProductsSkeleton from 'components/user/pages/qrcodes/QrCodeProductsSkeleton';
import QrCodeServicesSkeleton from 'components/user/pages/qrcodes/QrCodeServicesSkeleton';
import QrCodeDepartmentsSkeleton from 'components/user/pages/qrcodes/QrCodeDepartmentsSkeleton';
import FeedbacksAllSkeleton from 'components/user/pages/feedbacks/FeedbacksAllSkeleton';
import FeedbackDetailsSkeleton from 'components/user/pages/feedbacks/FeedbackDetailsSkeleton';
import FeedbacksAnalyticsAllSkeleton from 'components/user/pages/feedbacks/analytics/FeedbacksAnalyticsAllSkeleton';
import FeedbacksAnalyticsPositiveSkeleton from 'components/user/pages/feedbacks/analytics/FeedbacksAnalyticsPositiveSkeleton';
import FeedbacksAnalyticsNegativeSkeleton from 'components/user/pages/feedbacks/analytics/FeedbacksAnalyticsNegativeSkeleton';
import InsightsReportSkeleton from 'components/user/pages/feedbacks/insights/InsightsReportSkeleton';
import InsightsEmotionalSkeleton from 'components/user/pages/feedbacks/insights/InsightsEmotionalSkeleton';
import InsightsStatisticsSkeleton from 'components/user/pages/feedbacks/insights/InsightsStatisticsSkeleton';
import EditCustomersSkeleton from 'components/user/pages/edit/EditCustomersSkeleton';
import EditProfileSkeleton from 'components/user/pages/edit/EditProfileSkeleton';
import EditCollectingDataSkeleton from 'components/user/pages/edit/EditCollectingDataSkeleton';
import EditFeedbackSettingsSkeleton from 'components/user/pages/edit/EditFeedbackSettingsSkeleton';
import type { CollectingDataEnterprise, Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { InsightScopeOption, InsightsCatalogItemOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';
import { getCookie, setCookie } from 'src/lib/utils/cookies';
import { INTENT_LOGOUT, INTENT_FEEDBACK_ANALYZE_RAW, INTENT_FEEDBACK_RUN_IA } from 'src/lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';

function buildInsightsInitialData(collecting: CollectingDataEnterprise | null): InsightsControlsInitialData {
  const availableScopes: InsightScopeOption[] = ['COMPANY'];
  const catalogItemOptions: InsightsCatalogItemOption[] = [];

  if (!collecting) {
    return { availableScopes, catalogItemOptions, canAnalyze: false };
  }

  const hasCompanyObjective = String(collecting.company_objective ?? '').trim().length > 0;
  const hasAnalyticsGoal = String(collecting.analytics_goal ?? '').trim().length > 0;
  const hasBusinessSummary = String(collecting.business_summary ?? '').trim().length > 0;
  const canAnalyze = hasCompanyObjective && hasAnalyticsGoal && hasBusinessSummary;

  const productItems = collecting.catalog_products ?? [];
  const serviceItems = collecting.catalog_services ?? [];
  const departmentItems = collecting.catalog_departments ?? [];

  if (collecting.uses_company_products && productItems.length > 0) {
    availableScopes.push('PRODUCT');
    catalogItemOptions.push(
      ...productItems.map((item) => ({ id: item.id, name: item.name, kind: 'PRODUCT' as const })),
    );
  }

  if (collecting.uses_company_services && serviceItems.length > 0) {
    availableScopes.push('SERVICE');
    catalogItemOptions.push(
      ...serviceItems.map((item) => ({ id: item.id, name: item.name, kind: 'SERVICE' as const })),
    );
  }

  if (collecting.uses_company_departments && departmentItems.length > 0) {
    availableScopes.push('DEPARTMENT');
    catalogItemOptions.push(
      ...departmentItems.map((item) => ({ id: item.id, name: item.name, kind: 'DEPARTMENT' as const })),
    );
  }

  return { availableScopes, catalogItemOptions, canAnalyze };
}

export default function User() {
  const logoutFetcher = useFetcher();
  const analyzeRawFetcher = useFetcher();
  const insightsFetcher = useFetcher();
  const navigation = useNavigation();
  const toast = useToast();
  const { enterprise, collecting } = useLoaderData() as {
    enterprise: Enterprise;
    collecting: CollectingDataEnterprise | null;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const insightsInitial = useMemo(() => buildInsightsInitialData(collecting), []);
  const insightsState = useInsightsControlsState(insightsInitial);

  // Sincroniza o contexto quando collecting muda (ex: após salvar catálogo)
  useEffect(() => {
    const updated = buildInsightsInitialData(collecting);
    insightsState.setAvailableScopes(updated.availableScopes);
    insightsState.setCatalogItemOptions(updated.catalogItemOptions);
    insightsState.setCanAnalyze(updated.canAnalyze);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collecting]);

  const shouldRevalidateRawRef = useRef(false);
  const shouldRevalidateInsightsRef = useRef(false);

  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHoverActivator, setIsHoverActivator] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const isSigningOut = logoutFetcher.state !== 'idle';
  const isRouteLoading = navigation.state === 'loading';
  const pendingPathname = navigation.location?.pathname ?? '';

  const analyzeRaw = useCallback(() => {
    if (!insightsState.canAnalyze) {
      toast.warning('Configuração necessária', 'Preencha as informações da empresa para liberar a análise.');
      return;
    }
    if (insightsState.scope !== 'COMPANY' && !insightsState.catalogItemId) {
      toast.warning('Item necessário', 'Selecione um item do catálogo para este escopo.');
      return;
    }
    const form = new FormData();
    form.set('intent', INTENT_FEEDBACK_ANALYZE_RAW);
    form.set('scope_type', insightsState.scope);
    if (insightsState.catalogItemId) {
      form.set('catalog_item_id', insightsState.catalogItemId);
    }
    shouldRevalidateRawRef.current = true;
    toast.success('Analisando feedbacks...', 'Isso pode levar alguns momentos');
    analyzeRawFetcher.submit(form, { method: 'post', action: '/user/insights/reports' });
  }, [insightsState.canAnalyze, insightsState.scope, insightsState.catalogItemId, analyzeRawFetcher, toast]);

  const regenerateInsights = useCallback(() => {
    if (!insightsState.canAnalyze) {
      toast.warning('Configuração necessária', 'Preencha as informações da empresa para liberar a análise.');
      return;
    }
    if (insightsState.scope !== 'COMPANY' && !insightsState.catalogItemId) {
      toast.warning('Item necessário', 'Selecione um item do catálogo para este escopo.');
      return;
    }
    const form = new FormData();
    form.set('intent', INTENT_FEEDBACK_RUN_IA);
    form.set('scope_type', insightsState.scope);
    if (insightsState.catalogItemId) {
      form.set('catalog_item_id', insightsState.catalogItemId);
    }
    shouldRevalidateInsightsRef.current = true;
    toast.success('Gerando análise...', 'Isso pode levar alguns momentos');
    insightsFetcher.submit(form, { method: 'post', action: '/user/insights/reports' });
  }, [insightsState.canAnalyze, insightsState.scope, insightsState.catalogItemId, insightsFetcher, toast]);

  useEffect(() => {
    if (analyzeRawFetcher.state !== 'idle' || !shouldRevalidateRawRef.current) return;
    shouldRevalidateRawRef.current = false;
    const data = analyzeRawFetcher.data as { ok?: boolean; error?: string } | undefined;
    if (data?.ok) {
      toast.success('Feedbacks analisados!', 'Novos feedbacks processados e salvos com sucesso');
    } else if (data?.error) {
      toast.error('Erro na análise', data.error);
    }
  }, [analyzeRawFetcher.state, analyzeRawFetcher.data, toast]);

  useEffect(() => {
    if (insightsFetcher.state !== 'idle' || !shouldRevalidateInsightsRef.current) return;
    shouldRevalidateInsightsRef.current = false;
    const data = insightsFetcher.data as { ok?: boolean; error?: string } | undefined;
    if (data?.ok) {
      toast.success('Insights atualizados!', 'Relatório atualizado com os novos insights da IA');
    } else if (data?.error) {
      toast.error('Erro na análise', data.error);
    }
  }, [insightsFetcher.state, insightsFetcher.data, toast]);

  const pendingContent = (() => {
    if (!isRouteLoading) {
      return <Outlet />;
    }

    if (pendingPathname === '/user/dashboard') return <DashboardSkeleton />;
    if (pendingPathname === '/user/profile') return <ProfileSkeleton />;

    if (pendingPathname === '/user/qrcode/enterprise') return <QrCodeEnterpriseSkeleton />;
    if (pendingPathname === '/user/qrcode/products') return <QrCodeProductsSkeleton />;
    if (pendingPathname === '/user/qrcode/services') return <QrCodeServicesSkeleton />;
    if (pendingPathname === '/user/qrcode/departments') return <QrCodeDepartmentsSkeleton />;

    if (pendingPathname === '/user/feedbacks/all') return <FeedbacksAllSkeleton />;
    if (pendingPathname.startsWith('/user/feedbacks/') && !pendingPathname.startsWith('/user/feedbacks/analytics/')) {
      return <FeedbackDetailsSkeleton />;
    }
    if (pendingPathname === '/user/feedbacks/analytics/all') return <FeedbacksAnalyticsAllSkeleton />;
    if (pendingPathname === '/user/feedbacks/analytics/positive') return <FeedbacksAnalyticsPositiveSkeleton />;
    if (pendingPathname === '/user/feedbacks/analytics/negative') return <FeedbacksAnalyticsNegativeSkeleton />;

    if (pendingPathname === '/user/insights/reports') return <InsightsReportSkeleton />;
    if (pendingPathname === '/user/insights/emotional') return <InsightsEmotionalSkeleton />;
    if (pendingPathname === '/user/insights/statistics') return <InsightsStatisticsSkeleton />;

    if (pendingPathname === '/user/edit/customers') return <EditCustomersSkeleton />;
    if (pendingPathname === '/user/edit/profile') return <EditProfileSkeleton />;
    if (pendingPathname === '/user/edit/collecting-data-enterprise') return <EditCollectingDataSkeleton />;
    if (pendingPathname === '/user/edit/feedback-settings') return <EditFeedbackSettingsSkeleton />;

    return <Outlet />;
  })();

  function handleSignOut() {
    if (isSigningOut) return;

    logoutFetcher.submit(
      { intent: INTENT_LOGOUT },
      { method: 'post', action: '/user' },
    );
  }

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    if (isHoverActivator) return;
    closeTimerRef.current = window.setTimeout(() => {
      setIsSidebarOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  useEffect(() => {
    const layoutSaved = getCookie('sidebarLayout');
    const modeSaved = getCookie('sidebarMode');

    if (layoutSaved === 'overlay') {
      setIsOverlayMode(true);
      setIsSidebarOpen(false);
      return;
    }

    if (layoutSaved === 'push') {
      setIsOverlayMode(false);
      if (modeSaved === 'collapsed') setIsSidebarOpen(false);
      else if (modeSaved === 'expanded') setIsSidebarOpen(true);
      else setIsSidebarOpen(true);
      return;
    }

    setIsOverlayMode(false);
    setIsSidebarOpen(true);
  }, []);

  return (
    <InsightsControlsProvider
      value={{
        ...insightsState,
        analyzeRaw,
        regenerateInsights,
        isAnalyzingRaw: analyzeRawFetcher.state !== 'idle',
        isRegeneratingInsights: insightsFetcher.state !== 'idle',
      }}
    >
      <div className="private-user-theme min-h-screen bg-(--bg-primary) text-(--text-primary)">
        <header className="sticky top-0 z-50 h-16 border-b border-(--quaternary-color)/10 bg-linear-to-r from-(--bg-secondary) to-(--sixth-color)">
          <Header
            isOverlayMode={isOverlayMode}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() =>
              setIsSidebarOpen((v) => {
                const next = !v;
                setCookie('sidebarMode', next ? 'expanded' : 'collapsed');
                return next;
              })
            }
            onSetOverlay={() => {
              setIsOverlayMode(true);
              setCookie('sidebarLayout', 'overlay');
            }}
            onSetPush={() => {
              setIsOverlayMode(false);
              setCookie('sidebarLayout', 'push');
            }}
          />
        </header>

        <div className={isOverlayMode ? 'relative bg-(--bg-primary)' : 'flex bg-(--bg-primary)'}>
          {isOverlayMode && (
            <div
              className="fixed left-0 top-16 z-30 h-[calc(100vh-64px)] w-2"
              onMouseEnter={() => {
                cancelClose();
                setIsSidebarOpen(true);
                setIsHoverActivator(true);
              }}
              onMouseLeave={() => {
                setIsHoverActivator(false);
                scheduleClose();
              }}
            />
          )}
          {!isOverlayMode && (
            <Sidebar
              isOverlayMode={false}
              isOpen={isSidebarOpen}
              pendingPathname={pendingPathname}
              enterpriseName={enterprise.full_name ?? undefined}
              onSignOut={handleSignOut}
              isSigningOut={isSigningOut}
              collecting={collecting}
            />
          )}

          <main
            className={`min-w-0 flex-1 ${!isOverlayMode && isSidebarOpen ? 'pl-72' : 'pl-0'
              }`}>
            <div className="bg-(--bg-primary) p-4 md:p-5">
              {pendingContent}
            </div>
          </main>
        </div>

        {isOverlayMode && (
          <Sidebar
            isOverlayMode
            isOpen={isSidebarOpen}
            onOpen={() => {
              cancelClose();
              setIsSidebarOpen(true);
            }}
            onClose={() => {
              scheduleClose();
            }}
            pendingPathname={pendingPathname}
            enterpriseName={enterprise.full_name ?? undefined}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            collecting={collecting}
          />
        )}
      </div>
    </InsightsControlsProvider>
  );
}
