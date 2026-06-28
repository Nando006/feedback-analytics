import { pgTable, index, foreignKey, pgPolicy, check, uuid, text, integer, timestamp, unique, jsonb, numeric, inet, boolean, uniqueIndex, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
// auth.users é gerenciada pelo Supabase e fica fora do schemaFilter ['public'].
// O drizzle-kit, ao filtrar o schema `auth`, gera FKs apontando para um `users`
// inexistente — re-exportamos o helper oficial como `usersInAuth` (nome esperado
// por relations.ts) para resolver as referências cruzadas.
// ATENÇÃO: reaplicar estas duas linhas após um novo `npm run db:pull`.
import { authUsers } from "drizzle-orm/supabase"
export const usersInAuth = authUsers



export const feedback = pgTable("feedback", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	message: text().notNull(),
	rating: integer(),
	collectionPointId: uuid("collection_point_id").notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	trackedDeviceId: uuid("tracked_device_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("feedback_enterprise_id_idx").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops")),
	// Índice composto p/ filtro por período (fundação da Etapa 02). Adicionado
	// via migration Drizzle (db:generate → db:migrate) — exemplo de ponta a ponta.
	index("idx_feedback_enterprise_created_at").on(table.enterpriseId, table.createdAt.desc()),
	foreignKey({
			columns: [table.collectionPointId],
			foreignColumns: [collectionPoints.id],
			name: "feedback_collection_point_id_fkey"
		}),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "feedback_enterprise_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.trackedDeviceId],
			foreignColumns: [trackedDevices.id],
			name: "feedback_tracked_device_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Anon pode inserir feedback via QR_CODE com checks", { as: "permissive", for: "insert", to: ["anon"], withCheck: sql`((EXISTS ( SELECT 1
   FROM collection_points cp
  WHERE ((cp.id = feedback.collection_point_id) AND (cp.enterprise_id = feedback.enterprise_id) AND (cp.type = 'QR_CODE'::text) AND (cp.status = 'ACTIVE'::text)))) AND (enterprise_id IS NOT NULL) AND (tracked_device_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM tracked_devices td
  WHERE ((td.id = feedback.tracked_device_id) AND (td.enterprise_id = feedback.enterprise_id) AND (COALESCE(td.is_blocked, false) = false)))))`  }),
	pgPolicy("Usuários autenticados podem gerenciar feedbacks", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("feedback_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const feedbackAnalysis = pgTable("feedback_analysis", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sentiment: text(),
	categories: text().array(),
	keywords: text().array(),
	feedbackId: uuid("feedback_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	aspects: jsonb(),
	sentimentScore: numeric("sentiment_score"),
	confidence: numeric(),
}, (table) => [
	index("feedback_analysis_feedback_id_idx").using("btree", table.feedbackId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.feedbackId],
			foreignColumns: [feedback.id],
			name: "feedback_analysis_feedback_id_fkey"
		}).onDelete("cascade"),
	unique("feedback_analysis_feedback_id_key").on(table.feedbackId),
	pgPolicy("Empresas gerenciam apenas suas próprias análises", { as: "permissive", for: "all", to: ["public"], using: sql`(feedback_id IN ( SELECT f.id
   FROM feedback f
  WHERE (f.enterprise_id IN ( SELECT e.id
           FROM enterprise e
          WHERE (e.auth_user_id = auth.uid())))))` }),
	check("feedback_analysis_sentiment_check", sql`sentiment = ANY (ARRAY['positive'::text, 'negative'::text, 'neutral'::text])`),
]);

