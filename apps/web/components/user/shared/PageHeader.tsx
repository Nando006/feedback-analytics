import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';
import { getRouteMeta } from 'src/lib/constants/routes/routeMeta';
import type { PageHeaderProps } from './ui.types';

/**
 * Cabeçalho padrão das telas logadas.
 *
 * Responde "onde estou?" exibindo a TRILHA (breadcrumb) e o TÍTULO DA TELA
 * — em oposição ao header antigo, que mostrava o nome da empresa como título.
 * Título, descrição e trilha vêm do `routeMeta`; podem ser sobrescritos por prop.
 */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  const { pathname } = useLocation();
  const meta = getRouteMeta(pathname);

  const resolvedTitle = title ?? meta.title;
  const resolvedDescription = description ?? meta.description;
  const crumbs = meta.breadcrumb;

  return (
    <header className="font-work-sans mb-6 border-b border-(--quaternary-color)/12 pb-4">
      {crumbs.length > 0 && (
        <nav aria-label="Trilha de navegação" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-(--text-tertiary)">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="transition-colors hover:text-(--text-secondary)">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-(--text-secondary)' : undefined}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <FaChevronRight className="h-2.5 w-2.5 text-(--text-tertiary)" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-montserrat text-2xl font-bold tracking-tight text-(--text-primary)">
            {resolvedTitle}
          </h1>
          {resolvedDescription && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-(--text-secondary)">
              {resolvedDescription}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
