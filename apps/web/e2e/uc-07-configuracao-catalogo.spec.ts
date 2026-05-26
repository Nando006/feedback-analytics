import { test, expect } from '@playwright/test';

test.describe('UC-07: Configuração do catálogo', () => {
  test('[CT-UC07-01] Página de catálogo de produtos carrega corretamente', async ({ page }) => {
    await page.goto('/user/edit/feedback-products');
    await page.waitForLoadState('networkidle');

    const isAccessible = await page.getByRole('main').isVisible().catch(() => false);
    const isBlocked = await page.getByText(/tipo.*n.o ativado|ative.*produtos/i).isVisible().catch(() => false);

    expect(isAccessible || isBlocked).toBe(true);
  });

  test('[CT-UC07-05] Página de catálogo de serviços carrega corretamente', async ({ page }) => {
    await page.goto('/user/edit/feedback-services');
    await page.waitForLoadState('networkidle');

    const isAccessible = await page.getByRole('main').isVisible().catch(() => false);
    expect(isAccessible).toBe(true);
  });

  test('[CT-UC07-07] Página de catálogo de departamentos carrega corretamente', async ({ page }) => {
    await page.goto('/user/edit/feedback-departments');
    await page.waitForLoadState('networkidle');

    const isAccessible = await page.getByRole('main').isVisible().catch(() => false);
    expect(isAccessible).toBe(true);
  });
});
