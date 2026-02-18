import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';

export interface HeaderProps {
  isOverlayMode: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSetOverlay: () => void;
  onSetPush: () => void;
}

export interface MenuItem {
  label: string;
  to?: string;
  children?: MenuItem[];
}

export interface SidebarProps {
  isOverlayMode: boolean;
  isOpen: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  enterpriseName?: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
  collecting: CollectingDataEnterprise | null;
}
