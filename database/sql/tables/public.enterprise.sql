-- Descrição: Cadastro da empresa vinculada ao usuário autenticado.
-- Uso: Entidade raiz de autorização para dados de negócio (RLS por auth_user_id).

-- public.enterprise
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."enterprise" (
  "document" text NOT NULL,
  "auth_user_id" uuid NOT NULL,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "account_type" text,
  "terms_version" text,
  "terms_accepted_at" timestamp with time zone,
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."enterprise" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Usuários autenticados podem criar sua empresa" ON "public"."enterprise";
CREATE POLICY "Usuários autenticados podem criar sua empresa" ON "public"."enterprise"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = auth_user_id));

DROP POLICY IF EXISTS "Usuários autenticados veem apenas sua empresa" ON "public"."enterprise";
CREATE POLICY "Usuários autenticados veem apenas sua empresa" ON "public"."enterprise"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = auth_user_id));

DROP POLICY IF EXISTS "Usuários podem atualizar sua própria empresa" ON "public"."enterprise";
CREATE POLICY "Usuários podem atualizar sua própria empresa" ON "public"."enterprise"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((auth.uid() = auth_user_id))
  WITH CHECK ((auth.uid() = auth_user_id));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."enterprise";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."enterprise"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


