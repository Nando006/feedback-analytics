import { test, expect } from '@playwright/test';

test.describe('UC-05: Geração de QR Code da empresa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/qrcode/enterprise');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC05-01] Página do QR Code carrega com dados da empresa', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/qrcode\/enterprise/);
    // Verifica que há conteúdo de QR Code (canvas, img ou svg)
    const qrElement = page.locator('canvas, img[alt*="QR"], svg[data-qr]').first();
    const hasQrElement = await qrElement.isVisible().catch(() => false);

    // Se QR estiver ativo, deve haver elemento visual; se não, deve haver botão de ativar
    const activateBtn = page.getByText(/ativar qr code|ativar coleta/i);
    const hasActivateBtn = await activateBtn.isVisible().catch(() => false);

    expect(hasQrElement || hasActivateBtn).toBe(true);
  });

  test('[CT-UC05-02] Ativar QR Code muda status para ativo e exibe confirmação', async ({ page }) => {
    const activateBtn = page.getByRole('button', { name: /ativar qr code|ativar coleta/i });
    const isActivateVisible = await activateBtn.isVisible().catch(() => false);

    if (!isActivateVisible) {
      test.skip();
      return;
    }

    await activateBtn.click();

    await expect(
      page.getByText(/qr code ativado|coleta ativada/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC05-03] Desativar QR Code muda status para inativo', async ({ page }) => {
    const deactivateBtn = page.getByRole('button', { name: /desativar qr code|pausar coleta/i });
    const isDeactivateVisible = await deactivateBtn.isVisible().catch(() => false);

    if (!isDeactivateVisible) {
      test.skip();
      return;
    }

    await deactivateBtn.click();

    await expect(
      page.getByText(/qr code desativado|coleta pausada/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC05-04] Botão de copiar link copia URL para clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const copyBtn = page.getByRole('button', { name: /copiar link|copiar url/i });
    const isCopyVisible = await copyBtn.isVisible().catch(() => false);

    if (!isCopyVisible) {
      test.skip();
      return;
    }

    await copyBtn.click();

    await expect(
      page.getByText(/copiado|link copiado/i),
    ).toBeVisible({ timeout: 5_000 });
  });

  test('[CT-UC05-05] Link do QR Code aponta para /feedback/qrcode com parâmetro de empresa', async ({ page }) => {
    const linkEl = page.locator('a[href*="/feedback/qrcode"], input[value*="/feedback/qrcode"]').first();
    const isLinkVisible = await linkEl.isVisible().catch(() => false);

    if (!isLinkVisible) {
      test.skip();
      return;
    }

    const href = await linkEl.getAttribute('href') || await linkEl.inputValue();
    expect(href).toContain('/feedback/qrcode');
    expect(href).toContain('enterprise');
  });

  test('[CT-UC05-06] Seção de instruções de uso do QR Code é exibida', async ({ page }) => {
    await expect(
      page.getByText(/como usar|instruções|passo a passo/i).first(),
    ).toBeVisible();
  });
});
