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
      { label: "Tipos de coleta", to: "/user/edit/types-feedback" },
      { label: "Catálogo & perguntas", to: "/user/edit/feedback-settings" },
      { label: "QR Codes", to: "/user/qrcode/enterprise" },
    ],
  },
  { label: "Clientes", to: "/user/edit/customers" },
  { label: "Perfil", to: "/user/profile" },
];
