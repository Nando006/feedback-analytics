import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import { useCallback, useEffect } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import FieldCompanyObjective from './fields/fieldCompanyObjective';
import FieldAnalyticsGoal from './fields/fieldAnalyticsGoal';
import FieldBusinessSummary from './fields/fieldBusinessSummary';

export default function FormCollectingDataEnterprise() {
  const { collecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const fetcher = useFetcher();
  const toast = useToast();
  const isSaving = fetcher.state === 'submitting';

  useEffect(() => {
    const data = fetcher.data as ActionData | undefined;
    if (!data) return;

    if (data.ok) {
      toast.success('Configurações salvas!', 'Dados de coleta atualizados com sucesso');
    } else {
      toast.error('Erro ao salvar configurações', data.message || 'Tente novamente em instantes');
    }
  }, [fetcher.data, toast]);

  const handleSubmit = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  return (
    <div className="relative w-full">
      <fetcher.Form
        method="post"
        action="/user/edit/collecting-data-enterprise"
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <div className="space-y-6">
          <FieldCompanyObjective
            defaultValue={collecting?.company_objective ?? ""}
          />

          <FieldAnalyticsGoal defaultValue={collecting?.analytics_goal ?? ""} />

          <FieldBusinessSummary
            defaultValue={collecting?.business_summary ?? ""}
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            className="btn-ghost font-poppins group flex items-center gap-2 px-8 py-3"
          >
            <span>Salvar Alterações</span>
          </button>
        </div>
      </fetcher.Form>

      {isSaving && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
      )}
    </div>
  );
}
