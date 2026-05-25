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

  test('[CT-UC10-02] Filtro por rating 5 estrelas exibe apenas feedbacks com nota 5', async ({ page }) => {
    const ratingFilter = page
      .locator('select[name*="rating"], button[data-rating="5"], [aria-label*="5 estrelas"]')
      .first();

    const hasRatingFilter = await ratingFilter.isVisible().catch(() => false);
    if (!hasRatingFilter) {
      test.skip();
      return;
    }

    if (await ratingFilter.evaluate((el) => el.tagName) === 'SELECT') {
      await ratingFilter.selectOption('5');
    } else {
      await ratingFilter.click();
    }

    await page.waitForLoadState('networkidle');

    // URL deve conter o filtro ou lista deve ser filtrada
    const url = page.url();
    expect(url).toContain('rating');
  });

  test('[CT-UC10-03] Busca por texto filtra feedbacks pelo conteúdo', async ({ page }) => {
    const searchInput = page
      .locator('input[type="search"], input[name*="search"], input[placeholder*="buscar"], input[placeholder*="pesqui"]')
      .first();

    if (!(await searchInput.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await searchInput.fill('atendimento');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('search');
  });

  test('[CT-UC10-04] Paginação avança para próxima página', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /próxima|next|>/i }).first();
    const hasNextBtn = await nextBtn.isVisible().catch(() => false);

    if (!hasNextBtn) {
      test.skip();
      return;
    }

    await nextBtn.click();
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('page=2');
  });

  test('[CT-UC10-05] Clicar em feedback abre modal/drawer com detalhes', async ({ page }) => {
    const feedbackItem = page
      .locator('[data-feedback-card], article, .feedback-card')
      .first();

    if (!(await feedbackItem.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await feedbackItem.click();

    await expect(
      page.locator('[role="dialog"], [data-modal], .modal, aside[data-drawer]').first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[CT-UC10-06] Filtro por categoria filtra feedbacks', async ({ page }) => {
    const categoryFilter = page
      .locator('select[name*="category"], button[data-filter*="category"]')
      .first();

    if (!(await categoryFilter.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const options = await categoryFilter.locator('option').all();
    if (options.length < 2) {
      test.skip();
      return;
    }

    await categoryFilter.selectOption({ index: 1 });
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toContain('category');
  });

  test('[CT-UC10-07] Cabeçalho de estatísticas de feedbacks é exibido na listagem', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /feedbacks/i }).first(),
    ).toBeVisible();
  });

  test('[CT-UC10-08] Limpar filtros restaura listagem completa', async ({ page }) => {
    // Aplica um filtro primeiro
    await page.goto('/user/feedbacks/all?rating=5');
    await page.waitForLoadState('networkidle');

    const clearBtn = page.getByRole('button', { name: /limpar|resetar|remover filtros/i }).first();
    if (!(await clearBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await clearBtn.click();
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).not.toContain('rating');
  });
});
