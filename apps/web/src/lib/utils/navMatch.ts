import type { MenuItem } from "components/user/layout/ui.types";

/** Remove barras finais redundantes (ex.: /user/feedbacks/ → /user/feedbacks). */
export function normalizePath(pathname: string): string {
  if (!pathname) return "";
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

/** Casa por igualdade exata OU por prefixo de segmento (cobre sub-rotas). */
export function isMatch(
  targetPath: string | undefined,
  currentPathname: string,
): boolean {
  if (!targetPath || !currentPathname) {
    return false;
  }

  const target = normalizePath(targetPath);
  const current = normalizePath(currentPathname);

  return current === target || current.startsWith(`${target}/`);
}

/** Uma seção (item com filhos) está ativa quando algum descendente casa com a rota atual. */
export function hasActiveDescendant(
  item: MenuItem,
  currentPathname: string,
): boolean {
  if (isMatch(item.to, currentPathname)) {
    return true;
  }
  if (Array.isArray(item.children)) {
    return item.children.some((child) =>
      hasActiveDescendant(child, currentPathname),
    );
  }
  return false;
}

/** Primeira folha (item com `to`) em profundidade — usada para grupos sem rota própria. */
export function firstLeafTo(item: MenuItem): string | undefined {
  if (item.to) return item.to;
  for (const child of item.children ?? []) {
    const found = firstLeafTo(child);
    if (found) return found;
  }
  return undefined;
}
