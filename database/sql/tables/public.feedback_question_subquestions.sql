-- Descricao: Subperguntas dinamicas vinculadas as perguntas principais de feedback.
-- Uso: Permite detalhar cada pergunta com ate 3 subperguntas por contexto.

-- public.feedback_question_subquestions
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."feedback_question_subquestions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "question_id" uuid NOT NULL,
  "subquestion_order" integer NOT NULL,
  "subquestion_text" text NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_subquestions_question_id_fkey'
  ) THEN
    ALTER TABLE "public"."feedback_question_subquestions"
      ADD CONSTRAINT "feedback_question_subquestions_question_id_fkey"
      FOREIGN KEY ("question_id")
      REFERENCES "public"."questions_of_feedbacks"("id")
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_subquestions_order_check'
  ) THEN
    ALTER TABLE "public"."feedback_question_subquestions"
      ADD CONSTRAINT "feedback_question_subquestions_order_check"
      CHECK (("subquestion_order" >= 1 AND "subquestion_order" <= 3));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_subquestions_text_length_check'
  ) THEN
    ALTER TABLE "public"."feedback_question_subquestions"
      ADD CONSTRAINT "feedback_question_subquestions_text_length_check"
      CHECK ((char_length(btrim("subquestion_text")) >= 20 AND char_length(btrim("subquestion_text")) <= 150))
      NOT VALID;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_subquestions_question_order_unique'
  ) THEN
    ALTER TABLE "public"."feedback_question_subquestions"
      ADD CONSTRAINT "feedback_question_subquestions_question_order_unique"
      UNIQUE ("question_id", "subquestion_order");
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "idx_feedback_question_subquestions_question_id"
  ON "public"."feedback_question_subquestions" ("question_id");

CREATE INDEX IF NOT EXISTS "idx_feedback_question_subquestions_active"
  ON "public"."feedback_question_subquestions" ("question_id", "is_active", "subquestion_order");

ALTER TABLE "public"."feedback_question_subquestions" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Auth gerencia subperguntas de feedback" ON "public"."feedback_question_subquestions";
CREATE POLICY "Auth gerencia subperguntas de feedback" ON "public"."feedback_question_subquestions"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((question_id IN (
    SELECT q.id
    FROM questions_of_feedbacks q
    WHERE q.enterprise_id IN (
      SELECT enterprise.id
      FROM enterprise
      WHERE enterprise.auth_user_id = auth.uid()
    )
  )))
  WITH CHECK ((question_id IN (
    SELECT q.id
    FROM questions_of_feedbacks q
    WHERE q.enterprise_id IN (
      SELECT enterprise.id
      FROM enterprise
      WHERE enterprise.auth_user_id = auth.uid()
    )
  )));

DROP POLICY IF EXISTS "Anon pode ler subperguntas ativas" ON "public"."feedback_question_subquestions";
CREATE POLICY "Anon pode ler subperguntas ativas" ON "public"."feedback_question_subquestions"
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING ((is_active = true));

-- Triggers
DROP TRIGGER IF EXISTS "set_updated_at" ON "public"."feedback_question_subquestions";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."feedback_question_subquestions"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
