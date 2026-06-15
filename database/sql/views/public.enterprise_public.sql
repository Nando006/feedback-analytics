-- Descrição: View pública que expõe id e nome de exibição da empresa para o fluxo de coleta sem login.
-- Uso: Caminho crítico do formulário público (QR Code) — resolve o nome da empresa a partir de auth.users.raw_user_meta_data->>'full_name'.

-- public.enterprise_public
CREATE SCHEMA IF NOT EXISTS "public";

-- A coluna `name` NÃO existe em public.enterprise. O nome de exibição é o `full_name`
-- gravado no signup (register.controller.ts) em auth.users.raw_user_meta_data e preservado
-- pelos triggers de saneamento de metadata (create_enterprise_on_signup e
-- clean_user_metadata_before_change removem phone/document/account_type/etc., mas NÃO full_name).
-- Lido de volta como nome da empresa em iaAnalyze.repository.ts.
--
-- Consumidores (apenas id e name): enterprise.controller.ts (select id, name) e
-- qrcode.controller.ts (select id, valida existência da empresa no envio anônimo).
--
-- A view roda com os privilégios do OWNER (security_invoker = off — padrão do Postgres):
-- isso é INTENCIONAL e necessário para o fluxo anônimo (anon) de coleta, pois o papel anon
-- não possui policy de SELECT em public.enterprise nem acesso a auth.users. NÃO habilite
-- security_invoker = on aqui: quebraria o formulário público de feedback.
CREATE OR REPLACE VIEW "public"."enterprise_public" AS
SELECT
  e.id,
  (u.raw_user_meta_data ->> 'full_name') AS name
FROM "public"."enterprise" e
JOIN "auth"."users" u ON u.id = e.auth_user_id;

-- Leitura liberada para o fluxo público (anon) e para usuários autenticados.
GRANT SELECT ON "public"."enterprise_public" TO anon, authenticated;
