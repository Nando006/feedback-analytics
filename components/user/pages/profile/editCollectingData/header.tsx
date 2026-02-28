import CardSimple from "components/user/shared/cards/cardSimple";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <CardSimple
      type="header"
      disableGlass>
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Informações da Empresa
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Ajuste suas informações pessoais e preferências. Campos e lógica
            serão adicionados posteriormente.
          </p>
        </div>
        <div className="space-x-4">
          <Link
            to="/user/profile"
            className="btn-primary">
            Perfil
          </Link>
          <Link
            to="/user/edit/profile"
            className="btn-primary"
          >
            Editar Perfil
          </Link>
        </div>
      </div>
    </CardSimple>
  );
}