-- Descrição: Verifica se um dispositivo pode enviar novo feedback no período.
-- Uso: Aplica regra de limite diário por QR (collection_point) com fallback legado.

CREATE OR REPLACE FUNCTION public.can_device_send_feedback(
  enterprise_id_param uuid,
  device_fingerprint_param text,
  collection_point_id_param uuid DEFAULT NULL::uuid
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  tracked_device_id_var uuid;
  day_start timestamptz := date_trunc('day', now());
  already_sent boolean := false;
BEGIN
  -- Dispositivo ativo da empresa
  SELECT td.id INTO tracked_device_id_var
  FROM public.tracked_devices
  AS td
  WHERE td.enterprise_id = enterprise_id_param
    AND td.device_fingerprint = device_fingerprint_param
    AND td.is_blocked = FALSE
  LIMIT 1;

  IF tracked_device_id_var IS NULL THEN
    RETURN TRUE;
  END IF;

  IF collection_point_id_param IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.feedback f
      WHERE f.tracked_device_id = tracked_device_id_var
        AND f.collection_point_id = collection_point_id_param
        AND f.created_at >= day_start
    ) INTO already_sent;
  ELSE
    -- Fallback legado: limita por dispositivo no dia (qualquer QR da empresa)
    SELECT EXISTS (
      SELECT 1
      FROM public.feedback f
      WHERE f.tracked_device_id = tracked_device_id_var
        AND f.created_at >= day_start
    ) INTO already_sent;
  END IF;

  RETURN NOT already_sent;
END;
$function$


