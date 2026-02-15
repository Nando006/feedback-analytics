-- Descrição: Trigger function para higienizar metadata de usuário antes de update.
-- Uso: Remove chaves indesejadas e normaliza o telefone.

CREATE OR REPLACE FUNCTION public.clean_user_metadata_before_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- sobe phone do metadata se ainda não houver phone
  new.phone := coalesce(new.phone,
                        nullif((coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'phone'), ''));

  -- remove chaves não desejadas do metadata
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb)
    - 'phone' - 'document' - 'company_name'
    - 'account_type' - 'terms_version' - 'terms_accepted_at'
    - 'email' - 'email_verified' - 'phone_verified';

  return new;
end;
$function$


