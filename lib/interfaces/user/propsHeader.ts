import type { PropsEnterprise } from '../entities/enterprise';

export interface PropsHeader {
  isOverlayMode: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSetOverlay: () => void;
  onSetPush: () => void;
  enterprise: PropsEnterprise;
}
