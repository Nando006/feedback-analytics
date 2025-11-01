-- Funções utilitárias para validação de duplicidade via RPC

-- Verifica se existe usuário com o telefone informado (em auth.users)
CREATE OR REPLACE FUNCTION public.phone_exists(p_phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'auth','public'
AS $$
  select exists(select 1 from auth.users u where u.phone = p_phone);
$$;

-- Verifica se existe enterprise com o documento informado (em public.enterprise)
CREATE OR REPLACE FUNCTION public.document_exists(p_document text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select exists(select 1 from public.enterprise e where e.document = p_document);
$$;

-- Permissões para execução via PostgREST
GRANT EXECUTE ON FUNCTION public.phone_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.document_exists(text) TO anon, authenticated;
