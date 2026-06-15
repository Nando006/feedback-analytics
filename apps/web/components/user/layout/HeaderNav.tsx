import { Link, useLocation } from "react-router-dom";
import { menuData } from "src/lib/mock/menu";
import {
  firstLeafTo,
  hasActiveDescendant,
  isMatch,
} from "src/lib/utils/navMatch";
import type { HeaderNavProps } from "./ui.types";

/**
 * Navegação primária horizontal (seções de topo) no header — permite navegar
 * sem o sidebar. Seções-grupo (sem rota própria) apontam para a primeira folha;
 * as subseções continuam nas sub-abas (SectionTabs) ao entrar na seção.
 */
export default function HeaderNav({ className = "" }: HeaderNavProps) {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Navegação principal" className={`overflow-x-auto ${className}`}>
      <ul className="flex items-center gap-1">
        {menuData.map((item) => {
          const to = item.to ?? firstLeafTo(item);
          if (!to) return null;

          const active = item.to
            ? isMatch(item.to, pathname)
            : hasActiveDescendant(item, pathname);

          return (
            <li key={item.label}>
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-(--seventh-color) text-(--text-primary)"
                    : "text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
