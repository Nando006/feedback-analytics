import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from 'components/user/layout/Header';
import Sidebar from 'components/user/layout/Sidebar';

export default function User() {
  const [isOverlayMode, setIsOverlayMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 h-16 border-b border-neutral-800/50 bg-neutral-900/60 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60">
        <Header
          isOverlayMode={isOverlayMode}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          onSetOverlay={() => setIsOverlayMode(true)}
          onSetPush={() => setIsOverlayMode(false)}
        />
      </header>

      <div className={isOverlayMode ? 'relative' : 'flex'}>
        {!isOverlayMode && (
          <Sidebar
            isOverlayMode={false}
            isOpen={isSidebarOpen}
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>

      {isOverlayMode && (
        <Sidebar
          isOverlayMode
          isOpen={isSidebarOpen}
        />
      )}
    </div>
  );
}
