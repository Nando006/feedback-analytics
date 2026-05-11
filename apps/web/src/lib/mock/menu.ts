import type { MenuItem } from 'components/user/layout/ui.types';

export const menuData: MenuItem[] = [
  { label: "Dashboard", to: "/user/dashboard" },
  {
    label: "Feedbacks",
    to: "/user/feedbacks",
  },
  {
    label: "Insights",
    to: "/user/insights",
  },
  {
    label: "Configurações",
    children: [
      { label: "Perfil", to: "/user/settings/profile" },
      { label: "Formulário", to: "/user/settings/form" },
      { label: "Catálogo", to: "/user/settings/catalog" },
      { label: "Compartilhamento", to: "/user/settings/sharing" },
    ],
  },
];
