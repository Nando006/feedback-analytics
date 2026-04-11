import { Link } from 'react-router-dom';
import type { EnterpriseAndUser } from 'lib/interfaces/entities/enterprise-and-user.entity';
import Avatar from 'components/user/shared/avatar';
import CardSimple from 'components/user/shared/cards/cardSimple';
export default function Header({ enterprise, user }: EnterpriseAndUser) {
  return (
    <CardSimple type="header">
      <Avatar />

      <div className="min-w-0 flex-1">
        <h1 className="font-montserrat text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
          {enterprise.full_name ?? user.email ?? '-'}
        </h1>
      </div>

      <Link
        to="/user/edit/profile"
        className="btn-primary font-poppins">
        Editar perfil
      </Link>
      <Link
        to="/user/edit/collecting-data-enterprise"
        className="btn-primary font-poppins"
      >
        Informações da Empresa
      </Link>
    </CardSimple>
  );
}
