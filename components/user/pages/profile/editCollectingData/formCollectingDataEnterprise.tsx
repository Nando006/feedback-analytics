import type {
  CatalogItemInput,
  CollectingDataEnterprise,
} from 'lib/interfaces/entities/enterprise.entity';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Form, useRouteLoaderData } from 'react-router-dom';
import FieldCompanyObjective from './fields/fieldCompanyObjective';
import FieldAnalyticsGoal from './fields/fieldAnalyticsGoal';
import FieldBusinessSummary from './fields/fieldBusinessSummary';
import FieldUsesCompanyProducts from './fields/fieldUsesCompanyProducts';
import FieldCatalogItems from './fields/fieldCatalogItems';

function normalizeCatalogInput(items: CatalogItemInput[] | undefined) {
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

function buildLegacyProducts(items: CatalogItemInput[]) {
  return items
    .map((item) => String(item.name ?? '').trim())
    .filter((name) => name.length > 0)
    .join('\n');
}

export default function FormCollectingDataEnterprise() {
  const { collecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const initialProducts = useMemo(
    () =>
      collecting?.catalog_products && collecting.catalog_products.length > 0
        ? normalizeCatalogInput(collecting.catalog_products)
        : (collecting?.main_products_or_services ?? []).map((name, index) => ({
            name,
            description: '',
            status: 'ACTIVE' as const,
            sort_order: index,
          })),
    [collecting?.catalog_products, collecting?.main_products_or_services],
  );

  const initialServices = useMemo(
    () => normalizeCatalogInput(collecting?.catalog_services),
    [collecting?.catalog_services],
  );

  const initialDepartments = useMemo(
    () => normalizeCatalogInput(collecting?.catalog_departments),
    [collecting?.catalog_departments],
  );

  const [companyObjective, setCompanyObjective] = useState(
    collecting?.company_objective ?? '',
  );
  const [analyticsGoal, setAnalyticsGoal] = useState(
    collecting?.analytics_goal ?? '',
  );
  const [businessSummary, setBusinessSummary] = useState(
    collecting?.business_summary ?? '',
  );
  const [usesCompanyProducts, setUsesCompanyProducts] = useState(
    collecting?.uses_company_products ?? false,
  );
  const [usesCompanyServices, setUsesCompanyServices] = useState(
    collecting?.uses_company_services ?? false,
  );
  const [usesCompanyDepartments, setUsesCompanyDepartments] = useState(
    collecting?.uses_company_departments ?? false,
  );
  const [productItems, setProductItems] = useState<CatalogItemInput[]>(() => initialProducts);
  const [serviceItems, setServiceItems] = useState<CatalogItemInput[]>(() => initialServices);
  const [departmentItems, setDepartmentItems] = useState<CatalogItemInput[]>(() => initialDepartments);
  const productsInputRef = useRef<HTMLInputElement | null>(null);
  const servicesInputRef = useRef<HTMLInputElement | null>(null);
  const departmentsInputRef = useRef<HTMLInputElement | null>(null);
  const legacyProductsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!usesCompanyProducts) {
      setProductItems([]);
    }
  }, [usesCompanyProducts]);

  useEffect(() => {
    if (!usesCompanyServices) {
      setServiceItems([]);
    }
  }, [usesCompanyServices]);

  useEffect(() => {
    if (!usesCompanyDepartments) {
      setDepartmentItems([]);
    }
  }, [usesCompanyDepartments]);

  const handleToggle = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    if (name === 'uses_company_products') {
      setUsesCompanyProducts(checked);
      return;
    }

    if (name === 'uses_company_services') {
      setUsesCompanyServices(checked);
      return;
    }

    if (name === 'uses_company_departments') {
      setUsesCompanyDepartments(checked);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (productsInputRef.current) {
      productsInputRef.current.value = JSON.stringify(productItems);
    }

    if (servicesInputRef.current) {
      servicesInputRef.current.value = JSON.stringify(serviceItems);
    }

    if (departmentsInputRef.current) {
      departmentsInputRef.current.value = JSON.stringify(departmentItems);
    }

    if (legacyProductsInputRef.current) {
      legacyProductsInputRef.current.value = buildLegacyProducts(productItems);
    }
  }, [productItems, serviceItems, departmentItems]);

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="space-y-8">
      <div className="space-y-6">
        <FieldCompanyObjective
          value={companyObjective}
          onChange={setCompanyObjective}
        />

        <FieldAnalyticsGoal
          value={analyticsGoal}
          onChange={setAnalyticsGoal}
        />

        <FieldBusinessSummary
          value={businessSummary}
          onChange={setBusinessSummary}
        />

        <FieldUsesCompanyProducts
          usesCompanyProducts={usesCompanyProducts}
          usesCompanyServices={usesCompanyServices}
          usesCompanyDepartments={usesCompanyDepartments}
          onChange={handleToggle}
        />

        <input
          ref={productsInputRef}
          type="hidden"
          name="catalog_products"
          defaultValue="[]"
        />
        <input
          ref={servicesInputRef}
          type="hidden"
          name="catalog_services"
          defaultValue="[]"
        />
        <input
          ref={departmentsInputRef}
          type="hidden"
          name="catalog_departments"
          defaultValue="[]"
        />
        <input
          ref={legacyProductsInputRef}
          type="hidden"
          name="main_products_or_services"
          defaultValue=""
        />

        {usesCompanyProducts && (
          <FieldCatalogItems
            title="Produtos"
            description="Cadastre os produtos da empresa para segmentar os feedbacks."
            emptyLabel="Nenhum produto cadastrado ainda."
            items={productItems}
            onChange={setProductItems}
          />
        )}

        {usesCompanyServices && (
          <FieldCatalogItems
            title="Serviços"
            description="Cadastre os serviços oferecidos para coletar feedback por serviço."
            emptyLabel="Nenhum serviço cadastrado ainda."
            items={serviceItems}
            onChange={setServiceItems}
          />
        )}

        {usesCompanyDepartments && (
          <FieldCatalogItems
            title="Departamentos"
            description="Cadastre departamentos para direcionar feedback por área."
            emptyLabel="Nenhum departamento cadastrado ainda."
            items={departmentItems}
            onChange={setDepartmentItems}
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-neutral-800 pt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl border border-neutral-700 bg-transparent px-6 py-3 text-sm font-semibold text-neutral-300 transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800/50">
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary group flex items-center gap-2 px-8 py-3">
          <span>Salvar Alterações</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </Form>
  );
}