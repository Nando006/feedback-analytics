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
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Informações básicas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-field">
              <label>Nome completo</label>
              <div className="skeleton h-10" />
            </div>
            <div className="form-field">
              <label>Username</label>
              <div className="skeleton h-10" />
            </div>
            <div className="form-field sm:col-span-2">
              <label>Sobre você</label>
              <div className="skeleton h-24" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Foto de perfil</h2>
          <div className="flex items-center gap-4">
            <div className="avatar-ring size-16">
              <div className="avatar-placeholder text-base">U</div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-10 w-40" />
              <p className="text-xs text-[var(--text-muted)]">
                Suporte a PNG, JPG ou WEBP. Tamanho sugerido 256x256.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">Preferências</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-field">
            <label>Tema</label>
            <div className="skeleton h-10" />
          </div>
          <div className="form-field">
            <label>Idioma</label>
            <div className="skeleton h-10" />
          </div>
        </div>
      </section>
    </div>
  );
}
