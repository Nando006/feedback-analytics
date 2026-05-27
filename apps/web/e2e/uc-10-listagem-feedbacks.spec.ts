import { test, expect } from '@playwright/test';

test.describe('UC-10: Listagem de feedbacks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/feedbacks/all');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC10-01] Listagem carrega feedbacks ou exibe estado vazio', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/feedbacks\/all/);

    const hasFeedbacks = await page.locator('[data-feedback-card], .feedback-card, article').first().isVisible().catch(() => false);
    const isEmpty = await page.getByText(/nenhum feedback|sem feedbacks|vazio/i).isVisible().catch(() => false);

    expect(hasFeedbacks || isEmpty).toBe(true);
  });
});
