-- Descrição: Relatório consolidado de insights por empresa.
-- Uso: Guarda resumo e recomendações geradas a partir das análises.

-- public.feedback_insights_report
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."feedback_insights_report" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "enterprise_id" uuid NOT NULL,
  "scope_type" text NOT NULL DEFAULT 'COMPANY',
  "catalog_item_id" uuid,
  "catalog_item_name" text,
  "summary" text,
  "recommendations" text[],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."feedback_insights_report"
  ADD COLUMN IF NOT EXISTS "scope_type" text;

ALTER TABLE "public"."feedback_insights_report"
  ALTER COLUMN "scope_type" SET DEFAULT 'COMPANY';

UPDATE "public"."feedback_insights_report"
SET "scope_type" = 'COMPANY'
WHERE "scope_type" IS NULL;

ALTER TABLE "public"."feedback_insights_report"
  ALTER COLUMN "scope_type" SET NOT NULL;

ALTER TABLE "public"."feedback_insights_report"
  ADD COLUMN IF NOT EXISTS "catalog_item_id" uuid;

ALTER TABLE "public"."feedback_insights_report"
  ADD COLUMN IF NOT EXISTS "catalog_item_name" text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'feedback_insights_report'
      AND column_name = 'recommendations'
      AND udt_name <> '_text'
  ) THEN
    ALTER TABLE "public"."feedback_insights_report"
      ALTER COLUMN "recommendations" TYPE text[] USING
      CASE
        WHEN "recommendations" IS NULL THEN NULL
        ELSE "recommendations"::text[]
      END;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_insights_report_scope_type_check'
  ) THEN
    ALTER TABLE "public"."feedback_insights_report"
      ADD CONSTRAINT "feedback_insights_report_scope_type_check"
      CHECK (("scope_type" = ANY (ARRAY['COMPANY'::text, 'PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_insights_report_enterprise_id_fkey'
  ) THEN
    ALTER TABLE "public"."feedback_insights_report"
      ADD CONSTRAINT "feedback_insights_report_enterprise_id_fkey"
      FOREIGN KEY ("enterprise_id")
      REFERENCES "public"."enterprise"("id")
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_insights_report_catalog_item_id_fkey'
  ) THEN
    ALTER TABLE "public"."feedback_insights_report"
      ADD CONSTRAINT "feedback_insights_report_catalog_item_id_fkey"
      FOREIGN KEY ("catalog_item_id")
      REFERENCES "public"."catalog_items"("id")
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_feedback_insights_context"
  ON "public"."feedback_insights_report" ("enterprise_id", "scope_type", "catalog_item_id") NULLS NOT DISTINCT;

CREATE INDEX IF NOT EXISTS "idx_feedback_insights_report_enterprise_updated"
  ON "public"."feedback_insights_report" ("enterprise_id", "updated_at" DESC);

CREATE OR REPLACE FUNCTION public.validate_feedback_insights_report_context()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  catalog_kind text;
  catalog_enterprise_id uuid;
BEGIN
  IF NEW.scope_type = 'COMPANY' THEN
    IF NEW.catalog_item_id IS NOT NULL THEN
      RAISE EXCEPTION 'catalog_item_id must be null when scope_type is COMPANY';
    END IF;
  ELSE
    IF NEW.catalog_item_id IS NULL THEN
      RAISE EXCEPTION 'catalog_item_id is required for item scope insights report';
    END IF;

    SELECT ci.kind, ci.enterprise_id
    INTO catalog_kind, catalog_enterprise_id
    FROM public.catalog_items ci
    WHERE ci.id = NEW.catalog_item_id;

    IF catalog_kind IS NULL THEN
      RAISE EXCEPTION 'catalog_item not found for feedback_insights_report';
    END IF;

    IF catalog_enterprise_id <> NEW.enterprise_id THEN
      RAISE EXCEPTION 'catalog_item enterprise_id mismatch in feedback_insights_report';
    END IF;

    IF catalog_kind <> NEW.scope_type THEN
      RAISE EXCEPTION 'scope_type must match catalog_item kind in feedback_insights_report';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS "validate_feedback_insights_report_context" ON "public"."feedback_insights_report";
CREATE TRIGGER "validate_feedback_insights_report_context"
  BEFORE INSERT OR UPDATE ON "public"."feedback_insights_report"
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_feedback_insights_report_context();

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

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."feedback_insights_report";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."feedback_insights_report"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

