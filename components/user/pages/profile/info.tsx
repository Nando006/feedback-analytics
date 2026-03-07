import CardSimple from 'components/user/shared/cards/cardSimple';
import type { EnterpriseAndCollectingData } from 'lib/interfaces/entities/enterprise.entity';
import { formatDocument } from 'lib/utils/formatDocument';
import { formatPhone } from 'lib/utils/formatPhone';

export default function Info({
  enterprise,
  collecting,
}: EnterpriseAndCollectingData) {
  return (
    <div>
      <div className="space-y-6 lg:col-span-2">
        <CardSimple>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--text-primary)">Objetivo</h2>
            </div>
            <p className="max-w-2xl text-(--text-secondary)">
              {collecting?.business_summary ?? 'Conte sobre sua empresa...'}
            </p>
          </div>
          <p className="text-sm text-(--text-tertiary)">
            Usa produtos próprios?{' '}
            {collecting?.uses_company_products ? 'Sim' : 'Não informado'}
          </p>
        </CardSimple>

        <CardSimple>
          <div className="w-full">
            <h2 className="mb-4 text-lg font-semibold text-(--text-primary)">
              Informações de contato
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
                <p className="text-xs text-(--text-tertiary)">Email</p>
                <p className="mt-1 font-medium text-(--text-primary)">{enterprise?.email ?? ''}</p>
              </div>
              <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
                <p className="text-xs text-(--text-tertiary)">Telefone</p>
                <p className="mt-1 font-medium text-(--text-primary)">
                  {formatPhone(enterprise?.phone ?? '') ?? ''}
                </p>
              </div>
              <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
                <p className="text-xs text-(--text-tertiary)">
                  {enterprise?.account_type ?? 'Documento'}
                </p>
                <p className="mt-1 font-medium text-(--text-primary)">
                  {formatDocument(
                    enterprise?.document,
                    enterprise?.account_type,
                  ) ?? ''}
                </p>
              </div>
              <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
                <p className="text-xs text-(--text-tertiary)">
                  Data de Criação
                </p>
                <p className="mt-1 font-medium text-(--text-primary)">
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
