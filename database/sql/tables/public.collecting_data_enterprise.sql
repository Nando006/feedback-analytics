-- Descrição: Dados estratégicos da empresa para contexto analítico.
-- Uso: Guarda objetivo, resumo e informações usadas na etapa de coleta/análise.

-- public.collecting_data_enterprise
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."collecting_data_enterprise" (
  "uses_company_products" boolean DEFAULT false NOT NULL,
  "uses_company_services" boolean DEFAULT false NOT NULL,
  "uses_company_departments" boolean DEFAULT false NOT NULL,
  "enterprise_id" uuid NOT NULL,
  "company_objective" text,
  "analytics_goal" text,
  "business_summary" text,
  "main_products_or_services" ARRAY,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."collecting_data_enterprise"
  ADD COLUMN IF NOT EXISTS "uses_company_services" boolean DEFAULT false NOT NULL;

ALTER TABLE "public"."collecting_data_enterprise"
  ADD COLUMN IF NOT EXISTS "uses_company_departments" boolean DEFAULT false NOT NULL;

ALTER TABLE "public"."collecting_data_enterprise" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Auth gerencia dados de coleta" ON "public"."collecting_data_enterprise";
CREATE POLICY "Auth gerencia dados de coleta" ON "public"."collecting_data_enterprise"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))))
  WITH CHECK ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."collecting_data_enterprise";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."collecting_data_enterprise"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


