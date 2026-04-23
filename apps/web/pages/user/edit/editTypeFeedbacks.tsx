import { useEffect } from 'react';
import { useActionData, useNavigation, useRouteLoaderData } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import FormTypesFeedback from 'components/user/pages/profile/editTypesFeedback/formTypesFeedback';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import Header from 'components/user/shared/header';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type { CollectingDataEnterprise, Enterprise } from 'lib/interfaces/entities/enterprise.entity';

export default function EditTypeFeedbacks() {
  const toast = useToast();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const isSaving =
    navigation.state === 'submitting' &&
    navigation.formAction?.includes('/user/edit/types-feedback');
  const { user, enterprise } = useRouteLoaderData('user') as {
    user: AuthUser['user'];
    enterprise: Enterprise;
    collecting: CollectingDataEnterprise | null;
  };

  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success('Configurações salvas!', 'Tipos de feedback atualizados com sucesso');
    } else {
      toast.error('Erro ao salvar configurações', actionData.message || 'Tente novamente em instantes');
    }
  }, [actionData, toast]);

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <Header
        description="Defina os tipos de feedback habilitados para a sua empresa. Isso controla quais QR Codes ficam disponíveis."
        nextLink="/user/edit/feedback-settings"
        nextLabelLink="Configurações de Feedbacks"
        prevLabelLink="Dados da empresa"
        prevLink="/user/edit/collecting-data-enterprise"
        enterprise={enterprise}
        user={user}
      />

      <CardSimple disableGlass>
        <div className="relative w-full">
          <FormTypesFeedback />

          {isSaving && (
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
          )}
        </div>
      </CardSimple>
    </div>
  );
}
