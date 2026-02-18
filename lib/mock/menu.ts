import type { MenuItem } from 'components/user/layout/ui.types';

export const menuData: MenuItem[] = [
  { label: 'Perfil', to: '/user/profile' },
  { label: 'Dashboard', to: '/user/dashboard' },
  {
    label: 'QR Codes',
    children: [
      { label: 'Empresa', to: '/user/qrcode/enterprise' },
      { label: 'Produtos', to: '/user/qrcode/products' },
    ],
  },
  {
    label: 'Feedbacks',
    children: [
      { label: 'Enviados', to: '/user/feedbacks/all' },
      {
        label: 'Analisados',
        children: [
          {
            label: 'Todos',
            to: '/user/feedbacks/analytics/all',
          },
          {
            label: 'Positivos',
            to: '/user/feedbacks/analytics/positive',
          },
          {
            label: 'Negativos',
            to: '/user/feedbacks/analytics/negative',
          },
        ],
      },
    ],
  },
  {
    label: 'Insigths',
    children: [
      { label: 'Relatórios', to: '/user/insights/reports' },
      { label: 'Emocional', to: '/user/insights/emotional' },
      { label: 'Estatísticas', to: '/user/insights/statistics' },
    ],
  },
  {
    label: 'Editar',
    children: [
      { label: 'Perfil', to: '/user/edit/profile' },
      {
        label: 'Informações',
        to: '/user/edit/collecting-data-enterprise',
      },
      { label: 'Clientes', to: '/user/edit/customers' },
    ],
  },
];
