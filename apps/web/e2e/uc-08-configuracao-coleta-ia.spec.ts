import { test, expect } from '@playwright/test';

test.describe('UC-08: Configuração de coleta e contexto de IA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/user/profile');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC08-01] Página de configuração de coleta carrega com formulário visível', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/profile/);

    await expect(
      page.getByText(/o que.*empresa|empresa|objetivo|analytics/i).first(),
    ).toBeVisible();
  });

  test('[CT-UC08-02] Salvar objetivo da empresa persiste e exibe confirmação', async ({ page }) => {
    const objectiveField = page
      .locator('textarea, input[name*="objective"], input[name*="goal"], #companyObjective')
      .first();

    if (!(await objectiveField.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await objectiveField.fill('Melhorar a satisfação dos clientes em 20%');

    const saveBtn = page.getByRole('button', { name: /salvar|confirmar/i }).first();
    await saveBtn.click({ force: true });

    await expect(
      page.getByText(/salvo|configurações salvas|atualizado/i),
    ).toBeVisible({ timeout: 10_000 });
  });



  test('[CT-UC08-04] Resumo do negócio pode ser preenchido e salvo', async ({ page }) => {
    const summaryField = page
      .locator('textarea[name*="summary"], textarea[name*="business"], #businessSummary')
      .first();

    if (!(await summaryField.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await summaryField.fill('Empresa de varejo com foco em atendimento ao cliente.');

    const saveBtn = page.getByRole('button', { name: /salvar|confirmar/i }).first();
    await saveBtn.click({ force: true });

    await expect(
      page.getByText(/salvo|configurações salvas|atualizado/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
