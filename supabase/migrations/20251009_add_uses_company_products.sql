ALTER TABLE public.collecting_data_enterprise
  ADD COLUMN IF NOT EXISTS uses_company_products boolean DEFAULT false NOT NULL;
