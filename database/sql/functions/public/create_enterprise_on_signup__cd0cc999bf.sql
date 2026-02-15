-- Descrição: Trigger function de pós-signup para criar empresa e validar dados.
-- Uso: Garante consistência de documento/telefone e saneia metadata.

CREATE OR REPLACE FUNCTION public.create_enterprise_on_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_account_type       text        := NULLIF(meta->>'account_type', '');
  v_document           text        := NULLIF(meta->>'document', '');
  v_terms_version      text        := NULLIF(meta->>'terms_version', '');
  v_terms_accepted_at  timestamptz := NULLIF(meta->>'terms_accepted_at', '')::timestamptz;
  v_phone              text        := NULLIF(meta->>'phone', '');
  v_exists int;
BEGIN
  -- documento obrigatório
  IF v_document IS NULL THEN
    RAISE EXCEPTION 'document is required' USING ERRCODE = '23514';
  END IF;

  -- valida duplicidade de documento antes de inserir
  SELECT 1 INTO v_exists
  FROM public.enterprise e
  WHERE e.document = v_document
  LIMIT 1;

  IF v_exists = 1 THEN
    RAISE EXCEPTION 'document_already_exists' USING ERRCODE = '23505';
  END IF;

  -- insere enterprise (continua prevenindo conflito por auth_user_id)
  INSERT INTO public.enterprise (document, account_type, terms_version, terms_accepted_at, auth_user_id)
  VALUES (v_document, v_account_type, v_terms_version, v_terms_accepted_at, NEW.id)
  ON CONFLICT (auth_user_id) DO NOTHING;

  -- valida duplicidade de telefone antes de atualizar auth.users
  IF v_phone IS NOT NULL THEN
    SELECT 1 INTO v_exists
    FROM auth.users u
    WHERE u.phone = v_phone AND u.id <> NEW.id
    LIMIT 1;

    IF v_exists = 1 THEN
      RAISE EXCEPTION 'phone_already_exists' USING ERRCODE = '23505';
    END IF;
  END IF;

  -- atualiza telefone de forma segura e higieniza metadados
  UPDATE auth.users
     SET phone = COALESCE(auth.users.phone, v_phone),
         raw_user_meta_data =
           COALESCE(raw_user_meta_data, '{}'::jsonb)
           - 'phone'
           - 'document'
           - 'company_name'
           - 'account_type'
           - 'terms_version'
           - 'terms_accepted_at'
           - 'email'
           - 'email_verified'
           - 'phone_verified'
   WHERE id = NEW.id;

  RETURN NEW;
END;
$function$


