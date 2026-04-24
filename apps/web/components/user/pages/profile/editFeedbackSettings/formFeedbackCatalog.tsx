import type { CatalogItemInput, CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import {
  INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
  INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
} from 'src/lib/constants/routes/intents';
import { useCallback, useRef, useState } from 'react';
import { Form, Link, useRouteLoaderData } from 'react-router-dom';
import FieldCatalogItems from '../editCollectingData/fields/fieldCatalogItems';

export type CatalogType = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

interface FormFeedbackCatalogProps {
  catalogType: CatalogType;
}

const CATALOG_CONFIG = {
  PRODUCT: {
    intent: INTENT_FEEDBACK_SETTINGS_SAVE_PRODUCTS_CATALOG,
    itemsKey: 'catalog_products' as const,
    title: 'Catálogo de Produtos',
    description: 'Cadastre os produtos que terão coleta de feedback por item.',
    emptyLabel: 'Nenhum produto cadastrado ainda.',
    infoText: (count: number) =>
      count > 0
        ? `Você possui ${count} produto(s) no catálogo.`
        : 'Adicione produtos para habilitar a coleta de feedback por item.',
    qrLink: '/user/qrcode/products',
    qrLabel: 'Configurar perguntas por produto',
  },
  SERVICE: {
    intent: INTENT_FEEDBACK_SETTINGS_SAVE_SERVICES_CATALOG,
    itemsKey: 'catalog_services' as const,
    title: 'Catálogo de Serviços',
    description: 'Cadastre os serviços que terão coleta de feedback por item.',
    emptyLabel: 'Nenhum serviço cadastrado ainda.',
    infoText: (count: number) =>
      count > 0
        ? `Você possui ${count} serviço(s) no catálogo.`
        : 'Adicione serviços para habilitar a coleta de feedback por item.',
    qrLink: '/user/qrcode/services',
    qrLabel: 'Configurar perguntas por serviço',
  },
  DEPARTMENT: {
    intent: INTENT_FEEDBACK_SETTINGS_SAVE_DEPARTMENTS_CATALOG,
    itemsKey: 'catalog_departments' as const,
    title: 'Catálogo de Departamentos',
    description: 'Cadastre os departamentos que terão coleta de feedback por item.',
    emptyLabel: 'Nenhum departamento cadastrado ainda.',
    infoText: (count: number) =>
      count > 0
        ? `Você possui ${count} departamento(s) no catálogo.`
        : 'Adicione departamentos para habilitar a coleta de feedback por item.',
    qrLink: '/user/qrcode/departments',
    qrLabel: 'Configurar perguntas por departamento',
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

export default function FormFeedbackCatalog({ catalogType }: FormFeedbackCatalogProps) {
  const { collecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const config = CATALOG_CONFIG[catalogType];

  const [items, setItems] = useState<CatalogItemInput[]>(() =>
    normalizeCatalogInput(collecting?.[config.itemsKey] as CatalogItemInput[] | undefined),
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

      <div className="rounded-xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4">
        <p className="text-sm text-(--text-secondary)">{config.infoText(items.length)}</p>
        <p className="mt-1 text-xs text-(--text-tertiary)">
          Após salvar o catálogo, configure as perguntas de cada item nos QR Codes correspondentes.
        </p>
      </div>

      <FieldCatalogItems
        title={config.title}
        description={config.description}
        emptyLabel={config.emptyLabel}
        items={items}
        onChange={setItems}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-(--quaternary-color)/10 pt-5">
        <button
          type="submit"
          className="btn-primary font-poppins px-6 py-3 text-sm"
        >
          Salvar Catálogo
        </button>
        {items.length > 0 ? (
          <Link
            to={config.qrLink}
            className="btn-ghost font-poppins px-4 py-3 text-sm"
          >
            {config.qrLabel}
          </Link>
        ) : (
          <span className="rounded-lg border border-(--quaternary-color)/12 px-4 py-3 text-xs text-(--text-tertiary)">
            Cadastre ao menos um item para configurar perguntas por QR Code.
          </span>
        )}
      </div>
    </Form>
  );
}
