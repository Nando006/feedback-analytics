import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaRightFromBracket, FaUser } from 'react-icons/fa6';
import Avatar from 'components/user/shared/avatar';
import { useTruncatedText } from 'src/lib/utils/truncateText';
import type { EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';
import type { AccountMenuProps } from './ui.types';

function getSubscriptionBadge(enterprise: EnterpriseContext) {
  const status = enterprise.subscription_status;

  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-(--positive)/10 px-2.5 py-1 text-xs font-medium text-(--positive)">
        <span className="h-1.5 w-1.5 rounded-full bg-(--positive)" />
        Conta ativa
      </span>
    );
  }

  if (status === 'TRIAL') {
    const daysLeft = enterprise.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(enterprise.trial_ends_at).getTime() - Date.now()) / 86_400_000))
      : null;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {daysLeft !== null
          ? `Teste · ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`
          : 'Em período de teste'}
      </span>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Trial encerrado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-2.5 py-1 text-xs font-medium text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Conta cancelada
    </span>
  );
}

/**
 * Menu de conta no topo do layout: identidade da empresa, status do plano e
 * acesso a "Minha conta" e "Sair". Substitui o nome-da-empresa-como-título das
 * telas e o card de perfil que ficava no rodapé da sidebar.
 */
export default function AccountMenu({ enterprise, onSignOut, isSigningOut = false }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const name = enterprise.full_name ?? enterprise.email ?? 'Minha conta';
  const { display } = useTruncatedText(name, 22);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) px-2 py-1.5 text-sm text-(--text-primary) transition-colors hover:border-(--quaternary-color)/22 hover:bg-(--bg-tertiary)">
        <span className="h-7 w-7 overflow-hidden rounded-full">
          <Avatar />
        </span>
        <span className="hidden max-w-40 truncate sm:inline">{display}</span>
        <FaChevronDown
          className={`h-3 w-3 text-(--text-tertiary) transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-(--quaternary-color)/12 bg-(--bg-secondary) p-2 shadow-lg ring-1 ring-(--quaternary-color)/10">
            <div className="border-b border-(--quaternary-color)/10 px-2 pb-3 pt-1">
              <p className="truncate text-sm font-semibold text-(--text-primary)">{name}</p>
              {enterprise.email && (
                <p className="mt-0.5 truncate text-xs text-(--text-tertiary)">{enterprise.email}</p>
              )}
              <div className="mt-2">{getSubscriptionBadge(enterprise)}</div>
            </div>

            <Link
              to="/user/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="mt-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm text-(--text-secondary) transition-colors hover:bg-(--seventh-color) hover:text-(--text-primary)">
              <FaUser className="h-3.5 w-3.5 text-(--text-tertiary)" />
              Minha conta
            </Link>

            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-(--negative) transition-colors hover:bg-(--negative)/10 disabled:opacity-60">
              <FaRightFromBracket className="h-3.5 w-3.5" />
              {isSigningOut ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
