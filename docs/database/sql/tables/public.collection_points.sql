-- Descrição: Pontos de coleta de feedback (ex.: QR_CODE) por empresa.
-- Uso: Controla canal de entrada do feedback e status de ativação.

-- public.collection_points
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."collection_points" (
  "enterprise_id" uuid NOT NULL,
  "catalog_item_id" uuid,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "identifier" text,
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "status" text DEFAULT 'ACTIVE'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."collection_points"
  ADD COLUMN IF NOT EXISTS "catalog_item_id" uuid;

CREATE INDEX IF NOT EXISTS "idx_collection_points_catalog_item_id"
  ON "public"."collection_points" ("catalog_item_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'collection_points_catalog_item_id_fkey'
  ) THEN
    ALTER TABLE "public"."collection_points"
      ADD CONSTRAINT "collection_points_catalog_item_id_fkey"
      FOREIGN KEY ("catalog_item_id")
      REFERENCES "public"."catalog_items"("id")
      ON DELETE SET NULL;
  END IF;
END
$$;

ALTER TABLE "public"."collection_points" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anon pode ler pontos QR_CODE ativos" ON "public"."collection_points";
CREATE POLICY "Anon pode ler pontos QR_CODE ativos" ON "public"."collection_points"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (((type = 'QR_CODE'::text) AND (status = 'ACTIVE'::text) AND ((catalog_item_id IS NULL) OR (EXISTS ( SELECT 1 FROM catalog_items ci WHERE ((ci.id = collection_points.catalog_item_id) AND (ci.status = 'ACTIVE'::text)))))));

DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar pontos de coleta" ON "public"."collection_points";
CREATE POLICY "Usuários autenticados podem gerenciar pontos de coleta" ON "public"."collection_points"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN ( SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."collection_points";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."collection_points"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


