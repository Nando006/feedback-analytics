import type { MenuItem } from 'components/user/layout/ui.types';

export const menuData: MenuItem[] = [
  {
    label: "Perfil",
    to: "/user/profile",
  },
  { label: "Dashboard", to: "/user/dashboard" },
  {
    label: "Canais de Coleta",
    children: [
      {
        label: "QR Code",
        children: [
          { label: "Empresa", to: "/user/qrcode/enterprise" },
          { label: "Produtos", to: "/user/qrcode/products" },
          { label: "Serviços", to: "/user/qrcode/services" },
          { label: "Departamentos", to: "/user/qrcode/departments" },
        ],
      },
    ],
  },
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
  {
    label: "Editar",
    children: [
      
      {
        label: "Feedbacks",
        to: "/user/edit/feedback-settings",
      },
    ],
  },
];
