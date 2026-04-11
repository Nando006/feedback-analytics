-- Descrição: Função utilitária que verifica existência de telefone em auth.users.
-- Uso: Validação de unicidade de telefone.

CREATE OR REPLACE FUNCTION public.phone_exists(p_phone text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'auth', 'public'
AS $function$
  select exists(select 1 from auth.users u where u.phone = p_phone);
$function$


