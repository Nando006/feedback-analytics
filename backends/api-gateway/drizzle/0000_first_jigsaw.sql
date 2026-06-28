-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"rating" integer,
	"collection_point_id" uuid NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"tracked_device_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "feedback_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sentiment" text,
	"categories" text[],
	"keywords" text[],
	"feedback_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"aspects" jsonb,
	"sentiment_score" numeric,
	"confidence" numeric,
	CONSTRAINT "feedback_analysis_feedback_id_key" UNIQUE("feedback_id"),
	CONSTRAINT "feedback_analysis_sentiment_check" CHECK (sentiment = ANY (ARRAY['positive'::text, 'negative'::text, 'neutral'::text]))
);
--> statement-breakpoint
ALTER TABLE "feedback_analysis" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"gender" text,
	"enterprise_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "customer_gender_check" CHECK (gender = ANY (ARRAY['Masculino'::text, 'Feminino'::text, 'Outro'::text, 'Não Informado'::text]))
);
--> statement-breakpoint
ALTER TABLE "customer" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tracked_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"customer_id" uuid,
	"device_fingerprint" text,
	"user_agent" text,
	"ip_address" "inet",
	"last_feedback_at" timestamp with time zone,
	"feedback_count" integer DEFAULT 0,
	"is_blocked" boolean DEFAULT false,
	"blocked_reason" text,
	"blocked_at" timestamp with time zone,
	"blocked_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tracked_devices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "questions_of_feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"scope_type" text NOT NULL,
	"catalog_item_id" uuid,
	"question_order" integer NOT NULL,
	"question_text" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_of_feedbacks_question_order_check" CHECK ((question_order >= 1) AND (question_order <= 3)),
	CONSTRAINT "questions_of_feedbacks_question_text_length_check" CHECK ((char_length(btrim(question_text)) >= 20) AND (char_length(btrim(question_text)) <= 150))) NOT VALID),
	CONSTRAINT "questions_of_feedbacks_scope_type_check" CHECK (scope_type = ANY (ARRAY['COMPANY'::text, 'PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text]))
);
--> statement-breakpoint
ALTER TABLE "questions_of_feedbacks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "enterprise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"auth_user_id" uuid NOT NULL,
	"account_type" text,
	"terms_version" text,
	"terms_accepted_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"subscription_status" text DEFAULT 'TRIAL',
	CONSTRAINT "enterprise_document_unique" UNIQUE("document"),
	CONSTRAINT "enterprise_document_key" UNIQUE("document"),
	CONSTRAINT "enterprise_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "enterprise_auth_user_id_key" UNIQUE("auth_user_id"),
	CONSTRAINT "enterprise_account_type_check" CHECK (account_type = ANY (ARRAY['CPF'::text, 'CNPJ'::text])),
	CONSTRAINT "enterprise_subscription_status_check" CHECK (subscription_status = ANY (ARRAY['TRIAL'::text, 'ACTIVE'::text, 'EXPIRED'::text, 'CANCELED'::text]))
);
--> statement-breakpoint
ALTER TABLE "enterprise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback_question_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feedback_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_text_snapshot" text NOT NULL,
	"answer_value" text NOT NULL,
	"answer_score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_question_answers_feedback_question_unique" UNIQUE("feedback_id","question_id"),
	CONSTRAINT "feedback_question_answers_answer_score_check" CHECK ((answer_score >= 1) AND (answer_score <= 5)),
	CONSTRAINT "feedback_question_answers_answer_value_check" CHECK (answer_value = ANY (ARRAY['PESSIMO'::text, 'RUIM'::text, 'MEDIANA'::text, 'BOA'::text, 'OTIMA'::text]))
);
--> statement-breakpoint
ALTER TABLE "feedback_question_answers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collecting_data_enterprise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"company_objective" text,
	"analytics_goal" text,
	"business_summary" text,
	"main_products_or_services" text[],
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"uses_company_products" boolean DEFAULT false NOT NULL,
	"uses_company_services" boolean DEFAULT false NOT NULL,
	"uses_company_departments" boolean DEFAULT false NOT NULL,
	CONSTRAINT "collecting_data_enterprise_enterprise_unique" UNIQUE("enterprise_id")
);
--> statement-breakpoint
ALTER TABLE "collecting_data_enterprise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "collection_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"identifier" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"catalog_item_id" uuid,
	CONSTRAINT "collection_points_status_check" CHECK (status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])),
	CONSTRAINT "collection_points_type_check" CHECK (type = ANY (ARRAY['QR_CODE'::text, 'EMAIL'::text, 'WHATSAPP'::text, 'LINK_DIRETO'::text]))
);
--> statement-breakpoint
ALTER TABLE "collection_points" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback_insights_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"summary" text,
	"recommendations" text[],
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"scope_type" text DEFAULT 'COMPANY' NOT NULL,
	"catalog_item_id" uuid,
	"catalog_item_name" text,
	CONSTRAINT "feedback_insights_report_scope_type_check" CHECK (scope_type = ANY (ARRAY['COMPANY'::text, 'PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text]))
);
--> statement-breakpoint
ALTER TABLE "feedback_insights_report" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback_question_subquestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"subquestion_order" integer NOT NULL,
	"subquestion_text" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_question_subquestions_question_order_unique" UNIQUE("question_id","subquestion_order"),
	CONSTRAINT "feedback_question_subquestions_order_check" CHECK ((subquestion_order >= 1) AND (subquestion_order <= 3)),
	CONSTRAINT "feedback_question_subquestions_text_length_check" CHECK ((char_length(btrim(subquestion_text)) >= 20) AND (char_length(btrim(subquestion_text)) <= 150))) NOT VALID)
);
--> statement-breakpoint
ALTER TABLE "feedback_question_subquestions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "catalog_items" (
	"enterprise_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "catalog_items_kind_check" CHECK (kind = ANY (ARRAY['PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])),
	CONSTRAINT "catalog_items_status_check" CHECK (status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text]))
);
--> statement-breakpoint
ALTER TABLE "catalog_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback_subquestion_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feedback_id" uuid NOT NULL,
	"subquestion_id" uuid NOT NULL,
	"subquestion_text_snapshot" text NOT NULL,
	"answer_value" text NOT NULL,
	"answer_score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_subquestion_answers_feedback_subquestion_unique" UNIQUE("feedback_id","subquestion_id"),
	CONSTRAINT "feedback_subquestion_answers_answer_score_check" CHECK ((answer_score >= 1) AND (answer_score <= 5)),
	CONSTRAINT "feedback_subquestion_answers_answer_value_check" CHECK (answer_value = ANY (ARRAY['PESSIMO'::text, 'RUIM'::text, 'MEDIANA'::text, 'BOA'::text, 'OTIMA'::text]))
);
--> statement-breakpoint
ALTER TABLE "feedback_subquestion_answers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_collection_point_id_fkey" FOREIGN KEY ("collection_point_id") REFERENCES "public"."collection_points"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_tracked_device_id_fkey" FOREIGN KEY ("tracked_device_id") REFERENCES "public"."tracked_devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_analysis" ADD CONSTRAINT "feedback_analysis_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_devices" ADD CONSTRAINT "tracked_devices_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_devices" ADD CONSTRAINT "tracked_devices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_devices" ADD CONSTRAINT "tracked_devices_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_of_feedbacks" ADD CONSTRAINT "questions_of_feedbacks_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions_of_feedbacks" ADD CONSTRAINT "questions_of_feedbacks_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enterprise" ADD CONSTRAINT "enterprise_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_question_answers" ADD CONSTRAINT "feedback_question_answers_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_question_answers" ADD CONSTRAINT "feedback_question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions_of_feedbacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collecting_data_enterprise" ADD CONSTRAINT "collecting_data_enterprise_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_points" ADD CONSTRAINT "collection_points_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_points" ADD CONSTRAINT "collection_points_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_insights_report" ADD CONSTRAINT "feedback_insights_report_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_insights_report" ADD CONSTRAINT "feedback_insights_report_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_question_subquestions" ADD CONSTRAINT "feedback_question_subquestions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions_of_feedbacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_subquestion_answers" ADD CONSTRAINT "feedback_subquestion_answers_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_subquestion_answers" ADD CONSTRAINT "feedback_subquestion_answers_subquestion_id_fkey" FOREIGN KEY ("subquestion_id") REFERENCES "public"."feedback_question_subquestions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_enterprise_id_idx" ON "feedback" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "feedback_analysis_feedback_id_idx" ON "feedback_analysis" USING btree ("feedback_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_email_enterprise" ON "customer" USING btree ("email" text_ops,"enterprise_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_customer_enterprise_id" ON "customer" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_tracked_devices_blocked" ON "tracked_devices" USING btree ("is_blocked" bool_ops) WHERE (is_blocked = true);--> statement-breakpoint
CREATE INDEX "idx_tracked_devices_customer_id" ON "tracked_devices" USING btree ("customer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_tracked_devices_enterprise_fingerprint" ON "tracked_devices" USING btree ("enterprise_id" text_ops,"device_fingerprint" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tracked_devices_enterprise_id" ON "tracked_devices" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_questions_context" ON "questions_of_feedbacks" USING btree ("enterprise_id" text_ops,"scope_type" text_ops,"catalog_item_id" uuid_ops,"is_active" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_questions_company_order" ON "questions_of_feedbacks" USING btree ("enterprise_id" uuid_ops,"question_order" int4_ops) WHERE ((scope_type = 'COMPANY'::text) AND (catalog_item_id IS NULL));--> statement-breakpoint
CREATE UNIQUE INDEX "uq_questions_item_order" ON "questions_of_feedbacks" USING btree ("enterprise_id" text_ops,"scope_type" int4_ops,"catalog_item_id" uuid_ops,"question_order" uuid_ops) WHERE ((scope_type = ANY (ARRAY['PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])) AND (catalog_item_id IS NOT NULL));--> statement-breakpoint
CREATE INDEX "enterprise_auth_user_id_idx" ON "enterprise" USING btree ("auth_user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_enterprise_auth_user_id" ON "enterprise" USING btree ("auth_user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_enterprise_document" ON "enterprise" USING btree ("document" text_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_question_answers_feedback_id" ON "feedback_question_answers" USING btree ("feedback_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_question_answers_question_id" ON "feedback_question_answers" USING btree ("question_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "collecting_data_enterprise_enterprise_id_idx" ON "collecting_data_enterprise" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "collection_points_enterprise_id_idx" ON "collection_points" USING btree ("enterprise_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_collection_points_catalog_item_id" ON "collection_points" USING btree ("catalog_item_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_insights_report_enterprise_updated" ON "feedback_insights_report" USING btree ("enterprise_id" timestamptz_ops,"updated_at" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_feedback_insights_context" ON "feedback_insights_report" USING btree ("enterprise_id" uuid_ops,"scope_type" text_ops,"catalog_item_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_question_subquestions_active" ON "feedback_question_subquestions" USING btree ("question_id" bool_ops,"is_active" uuid_ops,"subquestion_order" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_question_subquestions_question_id" ON "feedback_question_subquestions" USING btree ("question_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_catalog_items_enterprise_kind" ON "catalog_items" USING btree ("enterprise_id" text_ops,"kind" text_ops);--> statement-breakpoint
CREATE INDEX "idx_catalog_items_status" ON "catalog_items" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_subquestion_answers_feedback_id" ON "feedback_subquestion_answers" USING btree ("feedback_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_feedback_subquestion_answers_subquestion_id" ON "feedback_subquestion_answers" USING btree ("subquestion_id" uuid_ops);--> statement-breakpoint
CREATE VIEW "public"."enterprise_public" AS (SELECT e.id, au.raw_user_meta_data ->> 'full_name'::text AS name FROM enterprise e JOIN auth.users au ON e.auth_user_id = au.id);--> statement-breakpoint
CREATE POLICY "Anon pode inserir feedback via QR_CODE com checks" ON "feedback" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (((EXISTS ( SELECT 1
   FROM collection_points cp
  WHERE ((cp.id = feedback.collection_point_id) AND (cp.enterprise_id = feedback.enterprise_id) AND (cp.type = 'QR_CODE'::text) AND (cp.status = 'ACTIVE'::text)))) AND (enterprise_id IS NOT NULL) AND (tracked_device_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM tracked_devices td
  WHERE ((td.id = feedback.tracked_device_id) AND (td.enterprise_id = feedback.enterprise_id) AND (COALESCE(td.is_blocked, false) = false))))));--> statement-breakpoint
CREATE POLICY "Usuários autenticados podem gerenciar feedbacks" ON "feedback" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Empresas gerenciam apenas suas próprias análises" ON "feedback_analysis" AS PERMISSIVE FOR ALL TO public USING ((feedback_id IN ( SELECT f.id
   FROM feedback f
  WHERE (f.enterprise_id IN ( SELECT e.id
           FROM enterprise e
          WHERE (e.auth_user_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Usuários autenticados podem gerenciar clientes" ON "customer" AS PERMISSIVE FOR ALL TO "authenticated" USING ((enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid()))));--> statement-breakpoint
CREATE POLICY "Anon pode atualizar contagem do proprio device" ON "tracked_devices" AS PERMISSIVE FOR UPDATE TO "anon" USING (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false))) WITH CHECK (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false)));--> statement-breakpoint
CREATE POLICY "Permitir criação anônima de dispositivo" ON "tracked_devices" AS PERMISSIVE FOR INSERT TO "anon";--> statement-breakpoint
CREATE POLICY "Permitir verificação anônima de dispositivo" ON "tracked_devices" AS PERMISSIVE FOR SELECT TO "anon";--> statement-breakpoint
CREATE POLICY "Usuários autenticados podem gerenciar dispositivos" ON "tracked_devices" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Anon pode ler perguntas ativas de feedback" ON "questions_of_feedbacks" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_active = true));--> statement-breakpoint
CREATE POLICY "Auth gerencia perguntas de feedback" ON "questions_of_feedbacks" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Usuários autenticados podem criar sua empresa" ON "enterprise" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = auth_user_id));--> statement-breakpoint
CREATE POLICY "Usuários autenticados veem apenas sua empresa" ON "enterprise" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Usuários podem atualizar sua própria empresa" ON "enterprise" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Anon pode inserir respostas de perguntas" ON "feedback_question_answers" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (((feedback_id IS NOT NULL) AND (question_id IS NOT NULL)));--> statement-breakpoint
CREATE POLICY "Auth gerencia respostas de perguntas de feedback" ON "feedback_question_answers" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Auth gerencia dados de coleta" ON "collecting_data_enterprise" AS PERMISSIVE FOR ALL TO "authenticated" USING ((enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid())))) WITH CHECK ((enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid()))));--> statement-breakpoint
CREATE POLICY "Anon pode ler pontos QR_CODE ativos" ON "collection_points" AS PERMISSIVE FOR SELECT TO "anon" USING (((type = 'QR_CODE'::text) AND (status = 'ACTIVE'::text) AND ((catalog_item_id IS NULL) OR (EXISTS ( SELECT 1
   FROM catalog_items ci
  WHERE ((ci.id = collection_points.catalog_item_id) AND (ci.status = 'ACTIVE'::text)))))));--> statement-breakpoint
CREATE POLICY "Usuários autenticados podem gerenciar pontos de coleta" ON "collection_points" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "feedback_insights_report_insert" ON "feedback_insights_report" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((enterprise_id IN ( SELECT enterprise.id
   FROM enterprise
  WHERE (enterprise.auth_user_id = auth.uid()))));--> statement-breakpoint
CREATE POLICY "feedback_insights_report_select" ON "feedback_insights_report" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "feedback_insights_report_update" ON "feedback_insights_report" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Anon pode ler subperguntas ativas" ON "feedback_question_subquestions" AS PERMISSIVE FOR SELECT TO "anon" USING ((is_active = true));--> statement-breakpoint
CREATE POLICY "Auth gerencia subperguntas de feedback" ON "feedback_question_subquestions" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Anon pode ler catálogo ativo" ON "catalog_items" AS PERMISSIVE FOR SELECT TO "anon" USING ((status = 'ACTIVE'::text));--> statement-breakpoint
CREATE POLICY "Usuários autenticados podem gerenciar catálogo" ON "catalog_items" AS PERMISSIVE FOR ALL TO "authenticated";--> statement-breakpoint
CREATE POLICY "Anon pode inserir respostas de subperguntas" ON "feedback_subquestion_answers" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (((feedback_id IS NOT NULL) AND (subquestion_id IS NOT NULL)));--> statement-breakpoint
CREATE POLICY "Auth gerencia respostas de subperguntas" ON "feedback_subquestion_answers" AS PERMISSIVE FOR ALL TO "authenticated";
*/