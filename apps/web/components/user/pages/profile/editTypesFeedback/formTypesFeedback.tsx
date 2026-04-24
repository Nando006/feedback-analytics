import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import { useCallback, useState } from 'react';
import { Form, Link, useRouteLoaderData } from 'react-router-dom';

const FEEDBACK_TYPES = [
  {
    id: 'products' as const,
    name: 'uses_company_products' as const,
    savedKey: 'uses_company_products' as const,
    title: 'Produtos',
    description:
      'Clientes avaliam itens específicos do seu catálogo de produtos via QR Code dedicado.',
    benefit: 'Identifique quais produtos encantam e quais precisam de melhorias.',
    configLink: '/user/edit/feedback-products',
    configLabel: 'Configurar catálogo de produtos',
    icon: (
      <svg
        className="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'services' as const,
    name: 'uses_company_services' as const,
    savedKey: 'uses_company_services' as const,
    title: 'Serviços',
    description:
      'Clientes avaliam serviços prestados pela sua empresa via QR Code por serviço.',
    benefit: 'Descubra quais serviços geram mais satisfação e onde melhorar.',
    configLink: '/user/edit/feedback-services',
    configLabel: 'Configurar catálogo de serviços',
    icon: (
      <svg
        className="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07" />
      </svg>
    ),
  },
  {
    id: 'departments' as const,
    name: 'uses_company_departments' as const,
    savedKey: 'uses_company_departments' as const,
    title: 'Departamentos',
    description:
      'Clientes avaliam áreas ou setores da sua empresa separadamente.',
    benefit: 'Monitore a performance de cada área e tome decisões por setor.',
    configLink: '/user/edit/feedback-departments',
    configLabel: 'Configurar catálogo de departamentos',
    icon: (
      <svg
        className="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
] as const;

export default function FormTypesFeedback() {
  const { collecting } = useRouteLoaderData('user') as {
    collecting: CollectingDataEnterprise | null;
  };

  const [localState, setLocalState] = useState({
    uses_company_products: collecting?.uses_company_products ?? false,
    uses_company_services: collecting?.uses_company_services ?? false,
    uses_company_departments: collecting?.uses_company_departments ?? false,
  });

  const toggle = useCallback((name: keyof typeof localState) => {
    setLocalState((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-6">
      {FEEDBACK_TYPES.map((type) => {
        const localEnabled = localState[type.name];
        const savedEnabled = collecting?.[type.savedKey] ?? false;

        return (
          <div
            key={type.id}
            className={`rounded-2xl border p-5 transition-all duration-200 ${
              localEnabled
                ? 'border-(--primary-color)/30 bg-(--primary-color)/5'
                : 'border-(--quaternary-color)/10 bg-(--bg-secondary)'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Icon + info */}
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-xl p-3 transition-colors duration-200 ${
                    localEnabled
                      ? 'bg-(--primary-color)/15 text-(--primary-color)'
                      : 'bg-(--bg-tertiary) text-(--text-tertiary)'
                  }`}
                >
                  {type.icon}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-(--text-primary)">{type.title}</h3>
                    {savedEnabled && (
                      <span className="rounded-full bg-(--positive)/15 px-2 py-0.5 text-xs font-semibold text-(--positive)">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-(--text-tertiary)">
                    {type.description}
                  </p>
                  <p className={`mt-1.5 text-xs font-medium transition-colors duration-200 ${
                    localEnabled ? 'text-(--primary-color)' : 'text-(--text-tertiary)'
                  }`}>
                    {type.benefit}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => toggle(type.name)}
                aria-pressed={localEnabled}
                className="relative shrink-0 mt-0.5"
              >
                <input
                  type="checkbox"
                  name={type.name}
                  checked={localEnabled}
                  onChange={() => toggle(type.name)}
                  className="sr-only"
                />
                <div
                  className={`h-6 w-11 rounded-full border transition-all duration-200 ${
                    localEnabled
                      ? 'border-(--primary-color)/40 bg-(--primary-color)'
                      : 'border-(--quaternary-color)/25 bg-(--bg-tertiary)'
                  }`}
                />
                <div
                  className={`pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    localEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Configure link — aparece apenas quando salvo como ativo */}
            {savedEnabled && (
              <div className="mt-4 flex items-center gap-2 border-t border-(--quaternary-color)/10 pt-4">
                <Link
                  to={type.configLink}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/8 px-3 py-2 text-xs font-semibold text-(--primary-color) transition-all hover:bg-(--primary-color)/15"
                >
                  {type.configLabel}
                  <svg
                    className="h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <span className="text-xs text-(--text-tertiary)">
                  Configure o catálogo e as perguntas por item
                </span>
              </div>
            )}

            {/* Hint quando ativado mas ainda não salvo */}
            {localEnabled && !savedEnabled && (
              <p className="mt-3 text-xs text-amber-400/80">
                Salve para confirmar a ativação e liberar as configurações deste tipo.
              </p>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-3 border-t border-(--quaternary-color)/10 pt-4">
        <button
          type="submit"
          className="btn-primary font-poppins group flex items-center gap-2 px-8 py-3"
        >
          <span>Salvar Alterações</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </Form>
  );
}
