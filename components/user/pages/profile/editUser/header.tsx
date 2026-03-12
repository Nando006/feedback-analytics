import CardSimple from 'components/user/shared/cards/cardSimple';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <CardSimple type="header">
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-montserrat text-2xl font-semibold tracking-tight text-(--text-primary) md:text-3xl">
            Editar perfil
          </h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">
            Ajuste suas informações pessoais e preferências. Campos e lógica
            serão adicionados posteriormente.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/user/profile"
            className="btn-ghost font-poppins">
            Perfil
          </Link>
          <Link
            to="/user/edit/collecting-data-enterprise"
            className="btn-primary font-poppins"
          >
            Informações da Empresa
          </Link>
        </div>
      </div>
    </CardSimple>
  );
}
