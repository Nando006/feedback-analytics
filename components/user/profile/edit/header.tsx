import CardSimple from 'components/user/shared/cards/cardSimple';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <CardSimple type="header">
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Editar perfil
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ajuste suas informações pessoais e preferências. Campos e lógica
            serão adicionados posteriormente.
          </p>
        </div>
        <Link
          to="/user/profile"
          className="btn-primary">
          Perfil
        </Link>
      </div>
    </CardSimple>
  );
}
