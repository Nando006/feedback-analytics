import type { CatalogItemInput, CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import {
  INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
  INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
} from 'src/lib/constants/routes/intents';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, useFetcher, useRouteLoaderData } from 'react-router-dom';
import FieldCatalogItems from '../editCollectingData/fields/fieldCatalogItems';
import { useToast } from 'components/public/forms/messages/useToast';
import type { QrCodeCatalogLoadData, QrCodeCatalogLoadItem } from 'src/routes/load/loadQrCodeCatalog';
import type { QrCatalogActionResponse } from 'components/user/pages/qrcodeCatalog/ui.types';
import type { QrCatalogQuestionInput } from 'src/services/serviceCollectionPoints';

export type CatalogType = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

interface FormFeedbackCatalogProps {
  catalogType: CatalogType;
  qrData?: QrCodeCatalogLoadData;
}

const CATALOG_CONFIG = {
  PRODUCT: {
    intent: INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
    itemsKey: 'catalog_products' as const,
    title: 'Catálogo de Produtos',
    description: 'Cadastre os produtos que terão coleta de feedback por item.',
    emptyLabel: 'Nenhum produto cadastrado ainda.',
  },
  SERVICE: {
    intent: INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
    itemsKey: 'catalog_services' as const,
    title: 'Catálogo de Serviços',
    description: 'Cadastre os serviços que terão coleta de feedback por item.',
    emptyLabel: 'Nenhum serviço cadastrado ainda.',
  },
  DEPARTMENT: {
    intent: INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
    itemsKey: 'catalog_departments' as const,
    title: 'Catálogo de Departamentos',
    description: 'Cadastre os departamentos que terão coleta de feedback por item.',
    emptyLabel: 'Nenhum departamento cadastrado ainda.',
  },
} as const;

function normalizeCatalogInput(items: CatalogItemInput[] | undefined): CatalogItemInput[] {
  return (items ?? []).map((item, index) => ({
    ...(item.id ? { id: item.id } : {}),
    name: item.name ?? '',
    description: item.description ?? '',
    status: item.status ?? 'ACTIVE',
    sort_order:
      typeof item.sort_order === 'number' && Number.isFinite(item.sort_order)
        ? item.sort_order
        : index,
  }));
}

export default function FormFeedbackCatalog({ catalogType, qrData }: FormFeedbackCatalogProps) {
  const toast = useToast();
  const { collecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const config = CATALOG_CONFIG[catalogType];

  const [items, setItems] = useState<CatalogItemInput[]>(() =>
    normalizeCatalogInput(collecting?.[config.itemsKey] as CatalogItemInput[] | undefined),
  );

  const [qrItems, setQrItems] = useState<QrCodeCatalogLoadItem[]>(qrData?.items ?? []);
  const [savingQuestionsItemId, setSavingQuestionsItemId] = useState<string | null>(null);
  const [togglePendingItemId, setTogglePendingItemId] = useState<string | null>(null);

  const qrFetcher = useFetcher<QrCatalogActionResponse>();

  useEffect(() => {
    setQrItems(qrData?.items ?? []);
  }, [qrData]);

  useEffect(() => {
    if (qrFetcher.state !== 'idle' || !qrFetcher.data) return;

    const data = qrFetcher.data;

    if (data.ok && data.catalog_item_id) {
      const id = data.catalog_item_id;

      if (data.questionsSaved) {
        setQrItems((prev) =>
          prev.map((qr) =>
            qr.catalog_item_id !== id ? qr : { ...qr, questions: data.questions ?? qr.questions },
          ),
        );
        toast.success('Perguntas salvas!', 'Configuração do item atualizada.');
      } else {
        setQrItems((prev) =>
          prev.map((qr) =>
            qr.catalog_item_id !== id
              ? qr
              : {
                  ...qr,
                  active: Boolean(data.active),
                  collection_point_id: data.active
                    ? (data.collection_point_id ?? qr.collection_point_id)
                    : null,
                },
          ),
        );
        if (data.active) {
          toast.success('QR Code ativado!', 'Item disponível para coleta de feedback.');
        } else {
          toast.success('QR Code desativado!', 'Item removido da coleta.');
        }
      }
    } else if (data.error) {
      toast.error('Erro na operação', data.error);
    }

    setSavingQuestionsItemId(null);
    setTogglePendingItemId(null);
  }, [qrFetcher.state, qrFetcher.data, toast]);

  const handleSaveQuestions = useCallback(
    (catalogItemId: string, questions: QrCatalogQuestionInput[]) => {
      setSavingQuestionsItemId(catalogItemId);
      qrFetcher.submit(
        {
          intent: INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
          catalog_item_id: catalogItemId,
          questions: JSON.stringify(questions),
        },
        { method: 'post' },
      );
    },
    [qrFetcher],
  );

  const handleToggle = useCallback(
    (catalogItemId: string, isActive: boolean) => {
      setTogglePendingItemId(catalogItemId);
      qrFetcher.submit(
        {
          intent: isActive ? INTENT_QR_DISABLE : INTENT_QR_ENABLE,
          catalog_item_id: catalogItemId,
        },
        { method: 'post' },
      );
    },
    [qrFetcher],
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (inputRef.current) {
      inputRef.current.value = JSON.stringify(items);
    }
  }, [items]);

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="intent" value={config.intent} />
      <input ref={inputRef} type="hidden" name="catalog_items" defaultValue="[]" />

      <FieldCatalogItems
        title={config.title}
        description={config.description}
        emptyLabel={config.emptyLabel}
        items={items}
        onChange={setItems}
        qrItems={qrData ? qrItems : undefined}
        savingQuestionsItemId={savingQuestionsItemId}
        onSaveQuestions={qrData ? handleSaveQuestions : undefined}
        togglePendingItemId={togglePendingItemId}
        onToggle={qrData ? handleToggle : undefined}
      />

      <div className="flex items-center border-t border-(--quaternary-color)/10 pt-5">
        <button type="submit" className="btn-primary font-poppins px-6 py-3 text-sm">
          Salvar Catálogo
        </button>
      </div>
    </Form>
  );
}
