-- Descrição: Trigger function genérica para atualizar coluna updated_at.
-- Uso: Mantém timestamp de atualização automaticamente nas tabelas de negócio.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$


