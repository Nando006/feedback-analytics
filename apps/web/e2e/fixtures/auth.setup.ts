import { test as setup, expect } from '@playwright/test';
import { TEST_USER } from './test-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

setup('autenticar usuário de teste', async ({ page }) => {
  await page.goto('/login');

  await page.fill('#email', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/user\/dashboard/, { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
