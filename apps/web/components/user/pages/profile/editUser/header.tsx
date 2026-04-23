import { Link } from "react-router-dom";
import type { EnterpriseAndUser } from "lib/interfaces/entities/enterprise-and-user.entity";
import Avatar from "components/user/shared/avatar";
import CardSimple from "components/user/shared/cards/cardSimple";
import { FaShieldHalved, FaUser } from "react-icons/fa6";
export default function Header({ enterprise, user }: EnterpriseAndUser) {
  return (
    <CardSimple type="header">
      <div className="font-work-sans">
        <div className="text-center">
          <Avatar />
          <h1 className="font-montserrat text-4xl font-bold tracking-tight text-(--text-primary) mb-3">
            {enterprise.full_name ?? user.email ?? "-"}
          </h1>
          <p className="text-(--text-secondary) text-lg max-w-2xl mx-auto leading-relaxed">
            Edite suas informações pessoais com facilidade. Clique em qualquer
            campo para modificá-lo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-(--quaternary-color)/20">
          {/* Indicadores de status */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-(--positive)/10 text-(--positive) rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-(--positive) rounded-full animate-pulse"></div>
              Conta ativa
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-(--primary-color)/10 text-(--primary-color) rounded-full text-sm font-medium">
              <FaShieldHalved aria-hidden="true" />
              Verificado
            </div>
          </div>

          {/* Links de navegação */}
          <div className="flex gap-3">
            <Link
              to="/user/profile"
              className="btn-ghost font-poppins flex items-center gap-2 px-4 py-2 text-sm hover:scale-105 transition-transform"
            >
              <FaUser aria-hidden="true" />
              Ver perfil
            </Link>
          </div>
        </div>
      </div>
    </CardSimple>
  );
}
