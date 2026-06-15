import type { MenuItem } from "components/user/layout/ui.types";
import { menuData } from "src/lib/mock/menu";
import { firstLeafTo, isMatch, normalizePath } from "src/lib/utils/navMatch";

export interface SectionTab {
  label: string;
  to: string;
}

type ChainMatch = { chain: MenuItem[]; exact: boolean; depth: number };

function isBetter(candidate: ChainMatch, best: ChainMatch | null): boolean {
  if (!best) return true;
  if (candidate.exact !== best.exact) return candidate.exact;
  return candidate.depth > best.depth;
}

/**
 * Caminho (raiz → folha ativa) do melhor item que casa com `pathname`,
 * preferindo match exato e, em empate, o mais profundo.
 */
function findChain(
  items: MenuItem[],
  pathname: string,
  trail: MenuItem[],
): ChainMatch | null {
  let best: ChainMatch | null = null;

  for (const item of items) {
    const here = [...trail, item];

    if (isMatch(item.to, pathname)) {
      const exact = normalizePath(item.to ?? "") === normalizePath(pathname);
      const candidate: ChainMatch = { chain: here, exact, depth: here.length };
      if (isBetter(candidate, best)) best = candidate;
    }

    if (item.children?.length) {
      const childBest = findChain(item.children, pathname, here);
      if (childBest && isBetter(childBest, best)) best = childBest;
    }
  }

  return best;
}

/**
 * Irmãos (tabs) da seção da rota atual, derivados de `menuData`.
 * Regra: pega o pai da folha ativa e expõe seus filhos como tabs; um filho que
 * é grupo (sem `to`) aponta para sua primeira folha. Retorna [] em folhas de
 * topo (Visão geral, Clientes, Perfil) e em rotas fora do menu (catálogo
 * lista/detalhe, detalhe de feedback) — nesses casos a régua some.
 */
export function getSectionSiblings(pathname: string): SectionTab[] {
  const result = findChain(menuData, pathname, []);
  if (!result || result.chain.length < 2) return [];

  const parent = result.chain[result.chain.length - 2];
  const tabs: SectionTab[] = [];

  for (const child of parent.children ?? []) {
    const to = child.to ?? firstLeafTo(child);
    if (to) tabs.push({ label: child.label, to });
  }

  return tabs.length >= 2 ? tabs : [];
}
