import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import { useCallback, useState, type ChangeEvent } from 'react';
import { Form, useRouteLoaderData } from 'react-router-dom';
import FieldUsesCompanyProducts from '../editCollectingData/fields/fieldUsesCompanyProducts';

export default function FormTypesFeedback() {
  const { collecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const [usesCompanyProducts, setUsesCompanyProducts] = useState(
    collecting?.uses_company_products ?? false,
  );
  const [usesCompanyServices, setUsesCompanyServices] = useState(
    collecting?.uses_company_services ?? false,
  );
  const [usesCompanyDepartments, setUsesCompanyDepartments] = useState(
    collecting?.uses_company_departments ?? false,
  );

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
  }, []);

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="space-y-8">
      <FieldUsesCompanyProducts
        usesCompanyProducts={usesCompanyProducts}
        usesCompanyServices={usesCompanyServices}
        usesCompanyDepartments={usesCompanyDepartments}
        onChange={handleToggle}
      />

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
          </svg>
        </button>
      </div>
    </Form>
  );
}
