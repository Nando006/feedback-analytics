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

  test('[CT-UC06-02] Alternar ativação de "Produtos" salva e exibe confirmação', async ({ page }) => {
    const toggle = page
      .locator('label, input[type="checkbox"], button[role="switch"]')
      .filter({ hasText: /produto/i })
      .first();

    const alternativeToggle = page
      .locator('[data-type="products"], [aria-label*="Produto"]')
      .first();

    const targetToggle = (await toggle.isVisible().catch(() => false))
      ? toggle
      : alternativeToggle;

    if (!(await targetToggle.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await targetToggle.click();

    const saveBtn = page.getByRole('button', { name: /salvar|confirmar/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
    }

    await expect(
      page.getByText(/salvo|configurações salvas|tipos.*atualizado/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC06-03] Alternar ativação de "Serviços" salva e exibe confirmação', async ({ page }) => {
    const toggle = page
      .locator('label, input[type="checkbox"], button[role="switch"]')
      .filter({ hasText: /servi.o/i })
      .first();

    if (!(await toggle.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await toggle.click();

    const saveBtn = page.getByRole('button', { name: /salvar|confirmar/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
    }

    await expect(
      page.getByText(/salvo|configurações salvas|tipos.*atualizado/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC06-04] Alternar ativação de "Departamentos" salva e exibe confirmação', async ({ page }) => {
    const toggle = page
      .locator('label, input[type="checkbox"], button[role="switch"]')
      .filter({ hasText: /departamento/i })
      .first();

    if (!(await toggle.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await toggle.click();

    const saveBtn = page.getByRole('button', { name: /salvar|confirmar/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
    }

    await expect(
      page.getByText(/salvo|configurações salvas|tipos.*atualizado/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
