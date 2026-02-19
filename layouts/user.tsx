import { useEffect, useRef, useState } from 'react';
import { Outlet, useFetcher, useLoaderData } from 'react-router-dom';
import Header from 'components/user/layout/Header';
import Sidebar from 'components/user/layout/Sidebar';
import type { CollectingDataEnterprise, Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import { getCookie, setCookie } from 'lib/utils/cookies';
import { INTENT_LOGOUT } from 'lib/constants/routes/intents';

export default function User() {
  const logoutFetcher = useFetcher();
  const { enterprise, collecting } = useLoaderData() as {
    enterprise: Enterprise;
    collecting: CollectingDataEnterprise | null;
  };

  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHoverActivator, setIsHoverActivator] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const isSigningOut = logoutFetcher.state !== 'idle';

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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 h-16 border-b border-neutral-800/50 bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/90">
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

      <div className={isOverlayMode ? 'relative' : 'flex'}>
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
          <div className="p-4">
            <Outlet />
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
          enterpriseName={enterprise.full_name ?? undefined}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
          collecting={collecting}
        />
      )}
    </div>
  );
}
