-- Descrição: Registra/atualiza dispositivo e incrementa contagem de feedback.
-- Uso: Upsert operacional em tracked_devices após envio de feedback.

CREATE OR REPLACE FUNCTION public.register_device_feedback(enterprise_id_param uuid, device_fingerprint_param text, user_agent_param text, ip_address_param inet, customer_id_param uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  tracked_device_id UUID;
  existing_device RECORD;
BEGIN
  -- Busca por um dispositivo existente na tabela tracked_devices
  SELECT * INTO existing_device
  FROM public.tracked_devices
  WHERE enterprise_id = enterprise_id_param
    AND device_fingerprint = device_fingerprint_param;

  IF FOUND THEN
    -- Se encontrou, ATUALIZA o registro existente
    UPDATE public.tracked_devices
    SET
      feedback_count = feedback_count + 1,
      last_feedback_at = NOW(),
      user_agent = COALESCE(user_agent_param, user_agent),
      ip_address = COALESCE(ip_address_param, ip_address),
      -- Associa o customer_id se ele for passado, senão mantém o valor antigo
      customer_id = COALESCE(customer_id_param, existing_device.customer_id),
      updated_at = NOW()
    WHERE id = existing_device.id
    RETURNING id INTO tracked_device_id;
  ELSE
    -- Se não encontrou, CRIA um novo registro de dispositivo
    INSERT INTO public.tracked_devices (
      enterprise_id,
      device_fingerprint,
      user_agent,
      ip_address,
      customer_id,
      feedback_count,
      last_feedback_at
    ) VALUES (
      enterprise_id_param,
      device_fingerprint_param,
      user_agent_param,
      ip_address_param,
      customer_id_param,
      1,
      NOW()
    ) RETURNING id INTO tracked_device_id;
  END IF;

  RETURN tracked_device_id;
END;
$function$


