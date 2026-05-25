import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('UC-02: Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('[CT-UC02-01] Login com credenciais válidas redireciona para dashboard', async ({ page }) => {
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/user\/dashboard/, { timeout: 15_000 });
    await expect(page.getByText('Olá,')).toBeVisible();
  });

  test('[CT-UC02-02] Login com senha incorreta exibe mensagem de erro', async ({ page }) => {
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', 'senha-errada-123');
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/e-mail ou senha incorretos|credenciais inv.lidas/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('[CT-UC02-03] Login com e-mail em formato inválido bloqueia envio', async ({ page }) => {
    await page.fill('#email', 'nao-e-um-email');
    await page.fill('#password', 'qualquersenha');
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/e-mail inv.lido|informe um e-mail/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[CT-UC02-04] Login com conta não verificada exibe aviso de verificação', async () => {
    test.skip(true, 'Requer conta criada mas não verificada — executar manualmente com conta de teste dedicada');
  });
});
