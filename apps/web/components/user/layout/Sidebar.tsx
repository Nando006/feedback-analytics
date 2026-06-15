import Menu from "./Menu";
import type { SidebarProps } from "./ui.types";

/**
 * Sidebar overlay-only: invocada pelo hover na borda esquerda (ou pelo botão do
 * header no toque), sobrepondo o conteúdo sem ocupar espaço.
 */
export default function Sidebar({
  isOpen,
  onOpen,
  onClose,
  pendingPathname,
}: SidebarProps) {
  return (
    <aside
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-72 transform border-r border-(--quaternary-color)/10 bg-linear-to-b from-(--bg-secondary)/95 to-(--sixth-color)/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
        isOpen
          ? "translate-x-0 pointer-events-auto"
          : "-translate-x-full pointer-events-none"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Menu pendingPathname={pendingPathname} />
        </div>
      </div>
    </aside>
  );
}