export const customer = pgTable("customer", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	email: text(),
	gender: text(),
	enterpriseId: uuid("enterprise_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_customer_email_enterprise").using("btree", table.email.asc().nullsLast().op("text_ops"), table.enterpriseId.asc().nullsLast().op("text_ops")),
	index("idx_customer_enterprise_id").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "customer_enterprise_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Usuários autenticados podem gerenciar clientes", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid())))` }),
	check("customer_gender_check", sql`gender = ANY (ARRAY['Masculino'::text, 'Feminino'::text, 'Outro'::text, 'Não Informado'::text])`),
]);

export const trackedDevices = pgTable("tracked_devices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	customerId: uuid("customer_id"),
	deviceFingerprint: text("device_fingerprint"),
	userAgent: text("user_agent"),
	ipAddress: inet("ip_address"),
	lastFeedbackAt: timestamp("last_feedback_at", { withTimezone: true, mode: 'string' }),
	feedbackCount: integer("feedback_count").default(0),
	isBlocked: boolean("is_blocked").default(false),
	blockedReason: text("blocked_reason"),
	blockedAt: timestamp("blocked_at", { withTimezone: true, mode: 'string' }),
	blockedBy: uuid("blocked_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_tracked_devices_blocked").using("btree", table.isBlocked.asc().nullsLast().op("bool_ops")).where(sql`(is_blocked = true)`),
	index("idx_tracked_devices_customer_id").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	index("idx_tracked_devices_enterprise_fingerprint").using("btree", table.enterpriseId.asc().nullsLast().op("text_ops"), table.deviceFingerprint.asc().nullsLast().op("text_ops")),
	index("idx_tracked_devices_enterprise_id").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.blockedBy],
			foreignColumns: [usersInAuth.id],
			name: "tracked_devices_blocked_by_fkey"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customer.id],
			name: "tracked_devices_customer_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "tracked_devices_enterprise_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Anon pode atualizar contagem do proprio device", { as: "permissive", for: "update", to: ["anon"], using: sql`((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false))`, withCheck: sql`((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false))`  }),
	pgPolicy("Permitir criação anônima de dispositivo", { as: "permissive", for: "insert", to: ["anon"] }),
	pgPolicy("Permitir verificação anônima de dispositivo", { as: "permissive", for: "select", to: ["anon"] }),
	pgPolicy("Usuários autenticados podem gerenciar dispositivos", { as: "permissive", for: "all", to: ["authenticated"] }),
]);

export const questionsOfFeedbacks = pgTable("questions_of_feedbacks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	scopeType: text("scope_type").notNull(),
	catalogItemId: uuid("catalog_item_id"),
	questionOrder: integer("question_order").notNull(),
	questionText: text("question_text").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_questions_context").using("btree", table.enterpriseId.asc().nullsLast().op("text_ops"), table.scopeType.asc().nullsLast().op("text_ops"), table.catalogItemId.asc().nullsLast().op("uuid_ops"), table.isActive.asc().nullsLast().op("bool_ops")),
	uniqueIndex("uq_questions_company_order").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops"), table.questionOrder.asc().nullsLast().op("int4_ops")).where(sql`((scope_type = 'COMPANY'::text) AND (catalog_item_id IS NULL))`),
	uniqueIndex("uq_questions_item_order").using("btree", table.enterpriseId.asc().nullsLast().op("text_ops"), table.scopeType.asc().nullsLast().op("int4_ops"), table.catalogItemId.asc().nullsLast().op("uuid_ops"), table.questionOrder.asc().nullsLast().op("uuid_ops")).where(sql`((scope_type = ANY (ARRAY['PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])) AND (catalog_item_id IS NOT NULL))`),
	foreignKey({
			columns: [table.catalogItemId],
			foreignColumns: [catalogItems.id],
			name: "questions_of_feedbacks_catalog_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "questions_of_feedbacks_enterprise_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Anon pode ler perguntas ativas de feedback", { as: "permissive", for: "select", to: ["anon"], using: sql`(is_active = true)` }),
	pgPolicy("Auth gerencia perguntas de feedback", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("questions_of_feedbacks_question_order_check", sql`(question_order >= 1) AND (question_order <= 3)`),
	check("questions_of_feedbacks_question_text_length_check", sql`(char_length(btrim(question_text)) >= 20) AND (char_length(btrim(question_text)) <= 150))) NOT VALID`),
	check("questions_of_feedbacks_scope_type_check", sql`scope_type = ANY (ARRAY['COMPANY'::text, 'PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])`),
]);

export const enterprise = pgTable("enterprise", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	document: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	authUserId: uuid("auth_user_id").notNull(),
	accountType: text("account_type"),
	termsVersion: text("terms_version"),
	termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true, mode: 'string' }),
	trialEndsAt: timestamp("trial_ends_at", { withTimezone: true, mode: 'string' }),
	subscriptionStatus: text("subscription_status").default('TRIAL'),
}, (table) => [
	index("enterprise_auth_user_id_idx").using("btree", table.authUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_enterprise_auth_user_id").using("btree", table.authUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_enterprise_document").using("btree", table.document.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.authUserId],
			foreignColumns: [usersInAuth.id],
			name: "enterprise_auth_user_id_fkey"
		}).onDelete("cascade"),
	unique("enterprise_document_unique").on(table.document),
	unique("enterprise_document_key").on(table.document),
	unique("enterprise_auth_user_id_unique").on(table.authUserId),
	unique("enterprise_auth_user_id_key").on(table.authUserId),
	pgPolicy("Usuários autenticados podem criar sua empresa", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(auth.uid() = auth_user_id)`  }),
	pgPolicy("Usuários autenticados veem apenas sua empresa", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("Usuários podem atualizar sua própria empresa", { as: "permissive", for: "update", to: ["public"] }),
	check("enterprise_account_type_check", sql`account_type = ANY (ARRAY['CPF'::text, 'CNPJ'::text])`),
	check("enterprise_subscription_status_check", sql`subscription_status = ANY (ARRAY['TRIAL'::text, 'ACTIVE'::text, 'EXPIRED'::text, 'CANCELED'::text])`),
]);

export const feedbackQuestionAnswers = pgTable("feedback_question_answers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	feedbackId: uuid("feedback_id").notNull(),
	questionId: uuid("question_id").notNull(),
	questionTextSnapshot: text("question_text_snapshot").notNull(),
	answerValue: text("answer_value").notNull(),
	answerScore: integer("answer_score").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_feedback_question_answers_feedback_id").using("btree", table.feedbackId.asc().nullsLast().op("uuid_ops")),
	index("idx_feedback_question_answers_question_id").using("btree", table.questionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.feedbackId],
			foreignColumns: [feedback.id],
			name: "feedback_question_answers_feedback_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questionsOfFeedbacks.id],
			name: "feedback_question_answers_question_id_fkey"
		}).onDelete("cascade"),
	unique("feedback_question_answers_feedback_question_unique").on(table.feedbackId, table.questionId),
	pgPolicy("Anon pode inserir respostas de perguntas", { as: "permissive", for: "insert", to: ["anon"], withCheck: sql`((feedback_id IS NOT NULL) AND (question_id IS NOT NULL))`  }),
	pgPolicy("Auth gerencia respostas de perguntas de feedback", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("feedback_question_answers_answer_score_check", sql`(answer_score >= 1) AND (answer_score <= 5)`),
	check("feedback_question_answers_answer_value_check", sql`answer_value = ANY (ARRAY['PESSIMO'::text, 'RUIM'::text, 'MEDIANA'::text, 'BOA'::text, 'OTIMA'::text])`),
]);

export const collectingDataEnterprise = pgTable("collecting_data_enterprise", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	companyObjective: text("company_objective"),
	analyticsGoal: text("analytics_goal"),
	businessSummary: text("business_summary"),
	mainProductsOrServices: text("main_products_or_services").array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	usesCompanyProducts: boolean("uses_company_products").default(false).notNull(),
	usesCompanyServices: boolean("uses_company_services").default(false).notNull(),
	usesCompanyDepartments: boolean("uses_company_departments").default(false).notNull(),
}, (table) => [
	index("collecting_data_enterprise_enterprise_id_idx").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "collecting_data_enterprise_enterprise_id_fkey"
		}).onDelete("cascade"),
	unique("collecting_data_enterprise_enterprise_unique").on(table.enterpriseId),
	pgPolicy("Auth gerencia dados de coleta", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid())))`, withCheck: sql`(enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid())))`  }),
]);

