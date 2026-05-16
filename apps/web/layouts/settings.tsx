import { Outlet } from 'react-router-dom';

export default function SettingsLayout() {
  return (
    <div className="flex flex-col gap-8">
      {/* Sidebar de Configurações removida por redundância com a sidebar global */}

      {/* Conteúdo da Configuração */}
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 lg:p-8 glass-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
