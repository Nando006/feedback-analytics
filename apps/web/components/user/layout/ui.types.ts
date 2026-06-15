import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';

/**
 * Props do cabeçalho de layout do usuário autenticado.
 * Usado em: components/user/layout/Header.tsx.
 */
export interface HeaderProps {
  isOverlayMode: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSetOverlay: () => void;
  onSetPush: () => void;
  enterprise: EnterpriseContext;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * Estrutura de item de menu (com suporte a submenu).
 * Usado em: components/user/layout/Menu.tsx.
 */
export interface MenuItem {
  label: string;
  to?: string;
  children?: MenuItem[];
}

/**
 * Props da barra lateral do layout do usuário.
 * Usado em: components/user/layout/Sidebar.tsx.
 */
export interface SidebarProps {
  isOverlayMode: boolean;
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  pendingPathname?: string;
}

/**
 * Props do menu de conta no topo do layout.
 * Usado em: components/user/layout/AccountMenu.tsx.
 */
export interface AccountMenuProps {
  enterprise: EnterpriseContext;
  onSignOut: () => void;
  isSigningOut?: boolean;
}
