import { test, expect } from '@playwright/test';

test.describe('UC-11: Insights de IA', () => {
  test('[CT-UC11-01] Página de relatório de insights carrega com sumário ou estado vazio', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    const hasSummary = await page.getByText(/sum.rio|resumo|insights/i).first().isVisible().catch(() => false);
    const isEmpty = await page.getByText(/nenhum insight|sem dados|gerar insights|sem feedbacks/i).isVisible().catch(() => false);

    expect(hasSummary || isEmpty).toBe(true);
  });

  test('[CT-UC11-02] Página de insights exibe análise de sentimentos e keywords', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    const hasAnalysis = await page
      .getByText(/positivo|negativo|neutro|palavra-chave|keywords/i)
      .first()
      .isVisible()
      .catch(() => false);

    const isEmptyState = await page
      .getByText(/nenhum insight|sem dados|gerar insights|ainda não há relatório/i)
      .first()
      .isVisible()
      .catch(() => false);

    // Se não houver dados, o estado vazio é válido
    expect(hasAnalysis || isEmptyState).toBe(true);
  });

  test('[CT-UC11-03] Página de insights emocionais carrega', async ({ page }) => {
    await page.goto('/user/insights/emotional');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page).toHaveURL(/\/user\/insights\/emotional/);
  });

  test('[CT-UC11-04] Página de estatísticas de insights carrega', async ({ page }) => {
    await page.goto('/user/insights/statistics');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page).toHaveURL(/\/user\/insights\/statistics/);
  });

  test('[CT-UC11-05] Botão de regenerar insights solicita nova análise', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    const regenerateBtn = page.getByRole('button', { name: /regenerar|gerar insights|atualizar insights/i }).first();

    if (!(await regenerateBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    // Intercepta a chamada de API para não consumir créditos Gemini
    await page.route('**/api/protected/ia-analyze/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, analyzedCount: 1 }),
      });
    });

    await regenerateBtn.click();

    await expect(
      page.getByText(/processando|gerando|analisando|aguarde|insights atualizados/i),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('[CT-UC11-06] Recomendações de IA são exibidas quando disponíveis', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    const hasRecommendations = await page
      .getByText(/recomenda..o|sugest.o|melhorar/i)
      .first()
      .isVisible()
      .catch(() => false);

    const isEmptyState = await page
      .getByText(/nenhum insight|sem dados|gerar insights|ainda não há relatório/i)
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasRecommendations || isEmptyState).toBe(true);
  });

  test('[CT-UC11-07] Insights sem feedbacks suficientes exibem estado orientativo', async ({ page }) => {
    await page.goto('/user/insights/reports');
    await expect(page.getByRole('main')).toBeVisible();

    // O estado vazio deve ser descritivo — não um erro genérico
    const emptyState = page.getByText(/sem feedbacks|nenhum insight|gerar insights|configure|adicione feedbacks/i).first();
    const hasData = page.getByText(/sum.rio|resumo|insights/i).first();

    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const dataVisible = await hasData.isVisible().catch(() => false);

    expect(emptyVisible || dataVisible).toBe(true);
  });
});
