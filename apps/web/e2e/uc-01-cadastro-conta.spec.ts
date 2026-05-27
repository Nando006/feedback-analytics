import { test, expect } from '@playwright/test';
import { uniqueEmail, VALID_CPF, VALID_PASSWORD, generateRandomCpf, generateRandomPhone } from './fixtures/test-data';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('UC-01: Cadastro de conta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });



  test('[CT-UC01-02] Segue para a tela de sucesso ao tentar cadastrar com e-mail já existente (prevenção de enumeração)', async ({ page }) => {
    await page.fill('#fullName', 'Usuário Duplicado');
    await page.fill('#email', 'gestor@empresateste.com');
    await page.fill('#document', generateRandomCpf());
    await page.fill('#phone', generateRandomPhone());
    await page.fill('#password', VALID_PASSWORD);
    await page.fill('#confirmPassword', VALID_PASSWORD);
    await page.check('#terms');
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/Cadastro realizado com sucesso/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('[CT-UC01-03] Exibe erro ao tentar cadastrar com documento já existente', async ({ page }) => {
    await page.fill('#fullName', 'Usuário CPF Dup');
    await page.fill('#email', uniqueEmail('dup-doc'));
    await page.fill('#document', VALID_CPF);
    await page.fill('#phone', '11999990002');
    await page.fill('#password', VALID_PASSWORD);
    await page.fill('#confirmPassword', VALID_PASSWORD);
    await page.check('#terms');
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/documento|cpf|j. cadastrado/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