export const collectionPoints = pgTable("collection_points", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	name: text().notNull(),
	type: text().notNull(),
	identifier: text(),
	status: text().default('ACTIVE').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	catalogItemId: uuid("catalog_item_id"),
}, (table) => [
	index("collection_points_enterprise_id_idx").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops")),
	index("idx_collection_points_catalog_item_id").using("btree", table.catalogItemId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.catalogItemId],
			foreignColumns: [catalogItems.id],
			name: "collection_points_catalog_item_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "collection_points_enterprise_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Anon pode ler pontos QR_CODE ativos", { as: "permissive", for: "select", to: ["anon"], using: sql`((type = 'QR_CODE'::text) AND (status = 'ACTIVE'::text) AND ((catalog_item_id IS NULL) OR (EXISTS ( SELECT 1
   FROM catalog_items ci
  WHERE ((ci.id = collection_points.catalog_item_id) AND (ci.status = 'ACTIVE'::text))))))` }),
	pgPolicy("Usuários autenticados podem gerenciar pontos de coleta", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("collection_points_status_check", sql`status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])`),
	check("collection_points_type_check", sql`type = ANY (ARRAY['QR_CODE'::text, 'EMAIL'::text, 'WHATSAPP'::text, 'LINK_DIRETO'::text])`),
]);

export const feedbackInsightsReport = pgTable("feedback_insights_report", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	enterpriseId: uuid("enterprise_id").notNull(),
	summary: text(),
	recommendations: text().array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	scopeType: text("scope_type").default('COMPANY').notNull(),
	catalogItemId: uuid("catalog_item_id"),
	catalogItemName: text("catalog_item_name"),
}, (table) => [
	index("idx_feedback_insights_report_enterprise_updated").using("btree", table.enterpriseId.asc().nullsLast().op("timestamptz_ops"), table.updatedAt.desc().nullsFirst().op("uuid_ops")),
	uniqueIndex("uq_feedback_insights_context").using("btree", table.enterpriseId.asc().nullsLast().op("uuid_ops"), table.scopeType.asc().nullsLast().op("text_ops"), table.catalogItemId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.catalogItemId],
			foreignColumns: [catalogItems.id],
			name: "feedback_insights_report_catalog_item_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "feedback_insights_report_enterprise_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("feedback_insights_report_insert", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid())))`  }),
	pgPolicy("feedback_insights_report_select", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("feedback_insights_report_update", { as: "permissive", for: "update", to: ["public"] }),
	check("feedback_insights_report_scope_type_check", sql`scope_type = ANY (ARRAY['COMPANY'::text, 'PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])`),
]);

