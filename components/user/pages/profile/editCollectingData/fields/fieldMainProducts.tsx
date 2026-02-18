import type { FieldMainProductsProps } from './ui.types';

export default function FieldMainProducts({ value, onChange }: FieldMainProductsProps) {
  return (
    <div className="animate-fadeIn group overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-purple-500/10 p-2">
          <svg
            className="h-5 w-5 text-purple-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle
              cx="9"
              cy="7"
              r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div className="flex-1">
          <label
            htmlFor="main_products_or_services"
            className="block text-sm font-medium text-neutral-200">
            Produtos ou Serviços Principais
          </label>
          <p className="mt-1 text-xs text-neutral-400">
            Liste um produto ou serviço por linha
          </p>
        </div>
      </div>

      <textarea
        id="main_products_or_services"
        name="main_products_or_services"
        className="w-full rounded-lg border border-purple-500/30 bg-neutral-900 px-4 py-3 font-mono text-sm text-neutral-100 outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Sistema de Gestão Empresarial&#10;Consultoria em TI&#10;Suporte Técnico Premium&#10;Desenvolvimento de Software"
      />

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2">
        <svg
          className="h-4 w-4 flex-shrink-0 text-purple-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <circle
            cx="12"
            cy="12"
            r="10"></circle>
          <line
            x1="12"
            y1="16"
            x2="12"
            y2="12"></line>
          <line
            x1="12"
            y1="8"
            x2="12.01"
            y2="8"></line>
        </svg>
        <p className="text-xs text-purple-300">
          Esses itens serão utilizados para direcionar e categorizar os
          feedbacks recebidos
        </p>
      </div>
    </div>
  );
}
