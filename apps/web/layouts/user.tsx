import { useEffect, useRef, useState } from 'react';
import { Outlet, useFetcher, useLoaderData, useNavigation } from 'react-router-dom';
import Header from 'components/user/layout/Header';
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
import { getCookie, setCookie } from 'src/lib/utils/cookies';
import { INTENT_LOGOUT } from 'src/lib/constants/routes/intents';

export default function User() {
  const logoutFetcher = useFetcher();
  const navigation = useNavigation();
  const { enterprise, collecting } = useLoaderData() as {
    enterprise: Enterprise;
    collecting: CollectingDataEnterprise | null;
  };

  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHoverActivator, setIsHoverActivator] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const isSigningOut = logoutFetcher.state !== 'idle';
  const isRouteLoading = navigation.state === 'loading';
  const pendingPathname = navigation.location?.pathname ?? '';

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

  // Restaura preferências salvas no cookie ao montar!
  useEffect(() => {
    const layoutSaved = getCookie('sidebarLayout');
    const modeSaved = getCookie('sidebarMode');

    if (layoutSaved === 'overlay') {
      setIsOverlayMode(true);
      // No overlay, inicia sempre oculto
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

    // Fallback padrão: push + aberto
    setIsOverlayMode(false);
    setIsSidebarOpen(true);
  }, []);

  return (
    <div className="private-user-theme min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
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
          className={`min-w-0 flex-1 ${
            !isOverlayMode && isSidebarOpen ? 'pl-72' : 'pl-0'
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
  );
}
