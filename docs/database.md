## Banco de Dados – feedback-analytics

Este documento descreve a modelagem, funções, índices e políticas de segurança (RLS) do banco de dados do projeto. A arquitetura segue os princípios:

- Mantemos apenas **full_name** em `auth.users.raw_user_meta_data`.
- **email** e **phone** ficam em `auth.users`.
- Demais dados institucionais vão para `public.enterprise`.

### Passo 0: Função utilitária de timestamp

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Passo 1: Estrutura Base (Tabelas)

1. Tabela `public.enterprise`

```sql
CREATE TABLE IF NOT EXISTS public.enterprise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('CPF','CNPJ')),
  terms_version TEXT,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT enterprise_auth_user_id_unique UNIQUE (auth_user_id),
  CONSTRAINT enterprise_document_unique UNIQUE (document)
);

DROP TRIGGER IF EXISTS set_updated_at ON public.enterprise;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.enterprise
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

2. Tabela `public.collecting_data_enterprise`

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.collecting_data_enterprise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise(id) ON DELETE CASCADE,

  -- Campos de coleta de contexto empresarial
  company_objective TEXT,           -- "Qual é o objetivo da sua empresa?"
  analytics_goal TEXT,              -- "O que você busca ao usar o Feedback Analytics?"
  business_summary TEXT,            -- "Descreva seu negócio em poucas palavras."
  main_products_or_services TEXT[], -- "Quais são seus principais produtos ou serviços? (lista)"

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT collecting_data_enterprise_enterprise_unique UNIQUE (enterprise_id)
);

DROP TRIGGER IF EXISTS set_updated_at ON public.collecting_data_enterprise;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.collecting_data_enterprise
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.collecting_data_enterprise ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Auth gerencia dados de coleta" ON public.collecting_data_enterprise;
CREATE POLICY "Auth gerencia dados de coleta"
ON public.collecting_data_enterprise
FOR ALL TO authenticated
USING (
  enterprise_id IN (
    SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  enterprise_id IN (
    SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS collecting_data_enterprise_enterprise_id_idx
  ON public.collecting_data_enterprise(enterprise_id);

COMMIT;
```

3. Tabela `public.customer`

```sql
CREATE TABLE IF NOT EXISTS public.customer(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  gender TEXT CHECK (gender IN ('Masculino', 'Feminino', 'Outro', 'Não Informado')),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at ON public.customer;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.customer
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

4. Tabela `public.tracked_devices`

```sql
CREATE TABLE IF NOT EXISTS public.tracked_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customer(id) ON DELETE SET NULL,
  device_fingerprint TEXT,
  user_agent TEXT,
  ip_address INET,
  last_feedback_at TIMESTAMPTZ,
  feedback_count INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  blocked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at ON public.tracked_devices;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.tracked_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

5. Tabela `public.collection_points`

```sql
CREATE TABLE IF NOT EXISTS public.collection_points(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('QR_CODE', 'EMAIL', 'WHATSAPP', 'LINK_DIRETO')),
  identifier TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at ON public.collection_points;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.collection_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS collection_points_enterprise_id_idx
  ON public.collection_points(enterprise_id);
```

6. Tabela `public.feedback`

