import type { ReactNode } from 'react';
import type { RouteCrumb } from 'src/lib/constants/routes/routeMeta';

/**
 * Props do cabeçalho padrão das telas logadas (PageHeader).
 * `title`/`description`/`breadcrumb` sobrescrevem os valores derivados do routeMeta
 * (útil em rotas dinâmicas, como a configuração de um item do catálogo);
 * `actions` exibe controles à direita do título.
 */
export type PageHeaderProps = {
  title?: string;
  description?: string;
  breadcrumb?: RouteCrumb[];
  actions?: ReactNode;
};
