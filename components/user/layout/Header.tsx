import type { PropsHeader } from 'lib/interfaces/user/propsHeader';
import { FaBars, FaLayerGroup } from 'react-icons/fa6';

export default function Header({
  isOverlayMode,
  isSidebarOpen,
  onToggleSidebar,
  onSetOverlay,
  onSetPush,
  enterprise,
}: PropsHeader) {
  return (
    <div className="flex h-full items-center gap-8 px-4">
      <div className="space-x-2">
        <button
          type="button"
          aria-label={isSidebarOpen ? 'Fechar' : 'Abrir'}
          title={isSidebarOpen ? 'Fechar' : 'Abrir'}
          className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 text-neutral-100 transition-colors hover:bg-neutral-700"
          onClick={onToggleSidebar}>
          <FaBars className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={isOverlayMode ? 'Sobrepondo' : 'Empurra'}
          title={isOverlayMode ? 'Sobrepondo' : 'Empurra'}
          className={`inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-md border transition-colors ${
            isOverlayMode
              ? 'border-neutral-600 bg-neutral-800 text-neutral-100'
              : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
          }`}
          onClick={() => (isOverlayMode ? onSetPush() : onSetOverlay())}>
          <FaLayerGroup className="h-4 w-4" />
        </button>
      </div>

      {/* Dados da empresa no lado direito */}
      <div className="ml-auto flex items-center gap-3">
        <div className="text-right">
          <h1 className="text-xl font-medium text-neutral-200">
            {enterprise.name}
          </h1>
        </div>
      </div>
    </div>
  );
}
