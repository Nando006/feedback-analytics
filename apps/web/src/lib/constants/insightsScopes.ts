import { FaBuilding, FaBox, FaWrench, FaUserGroup } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { InsightScopeOption } from "components/user/pages/feedbacksInsightsReport/ui.types";

/**
 * Metadados de cada escopo de insights (rótulo, ícone e cor de acento).
 * Fonte única usada pelo seletor radial e pelo indicador de escopo (ScopeBadge).
 */
export const SCOPE_CONFIG: Record<
  InsightScopeOption,
  { label: string; Icon: IconType; color: string }
> = {
  COMPANY: { label: "Empresa", Icon: FaBuilding, color: "#6366f1" },
  PRODUCT: { label: "Produto", Icon: FaBox, color: "#10b981" },
  SERVICE: { label: "Serviço", Icon: FaWrench, color: "#f59e0b" },
  DEPARTMENT: { label: "Departamento", Icon: FaUserGroup, color: "#ec4899" },
};
