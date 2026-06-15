/**
 * Fonte única de "wayfinding" da área logada.
 *
 * Mapeia cada rota /user/* para o título da TELA (não o nome da empresa) e a
 * trilha de breadcrumb. Usado pelo PageHeader e pela navegação para responder
 * "onde estou?" e "como cheguei aqui?".
 */

export type RouteCrumb = {
  label: string;
  /** Quando presente, o item da trilha vira link navegável. */
  to?: string;
};

export type RouteMeta = {
  title: string;
  description?: string;
  breadcrumb: RouteCrumb[];
};

const SECTION_CONFIG = 'Configuração da coleta';
const SECTION_FEEDBACKS = 'Feedbacks';
const SECTION_INSIGHTS = 'Insights';

const CATALOG_CRUMB: RouteCrumb = {
  label: 'Catálogo',
  to: '/user/edit/types-feedback',
};

const ROUTE_META: Record<string, RouteMeta> = {
  '/user/dashboard': {
    title: 'Visão geral',
    description: 'Acompanhe a situação dos feedbacks da sua empresa.',
    breadcrumb: [{ label: 'Visão geral' }],
  },
  '/user/profile': {
    title: 'Perfil',
    description: 'Seus dados pessoais e as informações da empresa.',
    breadcrumb: [{ label: 'Perfil' }],
  },

  // Feedbacks
  '/user/feedbacks/all': {
    title: 'Feedbacks recebidos',
    description: 'Todos os feedbacks coletados, com filtros e detalhes.',
    breadcrumb: [{ label: SECTION_FEEDBACKS }, { label: 'Recebidos' }],
  },
  '/user/feedbacks/analytics/all': {
    title: 'Análises — Todos',
    breadcrumb: [{ label: SECTION_FEEDBACKS }, { label: 'Análises' }, { label: 'Todos' }],
  },
  '/user/feedbacks/analytics/positive': {
    title: 'Análises — Positivos',
    breadcrumb: [{ label: SECTION_FEEDBACKS }, { label: 'Análises' }, { label: 'Positivos' }],
  },
  '/user/feedbacks/analytics/negative': {
    title: 'Análises — Negativos',
    breadcrumb: [{ label: SECTION_FEEDBACKS }, { label: 'Análises' }, { label: 'Negativos' }],
  },

  // Insights (IA)
  '/user/insights/reports': {
    title: 'Relatórios de Insights',
    description: 'Resumo estratégico e recomendações geradas pela IA por escopo.',
    breadcrumb: [{ label: SECTION_INSIGHTS }, { label: 'Relatórios' }],
  },
  '/user/insights/emotional': {
    title: 'Análise Emocional',
    breadcrumb: [{ label: SECTION_INSIGHTS }, { label: 'Emocional' }],
  },
  '/user/insights/statistics': {
    title: 'Estatísticas',
    breadcrumb: [{ label: SECTION_INSIGHTS }, { label: 'Estatísticas' }],
  },

  // Configuração da coleta
  '/user/edit/types-feedback': {
    title: 'Catálogo',
    description: 'Ative produtos, serviços e/ou departamentos e configure o catálogo de cada um.',
    breadcrumb: [{ label: SECTION_CONFIG }, { label: 'Catálogo' }],
  },
  '/user/edit/collecting-data-enterprise': {
    title: 'Dados da empresa',
    description: 'Contexto do seu negócio usado pela IA para analisar os feedbacks.',
    breadcrumb: [{ label: SECTION_CONFIG }, { label: 'Dados da empresa' }],
  },
  '/user/edit/feedback-products': {
    title: 'Catálogo de Produtos',
    description: 'Liste os produtos e abra cada um para configurar perguntas e QR Code.',
    breadcrumb: [{ label: SECTION_CONFIG }, CATALOG_CRUMB, { label: 'Produtos' }],
  },
  '/user/edit/feedback-services': {
    title: 'Catálogo de Serviços',
    description: 'Liste os serviços e abra cada um para configurar perguntas e QR Code.',
    breadcrumb: [{ label: SECTION_CONFIG }, CATALOG_CRUMB, { label: 'Serviços' }],
  },
  '/user/edit/feedback-departments': {
    title: 'Catálogo de Departamentos',
    description: 'Liste os departamentos e abra cada um para configurar perguntas e QR Code.',
    breadcrumb: [{ label: SECTION_CONFIG }, CATALOG_CRUMB, { label: 'Departamentos' }],
  },
  '/user/edit/feedback-general': {
    title: 'Feedback geral',
    description: 'Perguntas e QR Code do feedback enviado direto para a empresa (sem catálogo).',
    breadcrumb: [{ label: SECTION_CONFIG }, { label: 'Feedback geral' }],
  },

  // Clientes
  '/user/edit/customers': {
    title: 'Clientes',
    description: 'Os clientes que enviaram feedback à sua empresa.',
    breadcrumb: [{ label: 'Clientes' }],
  },
};

const DEFAULT_META: RouteMeta = {
  title: 'Painel',
  breadcrumb: [],
};

function normalizePath(pathname: string): string {
  if (!pathname) return '';
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

/**
 * Retorna o título e a trilha de uma rota /user/*.
 * Trata a rota dinâmica de detalhe de feedback (/user/feedbacks/:id) e
 * cai em um fallback seguro para rotas não mapeadas.
 */
export function getRouteMeta(pathname: string): RouteMeta {
  const path = normalizePath(pathname);

  const exact = ROUTE_META[path];
  if (exact) return exact;

  const isFeedbackDetail =
    /^\/user\/feedbacks\/[^/]+$/.test(path) &&
    !path.startsWith('/user/feedbacks/analytics');

  if (isFeedbackDetail) {
    return {
      title: 'Detalhe do feedback',
      breadcrumb: [
        { label: SECTION_FEEDBACKS, to: '/user/feedbacks/all' },
        { label: 'Detalhe' },
      ],
    };
  }

  return DEFAULT_META;
}
