-- Descrição: Perguntas dinâmicas por contexto de feedback (empresa, produto, serviço, departamento).
-- Uso: Define as 3 perguntas exibidas no formulário público e editadas no painel privado.

-- public.questions_of_feedbacks
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."questions_of_feedbacks" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "enterprise_id" uuid NOT NULL,
  "scope_type" text NOT NULL,
  "catalog_item_id" uuid,
  "question_order" integer NOT NULL,
  "question_text" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_of_feedbacks_scope_type_check'
  ) THEN
    ALTER TABLE "public"."questions_of_feedbacks"
      ADD CONSTRAINT "questions_of_feedbacks_scope_type_check"
      CHECK (("scope_type" = ANY (ARRAY['COMPANY'::text, 'PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text])));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_of_feedbacks_question_order_check'
  ) THEN
    ALTER TABLE "public"."questions_of_feedbacks"
      ADD CONSTRAINT "questions_of_feedbacks_question_order_check"
      CHECK (("question_order" >= 1 AND "question_order" <= 3));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_of_feedbacks_question_text_length_check'
  ) THEN
    ALTER TABLE "public"."questions_of_feedbacks"
      ADD CONSTRAINT "questions_of_feedbacks_question_text_length_check"
      CHECK ((char_length(btrim("question_text")) >= 20 AND char_length(btrim("question_text")) <= 150))
      NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_of_feedbacks_enterprise_id_fkey'
  ) THEN
    ALTER TABLE "public"."questions_of_feedbacks"
      ADD CONSTRAINT "questions_of_feedbacks_enterprise_id_fkey"
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
    WHERE conname = 'questions_of_feedbacks_catalog_item_id_fkey'
  ) THEN
    ALTER TABLE "public"."questions_of_feedbacks"
      ADD CONSTRAINT "questions_of_feedbacks_catalog_item_id_fkey"
      FOREIGN KEY ("catalog_item_id")
      REFERENCES "public"."catalog_items"("id")
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_questions_company_order"
  ON "public"."questions_of_feedbacks" ("enterprise_id", "question_order")
  WHERE ("scope_type" = 'COMPANY'::text AND "catalog_item_id" IS NULL);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_questions_item_order"
  ON "public"."questions_of_feedbacks" ("enterprise_id", "scope_type", "catalog_item_id", "question_order")
  WHERE ("scope_type" IN ('PRODUCT'::text, 'SERVICE'::text, 'DEPARTMENT'::text) AND "catalog_item_id" IS NOT NULL);

CREATE INDEX IF NOT EXISTS "idx_questions_context"
  ON "public"."questions_of_feedbacks" ("enterprise_id", "scope_type", "catalog_item_id", "is_active");

CREATE OR REPLACE FUNCTION public.validate_questions_of_feedbacks_context()
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
      RAISE EXCEPTION 'catalog_item_id is required for item scope questions';
    END IF;

    SELECT ci.kind, ci.enterprise_id
    INTO catalog_kind, catalog_enterprise_id
    FROM public.catalog_items ci
    WHERE ci.id = NEW.catalog_item_id;

    IF catalog_kind IS NULL THEN
      RAISE EXCEPTION 'catalog_item not found for questions_of_feedbacks';
    END IF;

    IF catalog_enterprise_id <> NEW.enterprise_id THEN
      RAISE EXCEPTION 'catalog_item enterprise_id mismatch in questions_of_feedbacks';
    END IF;

    IF catalog_kind <> NEW.scope_type THEN
      RAISE EXCEPTION 'scope_type must match catalog_item kind';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS "validate_questions_of_feedbacks_context" ON "public"."questions_of_feedbacks";
CREATE TRIGGER "validate_questions_of_feedbacks_context"
  BEFORE INSERT OR UPDATE ON "public"."questions_of_feedbacks"
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_questions_of_feedbacks_context();

ALTER TABLE "public"."questions_of_feedbacks" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Auth gerencia perguntas de feedback" ON "public"."questions_of_feedbacks";
CREATE POLICY "Auth gerencia perguntas de feedback" ON "public"."questions_of_feedbacks"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((enterprise_id IN (SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))))
  WITH CHECK ((enterprise_id IN (SELECT enterprise.id FROM enterprise WHERE (enterprise.auth_user_id = auth.uid()))));

DROP POLICY IF EXISTS "Anon pode ler perguntas ativas de feedback" ON "public"."questions_of_feedbacks";
CREATE POLICY "Anon pode ler perguntas ativas de feedback" ON "public"."questions_of_feedbacks"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING ((is_active = true));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."questions_of_feedbacks";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."questions_of_feedbacks"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Backfill idempotente das 3 perguntas padrão para COMPANY em empresas existentes
INSERT INTO "public"."questions_of_feedbacks" (
  enterprise_id,
  scope_type,
  catalog_item_id,
  question_order,
  question_text,
  is_active
)
SELECT
  e.id,
  'COMPANY',
  NULL,
  q.question_order,
  q.question_text,
  true
FROM "public"."enterprise" e
CROSS JOIN (
  VALUES
    (1, 'Como foi sua experiência em relação ao atendimento?'),
    (2, 'O que você achou da qualidade do produto/serviço?'),
    (3, 'Como você avalia a relação entre o valor pago e a qualidade do produto/serviço?')
) AS q(question_order, question_text)
WHERE NOT EXISTS (
  SELECT 1
  FROM "public"."questions_of_feedbacks" existing
  WHERE existing.enterprise_id = e.id
    AND existing.scope_type = 'COMPANY'
    AND existing.catalog_item_id IS NULL
    AND existing.question_order = q.question_order
);
