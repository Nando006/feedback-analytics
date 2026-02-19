type PublicQrFeedbackErrorParams = {
  status?: number;
  code?: string;
  fallbackMessage?: string;
};

const DEFAULT_PUBLIC_QR_FEEDBACK_ERROR =
  'Erro ao enviar feedback. Tente novamente.';

const CODE_ERROR_MESSAGE_MAP: Record<string, string> = {
  enterprise_not_found:
    'QR Code inválido ou desativado para esta empresa. Solicite um novo QR Code ao estabelecimento.',
  collection_point_not_found:
    'QR Code inválido ou desativado para esta empresa. Solicite um novo QR Code ao estabelecimento.',
  invalid_payload: 'Dados inválidos. Revise as informações e tente novamente.',
  collection_point_error:
    'Não foi possível validar o QR Code no momento. Tente novamente em instantes.',
  device_check_failed:
    'Não foi possível validar seu envio agora. Tente novamente em instantes.',
  device_creation_failed:
    'Não foi possível processar seu envio agora. Tente novamente em instantes.',
  feedback_insert_failed:
    'Não foi possível registrar seu feedback agora. Tente novamente em instantes.',
  DEVICE_BLOCKED:
    'Seu dispositivo está temporariamente bloqueado para novos envios.',
  internal_server_error:
    'Erro interno ao processar feedback. Tente novamente em instantes.',
};

function normalizeErrorCode(code?: string): string {
  return (code ?? '').trim();
}

function isPublicMessage(message?: string): boolean {
  if (!message) return false;
  if (message === 'Request failed') return false;

  const trimmed = message.trim();
  if (!trimmed) return false;

  const isCodeLike = /^[A-Za-z0-9_]+$/.test(trimmed);
  return !isCodeLike;
}

export function getPublicQrFeedbackErrorMessage({
  status,
  code,
  fallbackMessage,
}: PublicQrFeedbackErrorParams): string {
  const normalizedCode = normalizeErrorCode(code);

  if (normalizedCode && CODE_ERROR_MESSAGE_MAP[normalizedCode]) {
    return CODE_ERROR_MESSAGE_MAP[normalizedCode];
  }

  if (status === 404) {
    return 'QR Code inválido ou desativado para esta empresa. Solicite um novo QR Code ao estabelecimento.';
  }

  if (isPublicMessage(fallbackMessage)) {
    return fallbackMessage as string;
  }

  return DEFAULT_PUBLIC_QR_FEEDBACK_ERROR;
}
