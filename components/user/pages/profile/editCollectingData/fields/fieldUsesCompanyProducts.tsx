import type { FieldUsesCompanyProductsProps } from './ui.types';

export default function FieldUsesCompanyProducts({ checked, onChange }: FieldUsesCompanyProductsProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 transition-all duration-200 hover:border-neutral-700">
      <label className="flex cursor-pointer items-start gap-4">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            name="uses_company_products"
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
          <span className="block text-sm font-medium text-neutral-200">
            Utiliza produtos/serviços próprios na operação?
          </span>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Marque esta opção para habilitar o cadastro de produtos ou
            serviços específicos e coletar feedback direcionado sobre eles.
          </p>
        </div>
      </label>
    </div>
  );
}
