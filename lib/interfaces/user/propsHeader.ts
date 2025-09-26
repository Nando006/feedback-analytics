export interface PropsHeader {
  isOverlayMode: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSetOverlay: () => void;
  onSetPush: () => void;
}
