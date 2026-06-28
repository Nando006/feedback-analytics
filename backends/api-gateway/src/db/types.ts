/**
 * Tipos inferidos das tabelas, derivados do schema canônico introspectado
 * (`drizzle/schema.ts`). Vivem aqui (em src/) para SOBREVIVER a um novo
 * `npm run db:pull`, que regeneraria `drizzle/schema.ts`.
 *
 * São LINHAS cruas (colunas snake_case). NÃO confundir com os shapes de RESPOSTA
 * da API em shared/interfaces/domain (aninhados/camelCase) — camadas distintas.
 */
import {
  enterprise,
  feedback,
  feedbackAnalysis,
  feedbackInsightsReport,
  collectionPoints,
  catalogItems,
} from '../../drizzle/schema.js';

export type Enterprise = typeof enterprise.$inferSelect;
export type NewEnterprise = typeof enterprise.$inferInsert;

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

export type FeedbackAnalysis = typeof feedbackAnalysis.$inferSelect;
export type NewFeedbackAnalysis = typeof feedbackAnalysis.$inferInsert;

export type FeedbackInsightsReport = typeof feedbackInsightsReport.$inferSelect;
export type CollectionPoint = typeof collectionPoints.$inferSelect;
export type CatalogItem = typeof catalogItems.$inferSelect;
