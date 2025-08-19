import { useEffect, useRef, useState } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import Header from 'components/user/layout/header';
import Sidebar from 'components/user/layout/sidebar';
import type { PropsEnterprise } from 'lib/interfaces/entities/enterprise';

export default function User() {
  const { enterprise } = useLoaderData() as {
    enterprise: PropsEnterprise;
  };
  const [isOverlayMode, setIsOverlayMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHoverActivator, setIsHoverActivator] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

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

  // Mantém o overlay sempre oculto por padrão, e o push aberto
  useEffect(() => {
    setIsSidebarOpen(!isOverlayMode);
  }, [isOverlayMode]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 h-16 border-b border-neutral-800/50 bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/90">
        <Header
          isOverlayMode={isOverlayMode}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          onSetOverlay={() => setIsOverlayMode(true)}
          onSetPush={() => setIsOverlayMode(false)}
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
            enterprise={enterprise}
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
          enterprise={enterprise}
        />
      )}
    </div>
  );
}
