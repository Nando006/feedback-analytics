-- Descrição: Relatório consolidado de insights por empresa.
-- Uso: Guarda resumo e recomendações geradas a partir das análises.

-- public.feedback_insights_report
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."feedback_insights_report" (
  "enterprise_id" uuid NOT NULL,
  "summary" text,
  "recommendations" ARRAY,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."feedback_insights_report" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "feedback_insights_report_insert" ON "public"."feedback_insights_report";
CREATE POLICY "feedback_insights_report_insert" ON "public"."feedback_insights_report"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "feedback_insights_report_select" ON "public"."feedback_insights_report";
CREATE POLICY "feedback_insights_report_select" ON "public"."feedback_insights_report"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "feedback_insights_report_update" ON "public"."feedback_insights_report";
CREATE POLICY "feedback_insights_report_update" ON "public"."feedback_insights_report"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))))
  WITH CHECK ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

