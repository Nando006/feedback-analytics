-- Descrição: Gera fingerprint diário do dispositivo a partir de user-agent e IP.
-- Uso: Identificação técnica para controle de envio de feedback.

CREATE OR REPLACE FUNCTION public.generate_device_fingerprint(user_agent_param text, ip_address_param inet)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN md5(
    COALESCE(user_agent_param, '') || '|' || 
    COALESCE(ip_address_param::TEXT, '') || '|' || 
    extract(epoch from date_trunc('day', now()))::TEXT
  );
END;
$function$


