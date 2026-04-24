import type { MenuItem } from 'components/user/layout/ui.types';

export const menuData: MenuItem[] = [
  {
    label: "Perfil",
    to: "/user/profile",
  },
  {
    label: "Catálogo Premium",
    to: "/user/edit/feedback-settings",
  },
  { label: "Dashboard", to: "/user/dashboard" },
  {
    label: "Feedbacks",
    children: [
      { label: "Recebidos", to: "/user/feedbacks/all" },
      {
        label: "Analisados",
        children: [
          {
            label: "Todos",
            to: "/user/feedbacks/analytics/all",
          },
          {
            label: "Positivos",
            to: "/user/feedbacks/analytics/positive",
          },
          {
            label: "Negativos",
            to: "/user/feedbacks/analytics/negative",
          },
        ],
      },
    ],
  },
  {
    label: "Insigths",
    children: [
      { label: "Relatórios", to: "/user/insights/reports" },
      { label: "Emocional", to: "/user/insights/emotional" },
      { label: "Estatísticas", to: "/user/insights/statistics" },
    ],
  },
];
