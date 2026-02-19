-- Descrição: Retorna IDs e dados públicos básicos das empresas.
-- Uso: Lookup público limitado de identificação empresarial.

CREATE OR REPLACE FUNCTION public.enterprise_public_ids_fn()
 RETURNS TABLE(id uuid, document text, account_type text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT DISTINCT e.id, e.document, e.account_type FROM public.enterprise e;
$function$


