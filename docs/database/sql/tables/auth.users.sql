-- Descrição: Tabela central de usuários autenticados (auth), com credenciais, metadados e estado da conta.
-- Uso: Base para autenticação, vínculo com empresa e gatilhos de criação/limpeza de dados.

-- auth.users
CREATE SCHEMA IF NOT EXISTS "auth";

CREATE TABLE IF NOT EXISTS "auth"."users" (
  "instance_id" uuid,
  "id" uuid NOT NULL,
  "aud" character varying,
  "role" character varying,
  "email" character varying,
  "encrypted_password" character varying,
  "invited_at" timestamp with time zone,
  "confirmation_token" character varying,
  "confirmation_sent_at" timestamp with time zone,
  "recovery_token" character varying,
  "recovery_sent_at" timestamp with time zone,
  "email_change" character varying,
  "email_change_sent_at" timestamp with time zone,
  "last_sign_in_at" timestamp with time zone,
  "raw_app_meta_data" jsonb,
  "raw_user_meta_data" jsonb,
  "is_super_admin" boolean,
  "created_at" timestamp with time zone,
  "updated_at" timestamp with time zone,
  "email_change_token_new" character varying,
  "phone_confirmed_at" timestamp with time zone,
  "phone_change_sent_at" timestamp with time zone,
  "email_confirmed_at" timestamp with time zone,
  "confirmed_at" timestamp with time zone DEFAULT LEAST(email_confirmed_at, phone_confirmed_at),
  "phone_change_token" character varying DEFAULT ''::character varying,
  "phone" text DEFAULT NULL::character varying,
  "phone_change" text DEFAULT ''::character varying,
  "email_change_token_current" character varying DEFAULT ''::character varying,
  "email_change_confirm_status" smallint DEFAULT 0,
  "banned_until" timestamp with time zone,
  "reauthentication_token" character varying DEFAULT ''::character varying,
  "reauthentication_sent_at" timestamp with time zone,
  "is_sso_user" boolean DEFAULT false NOT NULL,
  "deleted_at" timestamp with time zone,
  "is_anonymous" boolean DEFAULT false NOT NULL,
  PRIMARY KEY ("id")
);

ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;
-- Triggers
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION create_enterprise_on_signup();

DROP TRIGGER IF EXISTS "on_auth_user_metadata_before_update" ON "auth"."users";
CREATE TRIGGER "on_auth_user_metadata_before_update" BEFORE UPDATE ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION clean_user_metadata_before_change();


