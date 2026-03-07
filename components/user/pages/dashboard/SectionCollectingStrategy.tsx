import { Link } from 'react-router-dom';
import { FaArrowRight, FaMeh } from 'react-icons/fa';
import type { SectionCollectingStrategyProps } from './ui.types';

export default function SectionCollectingStrategy({
  collecting,
}: SectionCollectingStrategyProps) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100">Estratégia de coleta</h2>
          <p className="text-sm text-neutral-400">
            Informações configuradas para orientar o time
          </p>
        </div>
        <FaMeh className="text-neutral-400" size={18} />
      </header>

      <div className="mt-6 space-y-5 text-sm text-neutral-300">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Objetivo da empresa
          </p>
          <p className="mt-1 leading-relaxed">
            {collecting?.company_objective ?? 'Nenhum objetivo cadastrado ainda.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Objetivo analítico
          </p>
          <p className="mt-1 leading-relaxed">
            {collecting?.analytics_goal ?? 'Adicione como pretende utilizar os feedbacks.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Resumo do negócio
          </p>
          <p className="mt-1 leading-relaxed">
            {collecting?.business_summary ?? 'Explique brevemente o contexto do negócio.'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Produtos/Serviços monitorados
          </p>
          {collecting?.uses_company_products &&
          collecting?.main_products_or_services?.length ? (
            <ul className="mt-1 space-y-1 text-neutral-200">
              {collecting.main_products_or_services.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-neutral-800/80 bg-neutral-900/70 px-3 py-2 text-xs">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 leading-relaxed text-neutral-400">
              Nenhum item configurado. Aproveite para mapear os produtos que devem
              receber feedback.
            </p>
          )}
        </div>
      </div>

      <Link
        to="/user/edit/collecting-data-enterprise"
        className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors hover:text-neutral-100">
        Ajustar informações de coleta
        <FaArrowRight className="text-xs" />
      </Link>
    </section>
  );
}
