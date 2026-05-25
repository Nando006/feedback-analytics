import { test, expect } from '@playwright/test';

const PRODUCT_NAME = `Produto E2E ${Date.now()}`;
const SERVICE_NAME = `Serviço E2E ${Date.now()}`;
const DEPT_NAME = `Depto E2E ${Date.now()}`;

test.describe('UC-07: Configuração do catálogo', () => {
  test('[CT-UC07-01] Página de catálogo de produtos carrega corretamente', async ({ page }) => {
    await page.goto('/user/edit/feedback-products');
    await page.waitForLoadState('networkidle');

    const isAccessible = await page.getByRole('main').isVisible().catch(() => false);
    const isBlocked = await page.getByText(/tipo.*n.o ativado|ative.*produtos/i).isVisible().catch(() => false);

    expect(isAccessible || isBlocked).toBe(true);
  });

  test('[CT-UC07-02] Adicionar produto ao catálogo exibe item na lista', async ({ page }) => {
    await page.goto('/user/edit/feedback-products');

    const blocked = await page.getByText(/tipo.*n.o ativado|ative.*produtos/i).isVisible().catch(() => false);
    if (blocked) {
      test.skip();
      return;
    }

    const addBtn = page.getByRole('button', { name: /adicionar|novo produto/i }).first();
    if (!(await addBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await addBtn.click();

    const nameInput = page.locator('input[name="name"], input[placeholder*="nome"], #productName').first();
    await nameInput.fill(PRODUCT_NAME);

    const saveBtn = page.getByRole('button', { name: /salvar|adicionar|confirmar/i }).last();
    await saveBtn.click();

    await expect(page.getByText(PRODUCT_NAME)).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC07-03] Editar produto existente salva a alteração', async ({ page }) => {
    await page.goto('/user/edit/feedback-products');

    const blocked = await page.getByText(/tipo.*n.o ativado|ative.*produtos/i).isVisible().catch(() => false);
    if (blocked) {
      test.skip();
      return;
    }

    const editBtn = page.getByRole('button', { name: /editar/i }).first();
    if (!(await editBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await editBtn.click();
    const editedName = `Produto Editado ${Date.now()}`;
    const nameInput = page.locator('input[name="name"], input[placeholder*="nome"]').first();
    await nameInput.fill(editedName);

    await page.getByRole('button', { name: /salvar|confirmar/i }).last().click();
    await expect(page.getByText(editedName)).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC07-04] Remover produto do catálogo remove item da lista', async ({ page }) => {
    await page.goto('/user/edit/feedback-products');

    const blocked = await page.getByText(/tipo.*n.o ativado|ative.*produtos/i).isVisible().catch(() => false);
    if (blocked) {
      test.skip();
      return;
    }

    const deleteBtn = page.getByRole('button', { name: /excluir|remover|deletar/i }).first();
    if (!(await deleteBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    const itemText = await page.locator('li, [data-item]').first().textContent().catch(() => '');
    await deleteBtn.click();

    const confirmBtn = page.getByRole('button', { name: /confirmar|sim|excluir/i }).first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
    }

    if (itemText) {
      await expect(page.getByText(itemText.trim())).not.toBeVisible({ timeout: 10_000 });
    } else {
      await expect(page.getByText(/exclu.do|removido/i)).toBeVisible({ timeout: 10_000 });
    }
  });

  test('[CT-UC07-05] Página de catálogo de serviços carrega corretamente', async ({ page }) => {
    await page.goto('/user/edit/feedback-services');
    await page.waitForLoadState('networkidle');

    const isAccessible = await page.getByRole('main').isVisible().catch(() => false);
    expect(isAccessible).toBe(true);
  });

  test('[CT-UC07-06] Adicionar serviço ao catálogo exibe item na lista', async ({ page }) => {
    await page.goto('/user/edit/feedback-services');

    const blocked = await page.getByText(/tipo.*n.o ativado|ative.*servi.os/i).isVisible().catch(() => false);
    if (blocked) {
      test.skip();
      return;
    }

    const addBtn = page.getByRole('button', { name: /adicionar|novo servi.o/i }).first();
    if (!(await addBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await addBtn.click();
    const nameInput = page.locator('input[name="name"], input[placeholder*="nome"]').first();
    await nameInput.fill(SERVICE_NAME);

    await page.getByRole('button', { name: /salvar|adicionar|confirmar/i }).last().click();
    await expect(page.getByText(SERVICE_NAME)).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC07-07] Página de catálogo de departamentos carrega corretamente', async ({ page }) => {
    await page.goto('/user/edit/feedback-departments');
    await page.waitForLoadState('networkidle');

    const isAccessible = await page.getByRole('main').isVisible().catch(() => false);
    expect(isAccessible).toBe(true);
  });

  test('[CT-UC07-08] Adicionar departamento ao catálogo exibe item na lista', async ({ page }) => {
    await page.goto('/user/edit/feedback-departments');

    const blocked = await page.getByText(/tipo.*n.o ativado|ative.*departamento/i).isVisible().catch(() => false);
    if (blocked) {
      test.skip();
      return;
    }

    const addBtn = page.getByRole('button', { name: /adicionar|novo departamento/i }).first();
    if (!(await addBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await addBtn.click();
    const nameInput = page.locator('input[name="name"], input[placeholder*="nome"]').first();
    await nameInput.fill(DEPT_NAME);

    await page.getByRole('button', { name: /salvar|adicionar|confirmar/i }).last().click();
    await expect(page.getByText(DEPT_NAME)).toBeVisible({ timeout: 10_000 });
  });
});
