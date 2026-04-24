import CardProfile from "../shared/cards/cardProfile";
import Menu from "./Menu";
import type { SidebarProps } from "./ui.types";

export default function Sidebar({
  isOverlayMode,
  isOpen,
  onOpen,
  onClose,
  pendingPathname,
  enterpriseName,
  onSignOut,
  isSigningOut = false,
}: SidebarProps) {
  if (isOverlayMode) {
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
          <div className="mt-2 border-t border-(--quaternary-color)/10">
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
      className={`fixed left-0 top-16 z-30 h-[calc(100vh-64px)] shrink-0 overflow-hidden border-r border-(--quaternary-color)/10 bg-linear-to-b from-(--bg-secondary)/92 to-(--sixth-color)/92 transition-[width] duration-300 ease-in-out ${
        isOpen ? "w-72 pointer-events-auto" : "w-0 pointer-events-none"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Menu pendingPathname={pendingPathname} />
        </div>
        <div className="mt-2 border-t border-(--quaternary-color)/10">
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
