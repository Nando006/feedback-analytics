-- Descrição: Monta claims customizados para o JWT do usuário.
-- Uso: Injeta role/enterprise_id para autorização no banco e app.

CREATE OR REPLACE FUNCTION public.jwt_custom_claims()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  SELECT jsonb_build_object(
    'role', 'enterprise',
    'enterprise_id', (select id from public.enterprise where auth_user_id = auth.uid())
  );
$function$


