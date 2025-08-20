import Info from 'components/user/profile/edit/information';
import Preferences from 'components/user/profile/edit/preferences';
import { Link } from 'react-router-dom';

export default function EditProfile() {
  return (
    <div className="font-inter">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Editar perfil
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ajuste suas informações pessoais e preferências. Campos e lógica
            serão adicionados posteriormente.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/user/profile"
            className="btn-ghost">
            Cancelar
          </Link>
          <button
            type="button"
            className="btn-primary"
            disabled>
            Salvar alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Info />
      </div>
      <Preferences />
    </div>
  );
}
