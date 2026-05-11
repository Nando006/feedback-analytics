import { useEffect, useState, useCallback } from 'react';
import { Form, useActionData, useNavigation, useRouteLoaderData } from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import FormFeedbackCatalog from 'components/user/pages/profile/editFeedbackSettings/formFeedbackCatalog';
import { useToast } from 'components/public/forms/messages/useToast';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import { loadQrCodeCatalogData } from 'src/routes/load/loadQrCodeCatalog';
import type { QrCodeCatalogLoadData } from 'src/routes/load/loadQrCodeCatalog';
import SettingsPageHeader from 'components/user/shared/settingsPageHeader';
import { FaFloppyDisk } from 'react-icons/fa6';

import type { CatalogType } from './ui.types';

export default function CatalogHub() {
  const toast = useToast();
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const { collecting: initialCollecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const [activeTab, setActiveTab] = useState<CatalogType>('PRODUCT');
  const [qrData, setQrData] = useState<QrCodeCatalogLoadData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCatalogData = useCallback(async (type: CatalogType) => {
    setLoading(true);
    try {
      const data = await loadQrCodeCatalogData(type);
      setQrData(data);
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
      toast.error('Erro ao carregar catálogo');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCatalogData(activeTab);
  }, [activeTab, fetchCatalogData]);

  useEffect(() => {
    if (!actionData) return;
    if (actionData.ok) {
      toast.success('Catálogo salvo!', actionData.message || 'Dados atualizados com sucesso.');
    } else if (actionData.message) {
      toast.error('Erro ao salvar', actionData.message);
    }
  }, [actionData, toast]);

  const tabs = [
    { id: 'PRODUCT', label: 'Produtos', enabled: initialCollecting?.uses_company_products },
    { id: 'SERVICE', label: 'Serviços', enabled: initialCollecting?.uses_company_services },
    { id: 'DEPARTMENT', label: 'Departamentos', enabled: initialCollecting?.uses_company_departments },
  ] as const;

  const isSaving = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        title="Gestão de Catálogo"
        description="Gerencie os itens disponíveis para avaliação e configure perguntas específicas."
        primaryAction={{
          label: 'Salvar Catálogo',
          type: 'submit',
          form: 'form-catalog',
          loading: isSaving,
          icon: <FaFloppyDisk className="h-4 w-4" />,
        }}
      />

      <div className="flex border-b border-(--quaternary-color)/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.enabled && setActiveTab(tab.id as CatalogType)}
            disabled={!tab.enabled}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-(--primary-color) text-(--text-primary)'
                : tab.enabled
                ? 'border-transparent text-(--text-tertiary) hover:text-(--text-secondary)'
                : 'border-transparent text-(--text-tertiary)/40 cursor-not-allowed'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!initialCollecting?.uses_company_products && 
       !initialCollecting?.uses_company_services && 
       !initialCollecting?.uses_company_departments && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/80">
          Você ainda não ativou nenhum tipo de catálogo. Ative-os na aba <strong>Formulário</strong>.
        </div>
      )}

      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--primary-color)/30 border-t-(--primary-color)" />
          </div>
        ) : (
          <CardSimple>
            <div className="relative w-full">
              <Form id="form-catalog" method="post">
                <FormFeedbackCatalog catalogType={activeTab} qrData={qrData!} />
              </Form>
              {isSaving && (
                <div className="pointer-events-none absolute inset-0 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
              )}
            </div>
          </CardSimple>
        )}
      </div>
    </div>
  );
}
