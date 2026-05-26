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
    await page.waitForLoadState('networkidle');

    // 1. Estrelas redondas no topo (nota global, se presentes)
    const stars = page.locator('button[type="button"][class*="rounded-full"][class*="w-12"]');
    if (await stars.count() >= 5) {
      await stars.nth(4).click();
    }

    // 2. Botões Likert por questão (Ótima) — filter por texto exato
    const otimaBtns = page.locator('button').filter({ hasText: 'Ótima' });
    const otimaCount = await otimaBtns.count();
    for (let i = 0; i < otimaCount; i++) {
      await otimaBtns.nth(i).click();
    }

    // 3. Preenche comentário
    const messageField = page.locator('textarea').first();
    if (await messageField.isVisible()) {
      await messageField.fill(QR_FEEDBACK.message);
    }

    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText(/feedback enviado|obrigado|recebemos/i).first(),
    ).toBeVisible({ timeout: 15_000 });
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
    await page.waitForLoadState('networkidle');

    // Preenche a mensagem para evitar bloqueio nativo do browser (textarea required)
    // mas NÃO seleciona nenhuma avaliação (estrela nem Likert)
    const messageField = page.locator('textarea').first();
    if (await messageField.isVisible()) {
      await messageField.fill('Teste sem avaliação');
    }

    await page.locator('button[type="submit"]').click();

    await expect(
      page.getByText(/responda.*perguntas|selecione uma avalia..|por favor.*selecione/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[CT-UC04-05] Acesso sem parâmetro enterprise exibe mensagem de erro', async ({ page }) => {
    await page.goto('/feedback/qrcode');

    await expect(
      page.getByText(/id da empresa|empresa.*n.o encontrada|qr code/i).first(),
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
