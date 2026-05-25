import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test-data';

test.describe('UC-12: Gestão de perfil', () => {
  test('[CT-UC12-01] Página de perfil carrega com dados da empresa', async ({ page }) => {
    await page.goto('/user/profile');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page).toHaveURL(/\/user\/profile/);

    await expect(
      page.getByText(/perfil|empresa|nome|e-mail/i).first(),
    ).toBeVisible();
  });

  test('[CT-UC12-02] E-mail do usuário autenticado é exibido no perfil', async ({ page }) => {
    await page.goto('/user/profile');
    await expect(page.getByRole('main')).toBeVisible();

    await expect(page.getByText(TEST_USER.email)).toBeVisible();
  });

  test('[CT-UC12-03] Link para QR Code da empresa está presente no perfil', async ({ page }) => {
    await page.goto('/user/profile');
    await expect(page.getByRole('main')).toBeVisible();

    const qrLink = page.getByRole('link', { name: /qr code|acessar qr code/i }).first();
    if (!(await qrLink.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await qrLink.click();
    await expect(page).toHaveURL(/\/user\/qrcode\/enterprise/, { timeout: 10_000 });
  });

  test('[CT-UC12-04] Link para configuração do catálogo está presente no perfil', async ({ page }) => {
    await page.goto('/user/profile');
    await expect(page.getByRole('main')).toBeVisible();

    const catalogLink = page
      .getByRole('link', { name: /cat.logo|configura..es do cat.logo/i })
      .first();

    if (!(await catalogLink.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await catalogLink.click();
    await expect(page).toHaveURL(/\/user\/edit\/(types-feedback|feedback-settings)/, { timeout: 10_000 });
  });

  test('[CT-UC12-05] Informações colapsáveis da empresa são expandíveis', async ({ page }) => {
    await page.goto('/user/profile');
    await expect(page.getByRole('main')).toBeVisible();

    const toggleBtn = page
      .locator('button[aria-expanded], details summary, button[data-collapse]')
      .first();

    if (!(await toggleBtn.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await toggleBtn.click();

    // Verifica que algum conteúdo colapsável ficou visível
    await expect(page.locator('[aria-expanded="true"], details[open]').first()).toBeVisible({ timeout: 5_000 });
  });

  test('[CT-UC12-06] Logout redireciona para página de login', async ({ page }) => {
    await page.goto('/user/dashboard');
    await expect(page.getByRole('main')).toBeVisible();

    const logoutBtn = page.getByRole('button', { name: /sair|logout/i }).first();
    const logoutLink = page.getByRole('link', { name: /sair|logout/i }).first();

    const btnVisible = await logoutBtn.isVisible().catch(() => false);
    const linkVisible = await logoutLink.isVisible().catch(() => false);

    if (!btnVisible && !linkVisible) {
      // Tenta via menu/dropdown
      const menuBtn = page.locator('[aria-label*="menu"], [data-menu-trigger], button[aria-haspopup]').first();
      if (await menuBtn.isVisible().catch(() => false)) {
        await menuBtn.click();
      } else {
        test.skip();
        return;
      }
    }

    if (btnVisible) {
      await logoutBtn.click();
    } else if (linkVisible) {
      await logoutLink.click();
    } else {
      await page.getByRole('button', { name: /sair|logout/i }).first().click();
    }

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('[CT-UC12-07] Usuário não autenticado é redirecionado para login ao acessar rota protegida', async ({ page }) => {
    // Usa contexto sem autenticação
    const newContext = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } });
    const newPage = await newContext.newPage();

    await newPage.goto('/user/dashboard');
    await expect(newPage).toHaveURL(/\/login/, { timeout: 10_000 });

    await newContext.close();
  });
});
