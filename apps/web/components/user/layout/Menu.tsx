import { NavLink, useLocation } from 'react-router-dom';
import { FaAlignLeft, FaBuffer, FaChevronRight } from 'react-icons/fa6';
import type { MenuItem } from './ui.types';
import { menuData } from 'src/lib/mock/menu';
import { hasActiveDescendant, isMatch } from 'src/lib/utils/navMatch';

function Item({
  item,
  currentPathname,
  pendingPathname = '',
}: {
  item: MenuItem;
  currentPathname: string;
  pendingPathname?: string;
}) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  if (!hasChildren) {
    const isActive = isMatch(item.to, currentPathname);
    const isPendingActive = isMatch(item.to, pendingPathname);

    return (
      <li>
        <NavLink
          to={item.to || '#'}
          aria-current={isActive ? 'page' : undefined}
          data-pending-current={isPendingActive ? 'true' : undefined}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            isActive
              ? 'bg-(--seventh-color) font-medium text-(--text-primary)'
              : 'text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)'
          }`}>
          <FaBuffer
            className={`h-3.5 w-3.5 ${isActive ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`}
          />
          <span className="pr-2">{item.label}</span>
        </NavLink>
      </li>
    );
  }

  const sectionActive = hasActiveDescendant(item, currentPathname);

  return (
    <li className="relative menu-item group">
      <div
        data-section-active={sectionActive ? 'true' : undefined}
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          sectionActive
            ? 'bg-(--seventh-color)/60 text-(--text-primary)'
            : 'text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)'
        }`}>
        <div className="flex items-center gap-2">
          <FaAlignLeft
            className={`h-3.5 w-3.5 ${
              sectionActive
                ? 'text-(--primary-color)'
                : 'text-(--text-tertiary) group-hover:text-(--text-secondary)'
            }`}
          />
          <span>{item.label}</span>
        </div>
        <FaChevronRight className="h-3.5 w-3.5 text-(--text-tertiary) transition-transform group-hover:translate-x-0.5 group-hover:text-(--text-secondary)" />
      </div>

      <div className="submenu pointer-events-none absolute left-full -top-1.5 z-40 ml-2 origin-left scale-95 opacity-0 transition-all duration-150 ease-out">
        <ul className="min-w-48 max-h-[calc(100vh-64px-16px)] space-y-1 rounded-md border border-(--quaternary-color)/12 bg-(--bg-secondary) p-2 ring-1 ring-(--quaternary-color)/10">
          {item.children!.map((child) => (
            <Item
              key={child.label}
              item={child}
              currentPathname={currentPathname}
              pendingPathname={pendingPathname}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function Menu({ pendingPathname }: { pendingPathname?: string }) {
  const { pathname } = useLocation();
  const hasPendingNavigation = Boolean(pendingPathname);

  return (
    <nav data-has-pending={hasPendingNavigation ? 'true' : undefined}>
      <ul className="space-y-1 p-2.5">
        {menuData.map((item) => (
          <Item
            key={item.label}
            item={item}
            currentPathname={pathname}
            pendingPathname={pendingPathname}
          />
        ))}
      </ul>
    </nav>
  );
}
