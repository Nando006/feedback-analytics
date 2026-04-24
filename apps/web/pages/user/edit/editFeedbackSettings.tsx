import { Link, useRouteLoaderData } from 'react-router-dom';
import type { CollectingDataEnterprise, Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import Header from 'components/user/shared/header';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';

export default function EditFeedbackSettings() {
  const { enterprise, collecting, user } = useRouteLoaderData('user') as {
    enterprise: Enterprise;
    user: AuthUser['user'];
    collecting: CollectingDataEnterprise | null;
  };

  const productsEnabled = collecting?.uses_company_products === true;
  const servicesEnabled = collecting?.uses_company_services === true;
  const departmentsEnabled = collecting?.uses_company_departments === true;

  const links = [
    {
      id: 'products',
      enabled: productsEnabled,
      label: 'Catálogo de Produtos',
      description: 'Gerencie os produtos e configure perguntas por item.',
      to: '/user/edit/feedback-products',
    },
    {
      id: 'services',
      enabled: servicesEnabled,
      label: 'Catálogo de Serviços',
      description: 'Gerencie os serviços e configure perguntas por item.',
      to: '/user/edit/feedback-services',
    },
    {
      id: 'departments',
      enabled: departmentsEnabled,
      label: 'Catálogo de Departamentos',
      description: 'Gerencie os departamentos e configure perguntas por área.',
      to: '/user/edit/feedback-departments',
    },
  ];

  return (
    <div className="font-work-sans space-y-6 pb-8">
      <Header 
        enterprise={enterprise}
        user={user}
        nextLabelLink='Ative os Catálogos Premiums'
        nextLink='/user/edit/types-feedback'
        description="Configure os catálogos de feedbacks para produtos, serviços e departamentos. Ative os tipos de feedback para liberar as opções."
      />

      <div className="space-y-3">
        {links.map((link) => (
          link.enabled ? (
            <Link
              key={link.id}
              to={link.to}
              className="flex items-center justify-between rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5 transition-all hover:border-(--primary-color)/30 hover:bg-(--primary-color)/5"
            >
              <div>
                <p className="text-sm font-semibold text-(--text-primary)">{link.label}</p>
                <p className="mt-0.5 text-xs text-(--text-tertiary)">{link.description}</p>
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-(--text-secondary)"
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
            </Link>
          ) : (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5 opacity-50"
            >
              <div>
                <p className="text-sm font-semibold text-(--text-primary)">{link.label}</p>
                <p className="mt-0.5 text-xs text-(--text-tertiary)">
                  Ative este tipo em{' '}
                  <Link to="/user/edit/types-feedback" className="underline hover:text-(--primary-color)">
                    Tipos de Feedback
                  </Link>{' '}
                  para configurar.
                </p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
