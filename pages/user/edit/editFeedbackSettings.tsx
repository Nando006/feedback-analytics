import { useEffect } from 'react';
import { Link, useActionData } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import FormFeedbackSettings from 'components/user/pages/profile/editFeedbackSettings/formFeedbackSettings';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';

export default function EditFeedbackSettings() {
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  useEffect(() => {
    if (!actionData) {
      return;
    }

    if (actionData.ok) {
      toast.success('Configurações salvas!', actionData.message || 'Atualização realizada com sucesso.');
      return;
    }

    if (actionData.error || actionData.message) {
      toast.error(
        'Erro ao salvar configurações',
        actionData.message || 'Revise os dados e tente novamente.',
      );
    }
  }, [actionData, toast]);

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <CardSimple
        type="header"
        disableGlass
      >
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-montserrat text-2xl font-semibold tracking-tight text-(--text-primary) md:text-3xl">
              Configuração de Feedbacks
            </h1>
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              Gerencie perguntas dinâmicas e catálogos por tipo de feedback.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/user/edit/collecting-data-enterprise"
              className="btn-ghost font-poppins"
            >
              Informações Gerais
            </Link>
            <Link
              to="/user/profile"
              className="btn-primary font-poppins"
            >
              Ver Perfil
            </Link>
          </div>
        </div>
      </CardSimple>

      <CardSimple disableGlass>
        <div className="w-full space-y-5">
          <div className="border-b border-(--quaternary-color)/10 pb-4">
            <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
              Perguntas e Itens por Tipo
            </h2>
            <p className="mt-2 text-sm text-(--text-tertiary)">
              Empresa, produtos, serviços e departamentos possuem configurações independentes.
            </p>
          </div>

          <FormFeedbackSettings />
        </div>
      </CardSimple>
    </div>
  );
}
