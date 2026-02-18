import CardSimple from 'components/user/shared/cards/cardSimple';
import type { EnterpriseAndCollectingData } from 'lib/interfaces/entities/enterprise.entity';
import { formatDocument } from 'lib/utils/formatDocument';
import { formatPhone } from 'lib/utils/formatPhone';

export default function Info({
  enterprise,
  collecting,
}: EnterpriseAndCollectingData) {
  return (
    <div className="">
      <div className="space-y-6 lg:col-span-2">
        <CardSimple>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Objetivo</h2>
            </div>
            <p className="max-w-2xl text-[var(--text-secondary)]">
              {collecting?.business_summary ?? 'Conte sobre sua empresa...'}
            </p>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Usa produtos próprios?{' '}
            {collecting?.uses_company_products ? 'Sim' : 'Não informado'}
          </p>
        </CardSimple>

        <CardSimple>
          <div className="w-full">
            <h2 className="mb-4 text-lg font-semibold">
              Informações de contato
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">Email</p>
                <p className="mt-1 font-medium">{enterprise?.email ?? ''}</p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">Telefone</p>
                <p className="mt-1 font-medium">
                  {formatPhone(enterprise?.phone ?? '') ?? ''}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">
                  {enterprise?.account_type ?? 'Documento'}
                </p>
                <p className="mt-1 font-medium">
                  {formatDocument(
                    enterprise?.document,
                    enterprise?.account_type,
                  ) ?? ''}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">
                  Data de Criação
                </p>
                <p className="mt-1 font-medium">
                  {new Date(enterprise?.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </CardSimple>
      </div>
    </div>
  );
}
