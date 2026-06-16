import type { ReactNode } from 'react';
import type { RouteCrumb } from 'src/lib/constants/routes/routeMeta';
import type { ConfidenceTier } from 'lib/interfaces/domain/feedback.domain';

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

/**
 * Props da navegação horizontal de submenus da seção (SectionTabs).
 * Usado em: components/user/shared/SectionTabs.tsx.
 */
export type SectionTabsProps = {
  className?: string;
};

/**
 * Props do indicador de escopo ativo (ScopeBadge).
 * Usado em: components/user/shared/ScopeBadge.tsx.
 */
export type ScopeBadgeProps = {
  className?: string;
};

/**
 * Props do selo de confiança da amostra (ConfidenceBadge).
 * Usado em: components/user/shared/ConfidenceBadge.tsx.
 */
export type ConfidenceBadgeProps = {
  tier?: ConfidenceTier;
  /** Tamanho da amostra (n) exibido ao lado do rótulo, quando informado. */
  n?: number;
  className?: string;
};
