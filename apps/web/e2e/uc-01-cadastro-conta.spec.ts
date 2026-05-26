import { test, expect } from '@playwright/test';
import { uniqueEmail, VALID_CPF, INVALID_CPF, VALID_PASSWORD, MISMATCHED_PASSWORD, generateRandomCpf, generateRandomPhone } from './fixtures/test-data';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('UC-01: Cadastro de conta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('[CT-UC01-01] Exibe pendência de verificação de e-mail após cadastro válido', async () => {
    test.skip(true, 'Requer fluxo de confirmação de e-mail — executar manualmente');
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

  test('[CT-UC01-04] Exibe erro de validação quando senhas não coincidem', async ({ page }) => {
    await page.fill('#fullName', 'Teste Senha');
    await page.fill('#email', uniqueEmail('senha'));
    await page.fill('#document', VALID_CPF);
    await page.fill('#phone', '11999990003');
    await page.fill('#password', VALID_PASSWORD);
    await page.fill('#confirmPassword', MISMATCHED_PASSWORD);
    await page.check('#terms');
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/senhas.*conferem|nao conferem|não conferem/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[CT-UC01-05] Exibe erro de validação para CPF inválido', async ({ page }) => {
    await page.fill('#fullName', 'Teste CPF');
    await page.fill('#email', uniqueEmail('cpf-inv'));
    await page.fill('#document', INVALID_CPF);
    await page.fill('#phone', '11999990004');
    await page.fill('#password', VALID_PASSWORD);
    await page.fill('#confirmPassword', VALID_PASSWORD);
    await page.check('#terms');
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/cpf inv.lido|documento inv.lido/i),
    ).toBeVisible({ timeout: 8_000 });
  });

  test('[CT-UC01-06] Exibe erro de validação quando termos não são aceitos', async ({ page }) => {
    await page.fill('#fullName', 'Teste Termos');
    await page.fill('#email', uniqueEmail('termos'));
    await page.fill('#document', VALID_CPF);
    await page.fill('#phone', '11999990005');
    await page.fill('#password', VALID_PASSWORD);
    await page.fill('#confirmPassword', VALID_PASSWORD);
    // não marca #terms propositalmente
    await page.click('button[type="submit"]');

    await expect(
      page.getByText(/necessário aceitar os termos|é necessário aceitar/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });
});