```sql
CREATE TABLE IF NOT EXISTS public.feedback(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  collection_point_id UUID NOT NULL REFERENCES public.collection_points(id),
  enterprise_id UUID NOT NULL REFERENCES public.enterprise(id) ON DELETE CASCADE,
  tracked_device_id UUID REFERENCES public.tracked_devices(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at ON public.feedback;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

7. Tabela `public.feedback_analysis`

```sql
CREATE TABLE IF NOT EXISTS public.feedback_analysis(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sentiment TEXT CHECK(sentiment IN ('positive', 'negative', 'neutral')),
  categories TEXT[],
  keywords TEXT[],
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at ON public.feedback_analysis;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.feedback_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

### Passo 2: Lógica de negócio (Funções e Trigger de signup)

1. Criar empresa no signup e normalizar metadados

```sql
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
BEGIN
  IF v_document IS NULL THEN
    RAISE EXCEPTION 'document is required' USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.enterprise (document, account_type, terms_version, terms_accepted_at, auth_user_id)
  VALUES (v_document, v_account_type, v_terms_version, v_terms_accepted_at, NEW.id)
  ON CONFLICT (auth_user_id) DO NOTHING;

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
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_enterprise_on_signup();
```

1.1. Limpeza de metadados em atualizações do usuário

```sql
CREATE OR REPLACE FUNCTION public.clean_user_metadata_before_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Sobe phone do metadata para a coluna canônica, se necessário
  NEW.phone := COALESCE(
    NEW.phone,
    NULLIF((COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)->>'phone'), '')
  );

  -- Remove chaves não desejadas do metadata
  NEW.raw_user_meta_data := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
    - 'phone' - 'document' - 'company_name'
    - 'account_type' - 'terms_version' - 'terms_accepted_at'
    - 'email' - 'email_verified' - 'phone_verified';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_metadata_before_update ON auth.users;
CREATE TRIGGER on_auth_user_metadata_before_update
BEFORE UPDATE OF raw_user_meta_data ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.clean_user_metadata_before_change();
```

Backfill opcional (execução única)

```sql
UPDATE auth.users
SET
  phone = COALESCE(
    auth.users.phone,
    NULLIF((COALESCE(raw_user_meta_data, '{}'::jsonb)->>'phone'), '')
  ),
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
    - 'phone' - 'document' - 'company_name'
    - 'account_type' - 'terms_version' - 'terms_accepted_at'
    - 'email' - 'email_verified' - 'phone_verified'
WHERE raw_user_meta_data ?| ARRAY[
  'phone','document','company_name','account_type',
  'terms_version','terms_accepted_at','email',
  'email_verified','phone_verified'
];
```

2. Rastreamento de dispositivos

```sql
CREATE OR REPLACE FUNCTION public.generate_device_fingerprint(
  user_agent_param TEXT,
  ip_address_param INET
) RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    digest(
      COALESCE(user_agent_param, '') || '|' ||
      COALESCE(ip_address_param::TEXT, '') || '|' ||
      extract(epoch from date_trunc('day', now()))::TEXT,
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_device_send_feedback(
  enterprise_id_param UUID,
  device_fingerprint_param TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  device_record RECORD;
  feedback_limit INTEGER := 1;
BEGIN
  SELECT * INTO device_record
  FROM public.tracked_devices
  WHERE enterprise_id = enterprise_id_param
    AND device_fingerprint = device_fingerprint_param
    AND is_blocked = FALSE;

  IF NOT FOUND THEN
    RETURN TRUE;
  END IF;

  RETURN device_record.feedback_count < feedback_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.register_device_feedback(
  enterprise_id_param UUID,
  device_fingerprint_param TEXT,
  user_agent_param TEXT,
  ip_address_param INET,
  customer_id_param UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  tracked_device_id UUID;
  existing_device RECORD;
BEGIN
  SELECT * INTO existing_device
  FROM public.tracked_devices
  WHERE enterprise_id = enterprise_id_param
    AND device_fingerprint = device_fingerprint_param;

  IF FOUND THEN
    UPDATE public.tracked_devices
    SET
      feedback_count = feedback_count + 1,
      last_feedback_at = NOW(),
      user_agent = COALESCE(user_agent_param, user_agent),
      ip_address = COALESCE(ip_address_param, ip_address),
      customer_id = COALESCE(customer_id_param, existing_device.customer_id),
      updated_at = NOW()
    WHERE id = existing_device.id
    RETURNING id INTO tracked_device_id;
  ELSE
    INSERT INTO public.tracked_devices (
      enterprise_id, device_fingerprint, user_agent, ip_address,
      customer_id, feedback_count, last_feedback_at
    ) VALUES (
      enterprise_id_param, device_fingerprint_param, user_agent_param, ip_address_param,
      customer_id_param, 1, NOW()
    ) RETURNING id INTO tracked_device_id;
  END IF;

  RETURN tracked_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Passo 3: Índices

```sql
-- Enterprise
CREATE INDEX IF NOT EXISTS enterprise_auth_user_id_idx
  ON public.enterprise(auth_user_id);

-- Customer
CREATE INDEX IF NOT EXISTS idx_customer_enterprise_id
  ON public.customer(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_customer_email_enterprise
  ON public.customer(email, enterprise_id);

-- Tracked devices
CREATE INDEX IF NOT EXISTS idx_tracked_devices_enterprise_id
  ON public.tracked_devices(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_tracked_devices_enterprise_fingerprint
  ON public.tracked_devices(enterprise_id, device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_tracked_devices_blocked
  ON public.tracked_devices(is_blocked) WHERE is_blocked = TRUE;
CREATE INDEX IF NOT EXISTS idx_tracked_devices_customer_id
  ON public.tracked_devices(customer_id);

-- Feedback
CREATE INDEX IF NOT EXISTS feedback_enterprise_id_idx
  ON public.feedback(enterprise_id);

-- Feedback analysis
CREATE INDEX IF NOT EXISTS feedback_analysis_feedback_id_idx
  ON public.feedback_analysis(feedback_id);
```

### Passo 4: Segurança (Auth e RLS)

1. Claims customizadas no JWT

```sql
CREATE OR REPLACE FUNCTION public.jwt_custom_claims()
RETURNS jsonb AS $$
  SELECT jsonb_build_object(
    'role', 'enterprise',
    'enterprise_id', (select id from public.enterprise where auth_user_id = auth.uid())
  );
$$ LANGUAGE sql STABLE;
```

2. Habilitar RLS

```sql
ALTER TABLE public.enterprise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_analysis ENABLE ROW LEVEL SECURITY;
```

3. Políticas (resumo)

```sql
-- ENTERPRISE
DROP POLICY IF EXISTS "Usuários veem apenas sua empresa" ON public.enterprise;
DROP POLICY IF EXISTS "Usuários atualizam sua empresa" ON public.enterprise;
DROP POLICY IF EXISTS "Usuários criam sua empresa" ON public.enterprise;

CREATE POLICY "Usuários veem apenas sua empresa"
ON public.enterprise
FOR SELECT TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Usuários atualizam sua empresa"
ON public.enterprise
FOR UPDATE TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Usuários criam sua empresa"
ON public.enterprise
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

-- CUSTOMER
DROP POLICY IF EXISTS "Gerenciar clientes" ON public.customer;
CREATE POLICY "Gerenciar clientes"
ON public.customer
FOR ALL TO authenticated
USING (enterprise_id IN (SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()))
WITH CHECK (enterprise_id IN (SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()));

-- TRACKED_DEVICES
DROP POLICY IF EXISTS "Anon cria dispositivo" ON public.tracked_devices;
DROP POLICY IF EXISTS "Anon lê dispositivo" ON public.tracked_devices;
DROP POLICY IF EXISTS "Auth gerencia dispositivos" ON public.tracked_devices;

CREATE POLICY "Anon cria dispositivo"
ON public.tracked_devices
FOR INSERT TO anon
WITH CHECK (enterprise_id IS NOT NULL AND device_fingerprint IS NOT NULL);

CREATE POLICY "Anon lê dispositivo"
ON public.tracked_devices
FOR SELECT TO anon
USING (device_fingerprint IS NOT NULL AND enterprise_id IS NOT NULL);

CREATE POLICY "Auth gerencia dispositivos"
ON public.tracked_devices
FOR ALL TO authenticated
USING (enterprise_id IN (SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()))
WITH CHECK (enterprise_id IN (SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()));

-- FEEDBACK
DROP POLICY IF EXISTS "Anon insere feedback" ON public.feedback;
DROP POLICY IF EXISTS "Auth gerencia feedbacks" ON public.feedback;

CREATE POLICY "Anon insere feedback"
ON public.feedback
FOR INSERT TO anon
WITH CHECK (
  (SELECT type FROM public.collection_points cp WHERE cp.id = feedback.collection_point_id) = 'QR_CODE'
  AND enterprise_id IS NOT NULL
  AND tracked_device_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.tracked_devices td
    WHERE td.id = feedback.tracked_device_id
      AND td.enterprise_id = feedback.enterprise_id
      AND td.is_blocked = FALSE
  )
);

CREATE POLICY "Auth gerencia feedbacks"
ON public.feedback
FOR ALL TO authenticated
USING (enterprise_id IN (SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()))
WITH CHECK (enterprise_id IN (SELECT id FROM public.enterprise WHERE auth_user_id = auth.uid()));

-- FEEDBACK_ANALYSIS
DROP POLICY IF EXISTS "Auth gerencia análises" ON public.feedback_analysis;
CREATE POLICY "Auth gerencia análises"
ON public.feedback_analysis
FOR ALL TO authenticated
USING (
  feedback_id IN (
    SELECT id FROM public.feedback f
    WHERE f.enterprise_id IN (
      SELECT e.id FROM public.enterprise e WHERE e.auth_user_id = auth.uid()
    )
  )
)
WITH CHECK (
  feedback_id IN (
    SELECT id FROM public.feedback f
    WHERE f.enterprise_id IN (
      SELECT e.id FROM public.enterprise e WHERE e.auth_user_id = auth.uid()
    )
  )
);
```

4. Views públicas

```sql
CREATE OR REPLACE FUNCTION public.enterprise_public_documents_fn()
RETURNS TABLE(document text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT document FROM public.enterprise;
$$;

REVOKE ALL ON FUNCTION public.enterprise_public_documents_fn() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enterprise_public_documents_fn() TO anon, authenticated;

DROP VIEW IF EXISTS public.enterprise_public_documents;
CREATE VIEW public.enterprise_public_documents AS
SELECT document FROM public.enterprise_public_documents_fn();

GRANT SELECT ON public.enterprise_public_documents TO anon, authenticated;
```

### Fluxos resumidos

- Registro: `signUp` envia `full_name`, `document`, `account_type`, `terms_*`, `phone` no `raw_user_meta_data`; trigger move `phone` p/ `auth.users.phone`, migra dados p/ `enterprise` e limpa do metadata (mantendo `full_name`).
- Perfil: verificação de telefone via OTP habilita login com `phone + password`.
- Login: aceita `email + password` ou `phone + password`.

### Checklist de consistência

- [x] `full_name` somente em `raw_user_meta_data`.
- [x] `email` e `phone` em `auth.users`.
- [x] `document`, `account_type`, `terms_*` em `public.enterprise`.
- [x] Trigger `on_auth_user_created` chamando `create_enterprise_on_signup()`.
- [x] RLS habilitada e políticas aplicadas.

### Histórico e resumo

- Ajustes aplicados para evitar duplicidade de dados entre `auth.users`, metadata e `enterprise`.
- Trigger de signup normaliza dados e preserva apenas `full_name` no metadata.
- Políticas RLS revisadas para isolar dados por empresa.
