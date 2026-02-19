-- Descrição: Verifica se um dispositivo pode enviar novo feedback no período.
-- Uso: Aplica regra de limite diário com base em tracked_devices.

CREATE OR REPLACE FUNCTION public.can_device_send_feedback(enterprise_id_param uuid, device_fingerprint_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  device_record RECORD;
  feedback_limit INTEGER := 1; -- Limite de feedback por dispositivo por dia
BEGIN
  -- A consulta agora é na tabela correta: tracked_devices
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
$function$


