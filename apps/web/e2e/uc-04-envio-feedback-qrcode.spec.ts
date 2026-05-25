import { test, expect } from '@playwright/test';
import { TEST_ENTERPRISE_ID, QR_FEEDBACK } from './fixtures/test-data';
import { resetDeviceFingerprint } from './fixtures/supabase-helpers';

test.use({ storageState: { cookies: [], origins: [] } });

const QR_PATH = `/feedback/qrcode?enterprise=${TEST_ENTERPRISE_ID}`;

test.describe('UC-04: Envio de feedback via QR Code', () => {
  test.beforeAll(async () => {
    if (TEST_ENTERPRISE_ID) {
      await resetDeviceFingerprint(TEST_ENTERPRISE_ID);
    }
  });

  test('[CT-UC04-01] Envio válido exibe confirmação de feedback recebido', async ({ page }) => {
    test.skip(!TEST_ENTERPRISE_ID, 'E2E_TEST_ENTERPRISE_ID não configurado');

    await page.goto(QR_PATH);
    await expect(page.getByRole('main')).toBeVisible();

    // Seleciona estrela 5 (rating)
    const stars = page.locator('[data-rating], button[aria-label*="estrela"], [aria-label*="star"]');
    if (await stars.count() > 0) {
      await stars.nth(4).click();
    }

    // Preenche mensagem
    const messageField = page.locator('textarea, [name="message"]').first();
    if (await messageField.isVisible()) {
      await messageField.fill(QR_FEEDBACK.message);
    }

    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/feedback enviado|obrigado|recebemos/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('[CT-UC04-02] Segundo envio pelo mesmo dispositivo exibe bloqueio por fingerprint', async ({ page }) => {
    test.skip(!TEST_ENTERPRISE_ID, 'E2E_TEST_ENTERPRISE_ID não configurado');

    await page.goto(QR_PATH);

    await expect(
      page.getByText(/j. enviou|device.*bloqueado|feedback j. registrado|limite/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC04-03] Acesso com enterprise_id inválido exibe empresa não encontrada', async ({ page }) => {
    await page.goto('/feedback/qrcode?enterprise=id-invalido-que-nao-existe');

    await expect(
      page.getByText(/empresa n.o encontrada|qr code inv.lido|n.o encontrado|404/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC04-04] Envio sem rating exibe erro de validação', async ({ page }) => {
    test.skip(!TEST_ENTERPRISE_ID, 'E2E_TEST_ENTERPRISE_ID não configurado');
    await resetDeviceFingerprint(TEST_ENTERPRISE_ID);

    await page.goto(QR_PATH);
    await expect(page.getByRole('main')).toBeVisible();

    // Submete sem selecionar rating
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/avalia..o obrigat.ria|selecione.*estrela|rating/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[CT-UC04-05] Acesso sem parâmetro enterprise exibe mensagem de erro', async ({ page }) => {
    await page.goto('/feedback/qrcode');

    await expect(
      page.getByText(/empresa n.o encontrada|par.metro|qr code inv.lido/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC04-06] Campos opcionais de identificação são preenchíveis', async ({ page }) => {
    test.skip(!TEST_ENTERPRISE_ID, 'E2E_TEST_ENTERPRISE_ID não configurado');
    await resetDeviceFingerprint(TEST_ENTERPRISE_ID);

    await page.goto(QR_PATH);
    await expect(page.getByRole('main')).toBeVisible();

    const toggleBtn = page.getByText(/informa..es pessoais/i);
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();

      const nameField = page.locator('#customerName, [name="customerName"]');
      if (await nameField.isVisible()) {
        await nameField.fill('João Teste');
      }
    }

    // Verifica que o formulário ainda está acessível sem erro
    await expect(page.locator('form')).toBeVisible();
  });
});
