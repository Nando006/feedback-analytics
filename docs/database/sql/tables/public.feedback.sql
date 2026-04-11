-- Descrição: Feedback bruto recebido dos clientes.
-- Uso: Armazena mensagem/nota e vínculos com empresa, ponto de coleta e dispositivo.

-- public.feedback
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."feedback" (
  "message" text NOT NULL,
  "rating" integer,
  "collection_point_id" uuid NOT NULL,
  "enterprise_id" uuid NOT NULL,
  "tracked_device_id" uuid,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anon pode inserir feedback via QR_CODE com checks" ON "public"."feedback";
CREATE POLICY "Anon pode inserir feedback via QR_CODE com checks" ON "public"."feedback"
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (((EXISTS ( SELECT 1 FROM collection_points cp WHERE ((cp.id = feedback.collection_point_id) AND (cp.enterprise_id = feedback.enterprise_id) AND (cp.type = 'QR_CODE'::text) AND (cp.status = 'ACTIVE'::text)))) AND (enterprise_id IS NOT NULL) AND (tracked_device_id IS NOT NULL) AND (EXISTS ( SELECT 1 FROM tracked_devices td WHERE ((td.id = feedback.tracked_device_id) AND (td.enterprise_id = feedback.enterprise_id) AND (COALESCE(td.is_blocked, false) = false))))));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar feedbacks" ON "public"."feedback";
CREATE POLICY "Usuários autenticados podem gerenciar feedbacks" ON "public"."feedback"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."feedback";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."feedback"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


