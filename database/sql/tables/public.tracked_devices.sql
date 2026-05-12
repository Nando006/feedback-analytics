-- Descrição: Dispositivos rastreados por fingerprint, com bloqueio e contadores.
-- Uso: Controle antiabuso e limite de envio de feedback por dispositivo.

-- public.tracked_devices
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."tracked_devices" (
  "enterprise_id" uuid NOT NULL,
  "customer_id" uuid,
  "device_fingerprint" text,
  "blocked_reason" text,
  "blocked_at" timestamp with time zone,
  "blocked_by" uuid,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "is_blocked" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "user_agent" text,
  "ip_address" inet,
  "last_feedback_at" timestamp with time zone,
  "feedback_count" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tracked_devices_enterprise_id_fkey'
  ) THEN
    ALTER TABLE "public"."tracked_devices"
      ADD CONSTRAINT "tracked_devices_enterprise_id_fkey"
      FOREIGN KEY ("enterprise_id")
      REFERENCES "public"."enterprise"("id")
      ON DELETE CASCADE;
  END IF;
END
$$;

ALTER TABLE "public"."tracked_devices" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anon pode atualizar contagem do proprio device" ON "public"."tracked_devices";
CREATE POLICY "Anon pode atualizar contagem do proprio device" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR UPDATE
  TO anon
  USING (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false)))
  WITH CHECK (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL) AND (COALESCE(is_blocked, false) = false)));

DROP POLICY IF EXISTS "Permitir criação anônima de dispositivo" ON "public"."tracked_devices";
CREATE POLICY "Permitir criação anônima de dispositivo" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (((enterprise_id IS NOT NULL) AND (device_fingerprint IS NOT NULL)));

DROP POLICY IF EXISTS "Permitir verificação anônima de dispositivo" ON "public"."tracked_devices";
CREATE POLICY "Permitir verificação anônima de dispositivo" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (((device_fingerprint IS NOT NULL) AND (enterprise_id IS NOT NULL)));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar dispositivos" ON "public"."tracked_devices";
CREATE POLICY "Usuários autenticados podem gerenciar dispositivos" ON "public"."tracked_devices"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."tracked_devices";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."tracked_devices"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


