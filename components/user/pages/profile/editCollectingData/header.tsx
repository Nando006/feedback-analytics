import CardSimple from "components/user/shared/cards/cardSimple";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <CardSimple
      type="header"
      disableGlass>
      <div className="font-work-sans flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-montserrat text-2xl font-semibold tracking-tight text-(--text-primary) md:text-3xl">
            Informações Gerais
          </h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">
            Atualize os dados estratégicos da empresa e acesse a configuração de feedbacks por tipo.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/user/edit/feedback-settings"
            className="btn-ghost font-poppins">
            Configuração de Feedbacks
          </Link>
          <Link
            to="/user/profile"
            className="btn-ghost font-poppins">
            Perfil
          </Link>
          <Link
            to="/user/edit/profile"
            className="btn-primary font-poppins"
          >
            Editar Perfil
          </Link>
        </div>
      </div>
    </CardSimple>
  );
}