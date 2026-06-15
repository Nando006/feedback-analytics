import type { MenuItem } from 'components/user/layout/ui.types';

export const menuData: MenuItem[] = [
  { label: "Visão geral", to: "/user/dashboard" },
  {
    label: "Feedbacks",
    children: [
      { label: "Recebidos", to: "/user/feedbacks/all" },
      {
        label: "Análises",
        children: [
          { label: "Todos", to: "/user/feedbacks/analytics/all" },
          { label: "Positivos", to: "/user/feedbacks/analytics/positive" },
          { label: "Negativos", to: "/user/feedbacks/analytics/negative" },
        ],
      },
    ],
  },
  {
    label: "Insights",
    children: [
      { label: "Relatórios", to: "/user/insights/reports" },
      { label: "Emocional", to: "/user/insights/emotional" },
      { label: "Estatísticas", to: "/user/insights/statistics" },
    ],
  },
  {
    label: "Configuração da coleta",
    children: [
      { label: "Dados da empresa", to: "/user/edit/collecting-data-enterprise" },
      { label: "Feedback geral", to: "/user/edit/feedback-general" },
      { label: "Catálogo", to: "/user/edit/types-feedback" },
    ],
  },
  { label: "Clientes", to: "/user/edit/customers" },
  { label: "Perfil", to: "/user/profile" },
];
