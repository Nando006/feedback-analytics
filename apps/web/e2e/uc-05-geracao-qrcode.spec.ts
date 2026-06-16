import { test, expect } from '@playwright/test';

test.describe('UC-05: Geração de QR Code da empresa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/edit/feedback-general');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC05-01] Tela de Feedback geral carrega com o QR Code da empresa', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/edit\/feedback-general/);
    // Verifica que há conteúdo de QR Code (canvas, img ou svg)
    const qrElement = page.locator('canvas, img[alt*="QR"], svg[data-qr]').first();
    const hasQrElement = await qrElement.isVisible().catch(() => false);

    // Se QR estiver ativo, deve haver botão de desabilitar; se inativo, de habilitar
    const activateBtn = page.getByText(/(habilitar|desabilitar|ativar) qr code|ativar coleta/i);
    const hasActivateBtn = await activateBtn.isVisible().catch(() => false);

    expect(hasQrElement || hasActivateBtn).toBe(true);
  });
});
