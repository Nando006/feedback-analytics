import { NavLink } from 'react-router-dom';
import { FaAlignLeft, FaBuffer, FaChevronRight } from 'react-icons/fa6';

interface MenuItem {
  label: string;
  to?: string;
  children?: MenuItem[];
}

const menuData: MenuItem[] = [
  { label: 'Perfil', to: '/user/profile' },
  { label: 'Dashboard', to: '/user/dashboard' },
  { label: 'Relatórios', to: '/user/reports' },
  {
    label: 'Feedbacks',
    children: [
      { label: 'Categorias', to: '/user/feedbacks/category' },
      { label: 'QRCode', to: '/user/feedbacks/qrcode' },
      {
        label: 'Teste',
        children: [
          {
            label: 'Teste 1',
            to: '/user/feedbacks/category',
          },
        ],
      },
    ],
  },
  {
    label: 'Editar',
    children: [
      { label: 'Perfil', to: '/user/edit/user' },
      { label: 'Clientes', to: '/user/edit/customer' },
    ],
  },
];

function Item({ item }: { item: MenuItem }) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  if (!hasChildren) {
    return (
      <li>
        <NavLink
          to={item.to || '#'}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-800/70 hover:text-neutral-100">
          <FaBuffer className="h-3.5 w-3.5 text-neutral-500" />
          <span>{item.label}</span>
        </NavLink>
      </li>
    );
  }

  return (
    <li className="relative group">
      <div className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800/70 hover:text-neutral-100">
        <div className="flex items-center gap-2">
          <FaAlignLeft className="h-3.5 w-3.5 text-neutral-500 group-hover:text-neutral-200" />
          <span>{item.label}</span>
        </div>
        <FaChevronRight className="h-3.5 w-3.5 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-200" />
      </div>

      <div className="pointer-events-none absolute left-full top-0 z-40 ml-2 origin-left scale-95 opacity-0 transition-all duration-150 ease-out group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
        <ul className="min-w-48 max-h-[calc(100vh-64px-16px)] space-y-1 rounded-md border border-neutral-800/50 bg-neutral-900/80 p-2 shadow-[var(--shadow-primary)] ring-1 ring-neutral-800/50 backdrop-blur">
          {item.children!.map((child) => (
            <Item
              key={child.label}
              item={child}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function Menu() {
  return (
    <nav>
      <ul className="space-y-1 p-2">
        {menuData.map((item) => (
          <Item
            key={item.label}
            item={item}
          />
        ))}
      </ul>
    </nav>
  );
}
