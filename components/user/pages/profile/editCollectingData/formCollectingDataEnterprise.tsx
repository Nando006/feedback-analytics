import type {
  CatalogItemInput,
  CollectingDataEnterprise,
} from 'lib/interfaces/entities/enterprise.entity';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
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

  const initialProducts =
    collecting?.catalog_products && collecting.catalog_products.length > 0
      ? normalizeCatalogInput(collecting.catalog_products)
      : (collecting?.main_products_or_services ?? []).map((name, index) => ({
          name,
          description: '',
          status: 'ACTIVE' as const,
          sort_order: index,
        }));

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
  const [productItems, setProductItems] = useState<CatalogItemInput[]>(
    initialProducts,
  );
  const [serviceItems, setServiceItems] = useState<CatalogItemInput[]>(
    normalizeCatalogInput(collecting?.catalog_services),
  );
  const [departmentItems, setDepartmentItems] = useState<CatalogItemInput[]>(
    normalizeCatalogInput(collecting?.catalog_departments),
  );

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

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
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
  };

  const serializedProducts = useMemo(
    () => JSON.stringify(productItems),
    [productItems],
  );
  const serializedServices = useMemo(
    () => JSON.stringify(serviceItems),
    [serviceItems],
  );
  const serializedDepartments = useMemo(
    () => JSON.stringify(departmentItems),
    [departmentItems],
  );
  const legacyProductsText = useMemo(
    () => buildLegacyProducts(productItems),
    [productItems],
  );

  return (
    <Form
      method="post"
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
          type="hidden"
          name="catalog_products"
          value={serializedProducts}
        />
        <input
          type="hidden"
          name="catalog_services"
          value={serializedServices}
        />
        <input
          type="hidden"
          name="catalog_departments"
          value={serializedDepartments}
        />
        <input
          type="hidden"
          name="main_products_or_services"
          value={legacyProductsText}
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