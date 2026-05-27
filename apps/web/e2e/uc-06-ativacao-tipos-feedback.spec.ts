import { test, expect } from '@playwright/test';

test.describe('UC-06: Ativação de tipos de feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/edit/types-feedback');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC06-01] Página de tipos de feedback carrega com as opções disponíveis', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/edit\/types-feedback/);

    await expect(
      page.getByText(/produtos|servi.os|departamentos/i).first(),
    ).toBeVisible();
  });


});
