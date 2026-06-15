import type { HeaderProps } from './ui.types';
import { FaBars } from 'react-icons/fa6';
import AccountMenu from './AccountMenu';
import HeaderNav from './HeaderNav';

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  enterprise,
  onSignOut,
  isSigningOut,
}: HeaderProps) {
  return (
    <div className="flex h-full items-center gap-3 px-4">
      <button
        type="button"
        aria-label={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        title={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
        className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-primary) transition-colors hover:border-(--quaternary-color)/22 hover:bg-(--bg-tertiary)"
        onClick={onToggleSidebar}>
        <FaBars className="h-4 w-4" />
      </button>

      <HeaderNav className="hidden min-w-0 flex-1 sm:block" />

      <div className="ml-auto shrink-0">
        <AccountMenu
          enterprise={enterprise}
          onSignOut={onSignOut}
          isSigningOut={isSigningOut}
        />
      </div>
    </div>
  );
}
