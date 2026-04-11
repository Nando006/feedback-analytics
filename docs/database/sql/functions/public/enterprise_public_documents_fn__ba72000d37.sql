-- Descrição: Retorna documentos públicos distintos de empresas.
-- Uso: Consulta pública controlada de documentos cadastrados.

CREATE OR REPLACE FUNCTION public.enterprise_public_documents_fn()
 RETURNS TABLE(document text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT DISTINCT document FROM public.enterprise;
$function$


