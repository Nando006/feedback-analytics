import { useEffect } from 'react';
import { Form, useActionData, useNavigation } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import FormTypesFeedback from 'components/user/pages/profile/editTypesFeedback/formTypesFeedback';
import FormCollectingDataEnterprise from 'components/user/pages/profile/editCollectingData/formCollectingDataEnterprise';
import { QuestionDynamicEnterprise } from 'components/user/pages/profile/questionsDynamic/questionDynamicEnterprise';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import SettingsPageHeader from 'components/user/shared/settingsPageHeader';
import { FaFloppyDisk } from 'react-icons/fa6';

export default function FormHub() {
  const toast = useToast();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  
  const isSaving = navigation.state === 'submitting';

  useEffect(() => {
    if (!actionData) return;
    if (actionData.ok) {
      toast.success('Alterações salvas!', 'Suas configurações de formulário foram atualizadas.');
    } else if (actionData.message) {
      toast.error('Erro ao salvar', actionData.message);
    }
  }, [actionData, toast]);

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Configurações do Formulário"
        description="Personalize a identidade da sua empresa e a forma como coleta os feedbacks."
        primaryAction={{
          label: 'Salvar Alterações',
          type: 'submit',
          form: 'form-hub',
          loading: isSaving,
          icon: <FaFloppyDisk className="h-4 w-4" />,
        }}
      />

      <Form id="form-hub" method="post" className="space-y-10">
        <section>
          <div className="mb-4 px-1">
            <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
              Identidade da Empresa
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              Defina o objetivo e o foco da sua empresa para melhorar as análises de IA.
            </p>
          </div>
          <div className="relative">
            <FormCollectingDataEnterprise hideSubmit />
            {isSaving && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-(--bg-primary)/20 backdrop-blur-[1px]" />
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 px-1">
            <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
              Tipos de Feedback
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              Ative as categorias que sua empresa utiliza para organizar a coleta.
            </p>
          </div>
          <div className="relative">
            <FormTypesFeedback hideSubmit />
            {isSaving && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-(--bg-primary)/20 backdrop-blur-[1px]" />
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 px-1">
            <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
              Perguntas do Formulário
            </h2>
            <p className="text-sm text-(--text-tertiary)">
              Defina perguntas objetivas (escala de 1 a 5) que serão exibidas aos clientes.
            </p>
          </div>
          <QuestionDynamicEnterprise hideSubmit />
        </section>
      </Form>
    </div>
  );
}
