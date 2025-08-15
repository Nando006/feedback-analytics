import type { PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';
import CardProfile from '../cards/cardProfile';
import Menu from './menu';
export interface PropsSidebar {
  isOverlayMode: boolean;
  isOpen: boolean;
}

export default function Sidebar({
  isOverlayMode,
  isOpen,
  enterprise,
}: PropsSidebar & PropsApiEnterpriseResponse) {
  if (isOverlayMode) {
    return (
      <aside
        className={`fixed left-0 top-16 z-40 pt-2.5 h-[calc(100vh-64px)] w-72 transform border-r border-neutral-800/40 bg-neutral-900/80 backdrop-blur transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0 pointer-events-auto'
            : '-translate-x-full pointer-events-none'
        }`}>
        <div className="flex h-full flex-col">
          <div className="flex-1">
            <Menu />
          </div>
          <div className="mt-2 border-t border-neutral-800/40">
            <div className="flex justify-end">
              <CardProfile enterprise={enterprise} />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`shrink-0 overflow-hidden pt-2.5 border-r border-neutral-800/40 bg-neutral-900/50 backdrop-blur transition-[width] duration-300 ease-in-out h-[calc(100vh-64px)] ${
        isOpen ? 'w-72 pointer-events-auto' : 'w-0 pointer-events-none'
      }`}>
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Menu />
        </div>
        <div className="mt-2 border-t border-neutral-800/40">
          <div className="flex justify-end">
            <CardProfile enterprise={enterprise} />
          </div>
        </div>
      </div>
    </aside>
  );
}
