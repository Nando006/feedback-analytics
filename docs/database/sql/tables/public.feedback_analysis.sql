-- Descrição: Resultado da análise de feedback (sentimento/categorias/keywords).
-- Uso: Camada analítica derivada de cada registro de feedback.

-- public.feedback_analysis
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."feedback_analysis" (
  "sentiment" text,
  "categories" ARRAY,
  "keywords" ARRAY,
  "feedback_id" uuid NOT NULL,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."feedback_analysis" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Empresas gerenciam apenas suas próprias análises" ON "public"."feedback_analysis";
CREATE POLICY "Empresas gerenciam apenas suas próprias análises" ON "public"."feedback_analysis"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((feedback_id IN ( SELECT f.id FROM feedback f WHERE (f.enterprise_id IN ( SELECT e.id FROM enterprise e WHERE (e.auth_user_id = auth.uid()))))));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."feedback_analysis";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."feedback_analysis"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


