import CardProfile from '../shared/cards/cardProfile';
import Menu from './Menu';
import type { SidebarProps } from './ui.types';

export default function Sidebar({
  isOverlayMode,
  isOpen,
  onOpen,
  onClose,
  enterpriseName,
  onSignOut,
  isSigningOut = false,
  collecting,
}: SidebarProps) {
  if (isOverlayMode) {
    return (
      <aside
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-72 transform border-r border-neutral-800/40 bg-neutral-900/80 transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0 pointer-events-auto'
            : '-translate-x-full pointer-events-none'
        }`}>
        <div className="flex h-full flex-col">
          <div className="flex-1">
            <Menu
              usesCompanyProducts={Boolean(collecting?.uses_company_products)}
              usesCompanyServices={Boolean(collecting?.uses_company_services)}
              usesCompanyDepartments={Boolean(
                collecting?.uses_company_departments,
              )}
            />
          </div>
          <div className="mt-2 border-t border-neutral-800/40">
            <div className="flex justify-end">
              <CardProfile
                fullName={enterpriseName}
                onSignOut={onSignOut}
                isSigningOut={isSigningOut}
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed left-0 top-16 z-30 shrink-0 overflow-hidden border-r border-neutral-800/40 bg-neutral-900/50 transition-[width] duration-300 ease-in-out h-[calc(100vh-64px)] ${
        isOpen ? 'w-72 pointer-events-auto' : 'w-0 pointer-events-none'
      }`}>
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Menu
            usesCompanyProducts={Boolean(collecting?.uses_company_products)}
            usesCompanyServices={Boolean(collecting?.uses_company_services)}
            usesCompanyDepartments={Boolean(collecting?.uses_company_departments)}
          />
        </div>
        <div className="mt-2 border-t border-neutral-800/40">
          <div className="flex justify-end">
            <CardProfile
              fullName={enterpriseName}
              onSignOut={onSignOut}
              isSigningOut={isSigningOut}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
