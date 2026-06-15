import type { ReactNode } from 'react';

/**
 * Props do cabeçalho padrão das telas logadas (PageHeader).
 * `title`/`description` sobrescrevem os valores derivados do routeMeta;
 * `actions` exibe controles à direita do título.
 */
export type PageHeaderProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
};
