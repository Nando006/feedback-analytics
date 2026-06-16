import { NavLink, useLocation } from "react-router-dom";
import { getSectionSiblings } from "src/lib/utils/sectionSiblings";
import { isMatch } from "src/lib/utils/navMatch";
import type { SectionTabsProps } from "./ui.types";

/**
 * Navegação horizontal dos submenus da seção atual (páginas irmãs), derivada de
 * `menuData`. Complementa o sidebar para troca rápida entre páginas da mesma
 * seção. Some (retorna null) em folhas de topo e em rotas fora do menu.
 */
export default function SectionTabs({ className = "" }: SectionTabsProps) {
  const { pathname } = useLocation();
  const tabs = getSectionSiblings(pathname);

  if (tabs.length === 0) return null;

  return (
    <nav aria-label="Navegação da seção" className={`overflow-x-auto ${className}`}>
      <div className="inline-flex gap-1 rounded-lg border border-(--quaternary-color)/14 bg-(--bg-secondary) p-1">
        {tabs.map((tab) => {
          const active = isMatch(tab.to, pathname);

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                active
                  ? "bg-(--primary-color) text-(--bg-primary)"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
