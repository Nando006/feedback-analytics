import { memo, type ChangeEvent } from 'react';
import type { FieldUsesCompanyProductsProps } from './ui.types';

const CheckboxItem = memo(function CheckboxItem({
  name,
  checked,
  title,
  description,
  onChange,
}: {
  name: string;
  checked: boolean;
  title: string;
  description: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-(--quaternary-color)/18 bg-(--seventh-color) transition-all checked:border-(--primary-color) checked:bg-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/30"
        />
        <svg
          className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div className="flex-1">
        <span className="block text-sm font-medium text-(--text-primary)">{title}</span>
        <p className="mt-1 text-xs leading-relaxed text-(--text-tertiary)">{description}</p>
      </div>
    </label>
  );
});

const FieldUsesCompanyProducts = memo(function FieldUsesCompanyProducts({
  usesCompanyProducts,
  usesCompanyServices,
  usesCompanyDepartments,
  onChange,
}: FieldUsesCompanyProductsProps) {
  return (
    <div className="font-work-sans space-y-4 rounded-xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5 transition-all duration-200 hover:border-(--quaternary-color)/18">
      <div>
        <h3 className="text-sm font-semibold text-(--text-primary)">Escopo da operação</h3>
        <p className="mt-1 text-xs leading-relaxed text-(--text-tertiary)">
          Marque os tipos utilizados na sua operação para habilitar os QR Codes específicos.
          Para que cada tipo apareça na análise de insights, cadastre ao menos um item no catálogo em{' '}
          <span className="font-medium text-(--text-secondary)">Configuração de Feedbacks</span>.
        </p>
      </div>

      <CheckboxItem
        name="uses_company_products"
        checked={usesCompanyProducts}
        onChange={onChange}
        title="A empresa possui produtos"
        description="Habilita o QR Code de produtos. Cadastre ao menos um produto em Configuração de Feedbacks para análise de insights."
      />

      <CheckboxItem
        name="uses_company_services"
        checked={usesCompanyServices}
        onChange={onChange}
        title="A empresa possui serviços"
        description="Habilita o QR Code de serviços. Cadastre ao menos um serviço em Configuração de Feedbacks para análise de insights."
      />

      <CheckboxItem
        name="uses_company_departments"
        checked={usesCompanyDepartments}
        onChange={onChange}
        title="A empresa possui áreas/departamentos"
        description="Habilita o QR Code de áreas/departamentos. Cadastre ao menos um departamento em Configuração de Feedbacks para análise de insights."
      />
    </div>
  );
});

export default FieldUsesCompanyProducts;
