-- Descrição: Cadastro de clientes finais da empresa.
-- Uso: Relaciona pessoas aos dispositivos rastreados e histórico de feedback.

-- public.customer
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."customer" (
  "name" text,
  "email" text,
  "gender" text,
  "enterprise_id" uuid NOT NULL,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."customer" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes" ON "public"."customer";
CREATE POLICY "Usuários autenticados podem gerenciar clientes" ON "public"."customer"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."customer";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."customer"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


