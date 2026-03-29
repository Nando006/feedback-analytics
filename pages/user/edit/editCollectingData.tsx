import { useEffect } from 'react';
import { useActionData } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import Header from 'components/user/pages/profile/editCollectingData/header';
import FormCollectingDataEnterprise from 'components/user/pages/profile/editCollectingData/formCollectingDataEnterprise';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';

export default function EditCollectingData() {
  const toast = useToast();
  const actionData = useActionData() as ActionData | undefined;

  useEffect(() => {
    if (!actionData) return;
    
    if (actionData.ok) {
      toast.success('Configurações salvas!', 'Dados de coleta atualizados com sucesso');
    } else {
      toast.error('Erro ao salvar configurações', actionData.message || 'Tente novamente em instantes');
    }
  }, [actionData, toast]);

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <Header />

      <CardSimple disableGlass>
        <div className="w-full">
          <div className="mb-6 border-b border-(--quaternary-color)/10 pb-4">
            <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
              Configuração de Coleta de Dados
            </h2>
            <p className="mt-2 text-sm text-(--text-tertiary)">
              Configure como sua empresa irá coletar e utilizar os feedbacks dos clientes.
            </p>
          </div>

          <FormCollectingDataEnterprise />
        </div>
      </CardSimple>
    </div>
  );
}
