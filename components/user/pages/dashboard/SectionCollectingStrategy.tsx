import { Link } from 'react-router-dom';
import { FaArrowRight, FaMeh } from 'react-icons/fa';
import type { SectionCollectingStrategyProps } from './ui.types';

export default function SectionCollectingStrategy({
  collecting,
}: SectionCollectingStrategyProps) {
  return (
    <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-(--text-primary)">Estratégia de coleta</h2>
          <p className="text-sm text-(--text-tertiary)">
            Informações configuradas para orientar o time
          </p>
        </div>
        <FaMeh className="text-(--text-tertiary)" size={18} />
      </header>

      <div className="mt-6 space-y-5 text-sm text-(--text-secondary)">
        <div>
          <p className="text-xs uppercase tracking-wide text-(--text-tertiary)">
            Objetivo da empresa
          </p>
          <p className="mt-1 leading-relaxed">
            {collecting?.company_objective ?? 'Nenhum objetivo cadastrado ainda.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-(--text-tertiary)">
            Objetivo analítico
          </p>
          <p className="mt-1 leading-relaxed">
            {collecting?.analytics_goal ?? 'Adicione como pretende utilizar os feedbacks.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-(--text-tertiary)">
            Resumo do negócio
          </p>
          <p className="mt-1 leading-relaxed">
            {collecting?.business_summary ?? 'Explique brevemente o contexto do negócio.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-(--text-tertiary)">
            Produtos/Serviços monitorados
          </p>
          {collecting?.uses_company_products &&
          collecting?.main_products_or_services?.length ? (
            <ul className="mt-1 space-y-1 text-(--text-primary)">
              {collecting.main_products_or_services.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-(--quaternary-color)/10 bg-(--seventh-color) px-3 py-2 text-xs">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 leading-relaxed text-(--text-tertiary)">
              Nenhum item configurado. Aproveite para mapear os produtos que devem
              receber feedback.
            </p>
          )}
        </div>
      </div>

      <Link
        to="/user/edit/collecting-data-enterprise"
        className="mt-6 inline-flex items-center gap-2 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)">
        Ajustar informações de coleta
        <FaArrowRight className="text-xs" />
      </Link>
    </section>
  );
}
