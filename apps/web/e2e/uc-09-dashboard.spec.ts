import { test, expect } from '@playwright/test';

test.describe('UC-09: Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/dashboard');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC09-01] Dashboard carrega e exibe saudação personalizada', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/dashboard/);
    await expect(page.getByText(/ol., /i)).toBeVisible();
  });

  test('[CT-UC09-02] Dashboard exibe métrica de total de feedbacks', async ({ page }) => {
    await expect(
      page.getByText(/total|feedbacks recebidos|feedbacks/i).first(),
    ).toBeVisible();
  });

  test('[CT-UC09-03] Dashboard exibe distribuição de sentimentos', async ({ page }) => {
    await expect(
      page.getByText(/positivo|neutro|negativo/i).first(),
    ).toBeVisible();
  });

  test('[CT-UC09-04] Dashboard exibe seção de últimos feedbacks', async ({ page }) => {
    await expect(
      page.getByText(/ltimos feedbacks|feedbacks recentes|sem feedbacks/i).first(),
    ).toBeVisible();
  });

  test('[CT-UC09-05] Clique em "Ver feedbacks" navega para listagem completa', async ({ page }) => {
    await page.getByRole('link', { name: /ver feedbacks/i }).first().click();

    await expect(page).toHaveURL(/\/user\/feedbacks\/all/, { timeout: 10_000 });
  });
});
