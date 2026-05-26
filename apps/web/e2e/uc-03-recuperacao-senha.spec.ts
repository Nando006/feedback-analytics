import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('UC-03: Recuperação de senha', () => {


  test('[CT-UC03-03] Formulário de recuperação exibe erro para e-mail em formato inválido', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.fill('#email', 'nao-e-email');
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/e-mail inv.lido|informe um e-mail/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[CT-UC03-04] Formulário de recuperação exibe erro para campo em branco', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/e-mail inv.lido|campo obrigat.rio/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });
});
