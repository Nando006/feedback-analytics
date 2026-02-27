import type { ChangeEvent } from 'react';
import type { FieldUsesCompanyProductsProps } from './ui.types';

function CheckboxItem({
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
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-neutral-600 bg-neutral-800 transition-all checked:border-purple-500 checked:bg-purple-500 focus:ring-2 focus:ring-purple-500/30"
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
        <span className="block text-sm font-medium text-neutral-200">{title}</span>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{description}</p>
      </div>
    </label>
  );
}

export default function FieldUsesCompanyProducts({
  usesCompanyProducts,
  usesCompanyServices,
  usesCompanyDepartments,
  onChange,
}: FieldUsesCompanyProductsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition-all duration-200 hover:border-neutral-700">
      <div>
        <h3 className="text-sm font-semibold text-neutral-200">Escopo da operação</h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Marque os tipos utilizados na sua operação para habilitar os QR Codes específicos.
        </p>
      </div>

      <CheckboxItem
        name="uses_company_products"
        checked={usesCompanyProducts}
        onChange={onChange}
        title="A empresa possui produtos"
        description="Habilita o QR Code de produtos."
      />

      <CheckboxItem
        name="uses_company_services"
        checked={usesCompanyServices}
        onChange={onChange}
        title="A empresa possui serviços"
        description="Habilita o QR Code de serviços."
      />

      <CheckboxItem
        name="uses_company_departments"
        checked={usesCompanyDepartments}
        onChange={onChange}
        title="A empresa possui áreas/departamentos"
        description="Habilita o QR Code de áreas/departamentos."
      />
    </div>
  );
}
