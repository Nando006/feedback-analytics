import { Link } from 'react-router-dom';
import Avatar from '../shared/avatar';
import type { PropsEnterpriseAndUser } from 'lib/interfaces/entities/enterpriseAndUser';
import CardSimple from '../shared/cards/cardSimple';

export default function Header({ enterprise, user }: PropsEnterpriseAndUser) {
  return (
    <CardSimple type="header">
      <Avatar />

      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
          {enterprise.full_name ?? user.email ?? '-'}
        </h1>
      </div>

      <Link
        to="/user/edit/profile"
        className="btn-primary">
        Editar perfil
      </Link>
      <Link
        to="/user/edit/collecting-data-enterprise"
        className="btn-primary"
      >
        Informações da Empresa
      </Link>
    </CardSimple>
  );
}