export const feedbackQuestionSubquestions = pgTable("feedback_question_subquestions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	questionId: uuid("question_id").notNull(),
	subquestionOrder: integer("subquestion_order").notNull(),
	subquestionText: text("subquestion_text").notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_feedback_question_subquestions_active").using("btree", table.questionId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("uuid_ops"), table.subquestionOrder.asc().nullsLast().op("uuid_ops")),
	index("idx_feedback_question_subquestions_question_id").using("btree", table.questionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [questionsOfFeedbacks.id],
			name: "feedback_question_subquestions_question_id_fkey"
		}).onDelete("cascade"),
	unique("feedback_question_subquestions_question_order_unique").on(table.questionId, table.subquestionOrder),
	pgPolicy("Anon pode ler subperguntas ativas", { as: "permissive", for: "select", to: ["anon"], using: sql`(is_active = true)` }),
	pgPolicy("Auth gerencia subperguntas de feedback", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("feedback_question_subquestions_order_check", sql`(subquestion_order >= 1) AND (subquestion_order <= 3)`),
	check("feedback_question_subquestions_text_length_check", sql`(char_length(btrim(subquestion_text)) >= 20) AND (char_length(btrim(subquestion_text)) <= 150))) NOT VALID`),
]);

export const catalogItems = pgTable("catalog_items", {
	enterpriseId: uuid("enterprise_id").notNull(),
	kind: text().notNull(),
	name: text().notNull(),
	description: text(),
	status: text().default('ACTIVE').notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_catalog_items_enterprise_kind").using("btree", table.enterpriseId.asc().nullsLast().op("text_ops"), table.kind.asc().nullsLast().op("text_ops")),
	index("idx_catalog_items_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.enterpriseId],
			foreignColumns: [enterprise.id],
			name: "catalog_items_enterprise_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Anon pode ler catálogo ativo", { as: "permissive", for: "select", to: ["anon"], using: sql`(status = 'ACTIVE'::text)` }),
	pgPolicy("Usuários autenticados podem gerenciar catálogo", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("catalog_items_kind_check", sql`kind = ANY (ARRAY['PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])`),
	check("catalog_items_status_check", sql`status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])`),
]);

export const feedbackSubquestionAnswers = pgTable("feedback_subquestion_answers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	feedbackId: uuid("feedback_id").notNull(),
	subquestionId: uuid("subquestion_id").notNull(),
	subquestionTextSnapshot: text("subquestion_text_snapshot").notNull(),
	answerValue: text("answer_value").notNull(),
	answerScore: integer("answer_score").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_feedback_subquestion_answers_feedback_id").using("btree", table.feedbackId.asc().nullsLast().op("uuid_ops")),
	index("idx_feedback_subquestion_answers_subquestion_id").using("btree", table.subquestionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.feedbackId],
			foreignColumns: [feedback.id],
			name: "feedback_subquestion_answers_feedback_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.subquestionId],
			foreignColumns: [feedbackQuestionSubquestions.id],
			name: "feedback_subquestion_answers_subquestion_id_fkey"
		}).onDelete("cascade"),
	unique("feedback_subquestion_answers_feedback_subquestion_unique").on(table.feedbackId, table.subquestionId),
	pgPolicy("Anon pode inserir respostas de subperguntas", { as: "permissive", for: "insert", to: ["anon"], withCheck: sql`((feedback_id IS NOT NULL) AND (subquestion_id IS NOT NULL))`  }),
	pgPolicy("Auth gerencia respostas de subperguntas", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("feedback_subquestion_answers_answer_score_check", sql`(answer_score >= 1) AND (answer_score <= 5)`),
	check("feedback_subquestion_answers_answer_value_check", sql`answer_value = ANY (ARRAY['PESSIMO'::text, 'RUIM'::text, 'MEDIANA'::text, 'BOA'::text, 'OTIMA'::text])`),
]);
export const enterprisePublic = pgView("enterprise_public", {	id: uuid(),
	name: text(),
}).as(sql`SELECT e.id, au.raw_user_meta_data ->> 'full_name'::text AS name FROM enterprise e JOIN auth.users au ON e.auth_user_id = au.id`);