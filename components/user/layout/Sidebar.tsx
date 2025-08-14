import Menu from './Menu';
export interface PropsSidebar {
  isOverlayMode: boolean;
  isOpen: boolean;
}

export default function Sidebar({ isOverlayMode, isOpen }: PropsSidebar) {
  if (isOverlayMode) {
    return (
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-72 transform border-r border-neutral-800/40 bg-neutral-900/80 backdrop-blur transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0 pointer-events-auto'
            : '-translate-x-full pointer-events-none'
        }`}>
        <Menu />
      </aside>
    );
  }

  return (
    <aside
      className={`shrink-0 overflow-hidden border-r border-neutral-800/40 bg-neutral-900/50 backdrop-blur transition-[width] duration-300 ease-in-out h-[calc(100vh-64px)] ${
        isOpen ? 'w-72 pointer-events-auto' : 'w-0 pointer-events-none'
      }`}>
      <Menu />
    </aside>
  );
}
