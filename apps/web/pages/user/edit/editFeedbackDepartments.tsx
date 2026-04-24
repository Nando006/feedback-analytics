import { useEffect } from 'react';
import { useActionData, useNavigation, useRouteLoaderData } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import FormFeedbackCatalog from 'components/user/pages/profile/editFeedbackSettings/formFeedbackCatalog';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import Header from 'components/user/shared/header';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';

export default function EditFeedbackDepartments() {
  const toast = useToast();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const isSaving =
    navigation.state === 'submitting' &&
    navigation.formAction?.includes('/user/edit/feedback-departments');
  const { user, enterprise } = useRouteLoaderData('user') as {
    user: AuthUser['user'];
    enterprise: Enterprise;
  };

  useEffect(() => {
    if (!actionData) return;
    if (actionData.ok) {
      toast.success('Catálogo salvo!', actionData.message || 'Catálogo de departamentos atualizado com sucesso.');
    } else {
      toast.error('Erro ao salvar', actionData.message || 'Tente novamente em instantes.');
    }
  }, [actionData, toast]);

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <Header
        description="Gerencie o catálogo de departamentos para coleta de feedback por área."
        prevLink="/user/edit/types-feedback"
        prevLabelLink="Tipos de Feedback"
        nextLink="/user/qrcode/departments"
        nextLabelLink="QR Codes de Departamentos"
        enterprise={enterprise}
        user={user}
      />

      <CardSimple>
        <div className="relative w-full">
          <FormFeedbackCatalog catalogType="DEPARTMENT" />

          {isSaving && (
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
          )}
        </div>
      </CardSimple>
    </div>
  );
}
