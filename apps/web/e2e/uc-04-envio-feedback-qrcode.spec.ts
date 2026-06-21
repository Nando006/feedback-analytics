import { test, expect } from '@playwright/test';
import { TEST_ENTERPRISE_ID, QR_FEEDBACK } from './fixtures/test-data';
import {
  resetDeviceFingerprint,
  getActiveQrCollectionPoint,
} from './fixtures/supabase-helpers';

test.use({ storageState: { cookies: [], origins: [] } });

const FEEDBACK_ENDPOINT = '/api/public/qrcode/feedback';

// Resolvido no beforeAll: o submit exige um collection_point QR ativo, então a
// URL precisa apontar para um real (e não só `?enterprise=...`, que o loader
// aceita mas o submit recusa com 404).
let qrCollectionPointId: string | null = null;
let qrCatalogItemId: string | null = null;

function buildQrPath(): string {
  const params = new URLSearchParams({ enterprise: TEST_ENTERPRISE_ID });
  if (qrCollectionPointId) params.set('collection_point', qrCollectionPointId);
  if (qrCatalogItemId) params.set('item', qrCatalogItemId);
  return `/feedback/qrcode?${params.toString()}`;
}

test.describe('UC-04: Envio de feedback via QR Code', () => {
  test.beforeAll(async () => {
    if (!TEST_ENTERPRISE_ID) return;
    await resetDeviceFingerprint(TEST_ENTERPRISE_ID);
    const cp = await getActiveQrCollectionPoint(TEST_ENTERPRISE_ID);
    if (cp) {
      qrCollectionPointId = cp.id;
      qrCatalogItemId = cp.catalogItemId;
    }
  });

  test('[CT-UC04-01] Envio válido exibe confirmação de feedback recebido', async ({ page }) => {
    test.skip(!TEST_ENTERPRISE_ID, 'E2E_TEST_ENTERPRISE_ID não configurado');
    test.skip(
      !qrCollectionPointId,
      'Empresa de teste não possui collection_point QR ativo — verifique a config no homolog',
    );

    await page.goto(buildQrPath());
    await expect(page.getByRole('main')).toBeVisible();
    await page.waitForLoadState('networkidle');

    // 1. Estrelas redondas no topo (nota global, se presentes)
    const stars = page.locator('button[type="button"][class*="rounded-full"][class*="w-12"]');
    if (await stars.count() >= 5) {
      await stars.nth(4).click();
    }

    // 2. Botões Likert por questão e subperguntas (Ótima) — todos já renderizados.
    const otimaBtns = page.locator('button').filter({ hasText: 'Ótima' });
    const otimaCount = await otimaBtns.count();
    for (let i = 0; i < otimaCount; i++) {
      await otimaBtns.nth(i).click();
    }

    // 3. Preenche comentário
    const messageField = page.locator('textarea').first();
    if (await messageField.isVisible()) {
      await messageField.fill(QR_FEEDBACK.message);
    }

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes(FEEDBACK_ENDPOINT) &&
        res.request().method() === 'POST',
      { timeout: 15_000 },
    );

    await page.locator('button[type="submit"]').click();

    // Captura o status real do submit: assim uma rejeição do servidor
    // (404 sem collection_point, 400 por mismatch de perguntas, 5xx) falha com
    // o motivo, em vez de estourar timeout em "elemento não encontrado".
    const response = await responsePromise;
    const body = await response.text().catch(() => '');
    expect(
      response.status(),
      `POST ${FEEDBACK_ENDPOINT} retornou ${response.status()}: ${body}`,
    ).toBe(200);

    await expect(
      page.getByText(/feedback enviado|obrigado|recebemos/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });



  test('[CT-UC04-03] Acesso com enterprise_id inválido exibe empresa não encontrada', async ({ page }) => {
    await page.goto('/feedback/qrcode?enterprise=id-invalido-que-nao-existe');

    await expect(
      page.getByText(/empresa n.o encontrada|qr code inv.lido|n.o encontrado|404/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
