import { test, expect } from '@playwright/test';
import { setupSupabaseMocks, loginAndEnterWorkspace } from './helpers/mocks';

test.describe('Herramientas Estratégicas (local tools)', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
    await loginAndEnterWorkspace(page);
  });

  test('opens strategic tools section from canvas button', async ({ page }) => {
    await page.getByRole('button', { name: /Herramientas/ }).first().click();

    await expect(page.getByText('Herramientas Estratégicas')).toBeVisible();
    await expect(page.getByRole('button', { name: /Análisis/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Generar contenido/ })).toBeVisible();
  });

  test('shows strategic analysis tab with canvas state', async ({ page }) => {
    await page.getByRole('button', { name: /Herramientas/ }).first().click();

    await expect(page.getByText('Herramientas Estratégicas')).toBeVisible();
    await expect(page.getByText('Estado del canvas')).toBeVisible();
    // Analysis should show some output (either checks or "no issues" message)
    const hasChecks = await page.locator('[class*="rose"],[class*="amber"],[class*="blue"]').first().isVisible().catch(() => false);
    const hasNoIssues = await page.getByText('Canvas estratégicamente sólido').isVisible().catch(() => false);
    expect(hasChecks || hasNoIssues).toBe(true);
  });

  test('generates content locally without API calls', async ({ page }) => {
    // Ensure no calls to /api/assistant happen
    const apiCalls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/assistant')) {
        apiCalls.push(req.url());
      }
    });

    await page.getByRole('button', { name: /Herramientas/ }).first().click();
    await page.getByRole('button', { name: /Generar contenido/ }).click();

    const summaryCard = page.locator('article', { hasText: 'Resumen ejecutivo' });
    await summaryCard.getByRole('button', { name: /Generar/ }).click();
    // Result should appear instantly (local generation)
    await expect(summaryCard.locator('[data-testid="generated-output"]')).toBeVisible();

    const pitchCard = page.locator('article', { hasText: 'Elevator pitch' });
    await pitchCard.getByRole('button', { name: /Generar/ }).click();
    await expect(pitchCard.locator('[data-testid="generated-output"]')).toBeVisible();

    const landingCard = page.locator('article', { hasText: 'Texto para landing page' });
    await landingCard.getByRole('button', { name: /Generar/ }).click();
    await expect(landingCard.locator('[data-testid="generated-output"]')).toBeVisible();

    // No AI API calls should have been made
    expect(apiCalls).toHaveLength(0);

    await page.screenshot({ path: '/tmp/herramientas-estrategicas.png', fullPage: true });

    await page.getByRole('button', { name: 'Volver al canvas' }).click();
    await expect(page.getByLabel('Seleccionar lienzo')).toBeVisible();
  });
});
