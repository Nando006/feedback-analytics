-- Descrição: Função utilitária que verifica se documento de empresa já existe.
-- Uso: Validação de unicidade antes de cadastro/atualização.

CREATE OR REPLACE FUNCTION public.document_exists(p_document text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists(select 1 from public.enterprise e where e.document = p_document);
$function$


