import type {
  CatalogItemInput,
  CompanyFeedbackQuestionInput,
  CollectingDataEnterprise,
} from 'lib/interfaces/entities/enterprise.entity';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Form, useRouteLoaderData } from 'react-router-dom';
import FieldCompanyObjective from './fields/fieldCompanyObjective';
import FieldAnalyticsGoal from './fields/fieldAnalyticsGoal';
import FieldBusinessSummary from './fields/fieldBusinessSummary';
import FieldUsesCompanyProducts from './fields/fieldUsesCompanyProducts';
import FieldCatalogItems from './fields/fieldCatalogItems';
import FieldCompanyFeedbackQuestions from './fields/fieldCompanyFeedbackQuestions';

const DEFAULT_COMPANY_FEEDBACK_QUESTIONS: CompanyFeedbackQuestionInput[] = [
  {
    question_order: 1,
    question_text: 'Como foi sua experiência em relação ao atendimento?',
    is_active: true,
  },
  {
    question_order: 2,
    question_text: 'O que você achou da qualidade do produto/serviço?',
    is_active: true,
  },
  {
    question_order: 3,
    question_text:
      'Como você avalia a relação entre o valor pago e a qualidade do produto/serviço?',
    is_active: true,
  },
];

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

function normalizeCompanyFeedbackQuestions(
  items: CollectingDataEnterprise['company_feedback_questions'] | undefined,
) {
  const byOrder = new Map<number, CompanyFeedbackQuestionInput>();

  (items ?? []).forEach((item) => {
    const order = Number(item.question_order);
    if (!Number.isInteger(order) || order < 1 || order > 3) return;

    byOrder.set(order, {
      question_order: order as 1 | 2 | 3,
      question_text: item.question_text ?? '',
      is_active: item.is_active ?? true,
    });
  });

  return DEFAULT_COMPANY_FEEDBACK_QUESTIONS.map((fallback, index) => {
    const current = byOrder.get(index + 1);

    return {
      question_order: ((index + 1) as 1 | 2 | 3),
      question_text: current?.question_text ?? fallback.question_text,
      is_active: current?.is_active ?? true,
    };
  });
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

  const initialCompanyFeedbackQuestions = useMemo(
    () => normalizeCompanyFeedbackQuestions(collecting?.company_feedback_questions),
    [collecting?.company_feedback_questions],
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
  const [companyFeedbackQuestions, setCompanyFeedbackQuestions] = useState<CompanyFeedbackQuestionInput[]>(
    () => initialCompanyFeedbackQuestions,
  );
  const productsInputRef = useRef<HTMLInputElement | null>(null);
  const servicesInputRef = useRef<HTMLInputElement | null>(null);
  const departmentsInputRef = useRef<HTMLInputElement | null>(null);
  const legacyProductsInputRef = useRef<HTMLInputElement | null>(null);
  const companyQuestionsInputRef = useRef<HTMLInputElement | null>(null);

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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

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

    if (companyQuestionsInputRef.current) {
      companyQuestionsInputRef.current.value = JSON.stringify(
        companyFeedbackQuestions.map((question, index) => ({
          question_order: (index + 1) as 1 | 2 | 3,
          question_text: String(question.question_text ?? '').trim(),
          is_active: question.is_active ?? true,
        })),
      );
    }
  }, [productItems, serviceItems, departmentItems, companyFeedbackQuestions]);

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="space-y-8">
      <div className="space-y-6">
        <FieldCompanyObjective
          defaultValue={collecting?.company_objective ?? ''}
        />

        <FieldAnalyticsGoal
          defaultValue={collecting?.analytics_goal ?? ''}
        />

        <FieldBusinessSummary
          defaultValue={collecting?.business_summary ?? ''}
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
        <input
          ref={companyQuestionsInputRef}
          type="hidden"
          name="company_feedback_questions"
          defaultValue="[]"
        />

        <FieldCompanyFeedbackQuestions
          questions={companyFeedbackQuestions}
          onChange={setCompanyFeedbackQuestions}
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

      <div className="flex items-center justify-end gap-4 border-t border-(--quaternary-color)/10 pt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-ghost font-poppins px-6 py-3 text-sm">
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary font-poppins group flex items-center gap-2 px-8 py-3">
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
            {/* <polyline points="9 18 15 12 9 6"></polyline> */}
          </svg>
        </button>
      </div>
    </Form>
  );
}