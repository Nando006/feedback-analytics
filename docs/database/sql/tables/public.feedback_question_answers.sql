-- Descrição: Respostas das perguntas dinâmicas por feedback enviado.
-- Uso: Armazena a resposta selecionada para cada pergunta de contexto no momento do envio.

-- public.feedback_question_answers
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "public"."feedback_question_answers" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "feedback_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "question_text_snapshot" text NOT NULL,
  "answer_value" text NOT NULL,
  "answer_score" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_answers_answer_value_check'
  ) THEN
    ALTER TABLE "public"."feedback_question_answers"
      ADD CONSTRAINT "feedback_question_answers_answer_value_check"
      CHECK (("answer_value" = ANY (ARRAY['PESSIMO'::text, 'RUIM'::text, 'MEDIANA'::text, 'BOA'::text, 'OTIMA'::text])));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_answers_answer_score_check'
  ) THEN
    ALTER TABLE "public"."feedback_question_answers"
      ADD CONSTRAINT "feedback_question_answers_answer_score_check"
      CHECK (("answer_score" >= 1 AND "answer_score" <= 5));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_answers_feedback_id_fkey'
  ) THEN
    ALTER TABLE "public"."feedback_question_answers"
      ADD CONSTRAINT "feedback_question_answers_feedback_id_fkey"
      FOREIGN KEY ("feedback_id")
      REFERENCES "public"."feedback"("id")
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_answers_question_id_fkey'
  ) THEN
    ALTER TABLE "public"."feedback_question_answers"
      ADD CONSTRAINT "feedback_question_answers_question_id_fkey"
      FOREIGN KEY ("question_id")
      REFERENCES "public"."questions_of_feedbacks"("id")
      ON DELETE RESTRICT;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_question_answers_feedback_question_unique'
  ) THEN
    ALTER TABLE "public"."feedback_question_answers"
      ADD CONSTRAINT "feedback_question_answers_feedback_question_unique"
      UNIQUE ("feedback_id", "question_id");
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "idx_feedback_question_answers_feedback_id"
  ON "public"."feedback_question_answers" ("feedback_id");

CREATE INDEX IF NOT EXISTS "idx_feedback_question_answers_question_id"
  ON "public"."feedback_question_answers" ("question_id");

ALTER TABLE "public"."feedback_question_answers" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Auth gerencia respostas de perguntas de feedback" ON "public"."feedback_question_answers";
CREATE POLICY "Auth gerencia respostas de perguntas de feedback" ON "public"."feedback_question_answers"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((feedback_id IN (
    SELECT f.id
    FROM feedback f
    WHERE f.enterprise_id IN (
      SELECT enterprise.id
      FROM enterprise
      WHERE enterprise.auth_user_id = auth.uid()
    )
  )))
  WITH CHECK ((feedback_id IN (
    SELECT f.id
    FROM feedback f
    WHERE f.enterprise_id IN (
      SELECT enterprise.id
      FROM enterprise
      WHERE enterprise.auth_user_id = auth.uid()
    )
  )));

DROP POLICY IF EXISTS "Anon pode inserir respostas de perguntas" ON "public"."feedback_question_answers";
CREATE POLICY "Anon pode inserir respostas de perguntas" ON "public"."feedback_question_answers"
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK ((feedback_id IS NOT NULL) AND (question_id IS NOT NULL));
