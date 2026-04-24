import { useEffect } from 'react';
import { useActionData, useNavigation, useRouteLoaderData } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import FormTypesFeedback from 'components/user/pages/profile/editTypesFeedback/formTypesFeedback';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import Header from 'components/user/shared/header';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type { CollectingDataEnterprise, Enterprise } from 'lib/interfaces/entities/enterprise.entity';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Ative os tipos',
    description: 'Escolha quais categorias sua empresa utiliza: produtos, serviços ou departamentos.',
  },
  {
    step: '02',
    title: 'Configure o catálogo',
    description: 'Cadastre os itens de cada categoria ativada para individualizar a coleta.',
  },
  {
    step: '03',
    title: 'Gere os QR Codes',
    description: 'Cada tipo ganha um QR Code exclusivo para seus clientes avaliarem.',
  },
  {
    step: '04',
    title: 'Receba insights',
    description: 'Feedbacks chegam organizados por tipo, prontos para análise no dashboard.',
  },
];

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
      toast.success('Configurações salvas!', 'Tipos de feedback atualizados com sucesso.');
    } else {
      toast.error('Erro ao salvar', actionData.message || 'Tente novamente em instantes.');
    }
  }, [actionData, toast]);

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <Header
        description="Defina quais tipos de feedback sua empresa coleta. Cada tipo gera um QR Code independente."
        prevLink="/user/profile"
        prevLabelLink="Ver perfil"
        enterprise={enterprise}
        user={user}
      />

      {/* Como funciona */}
      <CardSimple type="header">
        <div className="w-full space-y-5">
          <div>
            <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">
              Como funciona
            </h2>
            <p className="mt-1 text-sm text-(--text-tertiary)">
              Configure os tipos de feedback da sua empresa em 4 passos simples.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex gap-3">
                <span className="font-montserrat text-2xl font-bold leading-none text-(--primary-color)/25">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-(--text-tertiary)">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardSimple>

      {/* Tipos de feedback */}
      <div className="space-y-3">
        <div className="px-1">
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
            Selecione os tipos da sua empresa
          </h2>
          <p className="mt-0.5 text-sm text-(--text-tertiary)">
            Ative os tipos que sua empresa utiliza. Após salvar, o link para configurar o catálogo aparece automaticamente.
          </p>
        </div>

        <div className="relative">
          <FormTypesFeedback />

          {isSaving && (
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
          )}
        </div>
      </div>
    </div>
  );
}
