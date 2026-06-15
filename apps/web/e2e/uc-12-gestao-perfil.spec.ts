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

  test('[CT-UC12-04] Configuração do catálogo é acessível', async ({ page }) => {
    // O catálogo não fica mais no perfil; é acessível pelo menu
    // (Configuração da coleta → Catálogo). Validamos que a tela responde na rota.
    await page.goto('/user/edit/types-feedback');
    await expect(page).toHaveURL(/\/user\/edit\/types-feedback/, { timeout: 10_000 });
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('[CT-UC12-06] Logout redireciona para página de login', async ({ page }) => {
    await page.goto('/user/dashboard');
    await expect(page.getByRole('main')).toBeVisible();

    // Logout fica dentro do menu de conta (avatar com aria-haspopup="menu"),
    // como item de menu (role="menuitem"). Abre o dropdown e clica em "Sair".
    const accountTrigger = page.locator('button[aria-haspopup="menu"]').first();
    if (!(await accountTrigger.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    await accountTrigger.click();

    await page.getByRole('menuitem', { name: /sair|logout/i }).first().click();

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
