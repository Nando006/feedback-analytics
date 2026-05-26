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
});
