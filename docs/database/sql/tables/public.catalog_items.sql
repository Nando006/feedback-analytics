-- Descrição: Catálogo de itens da empresa (produtos, serviços e departamentos).
-- Uso: Base para geração de QR Code por item e segmentação de feedback.

-- public.catalog_items
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."catalog_items" (
  "enterprise_id" uuid NOT NULL,
  "kind" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'ACTIVE'::text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_catalog_items_enterprise_kind"
  ON "public"."catalog_items" ("enterprise_id", "kind");

CREATE INDEX IF NOT EXISTS "idx_catalog_items_status"
  ON "public"."catalog_items" ("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'catalog_items_kind_check'
  ) THEN
    ALTER TABLE "public"."catalog_items"
      ADD CONSTRAINT "catalog_items_kind_check"
      CHECK (("kind" = ANY (ARRAY['PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'catalog_items_status_check'
  ) THEN
    ALTER TABLE "public"."catalog_items"
      ADD CONSTRAINT "catalog_items_status_check"
      CHECK (("status" = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'catalog_items_enterprise_id_fkey'
  ) THEN
    ALTER TABLE "public"."catalog_items"
      ADD CONSTRAINT "catalog_items_enterprise_id_fkey"
      FOREIGN KEY ("enterprise_id")
      REFERENCES "public"."enterprise"("id")
      ON DELETE CASCADE;
  END IF;
END
$$;

ALTER TABLE "public"."catalog_items" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar catálogo" ON "public"."catalog_items";
CREATE POLICY "Usuários autenticados podem gerenciar catálogo" ON "public"."catalog_items"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Anon pode ler catálogo ativo" ON "public"."catalog_items";
CREATE POLICY "Anon pode ler catálogo ativo" ON "public"."catalog_items"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING ((status = 'ACTIVE'::text));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."catalog_items";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."catalog_items"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
