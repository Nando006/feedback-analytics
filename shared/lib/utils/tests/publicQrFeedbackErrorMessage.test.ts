import { describe, expect, it } from 'vitest';
import { getPublicQrFeedbackErrorMessage } from '../publicQrFeedbackErrorMessage';

describe('getPublicQrFeedbackErrorMessage', () => {
  it('deve mapear collection_point_not_found para mensagem amigável', () => {
    const message = getPublicQrFeedbackErrorMessage({
      code: 'collection_point_not_found',
      status: 404,
    });

    expect(message).toBe(
      'QR Code inválido ou desativado para esta empresa. Solicite um novo QR Code ao estabelecimento.',
    );
  });

  it('deve mapear DEVICE_BLOCKED para mensagem amigável', () => {
    const message = getPublicQrFeedbackErrorMessage({
      code: 'DEVICE_BLOCKED',
      status: 403,
    });

    expect(message).toBe(
      'Seu dispositivo está temporariamente bloqueado para novos envios.',
    );
  });

  it('deve usar fallback público quando não for código técnico', () => {
    const message = getPublicQrFeedbackErrorMessage({
      status: 400,
      fallbackMessage: 'Mensagem amigável customizada',
    });

    expect(message).toBe('Mensagem amigável customizada');
  });

  it('deve usar erro padrão quando fallback for técnico', () => {
    const message = getPublicQrFeedbackErrorMessage({
      status: 500,
      fallbackMessage: 'feedback_insert_failed',
    });

    expect(message).toBe('Erro ao enviar feedback. Tente novamente.');
  });
});
