import { test, expect } from '@playwright/test';
import { setupSupabaseMocks, loginAndEnterWorkspace } from './helpers/mocks';

test.describe('AI content studio', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);

    await page.route('**/api/assistant', async (route) => {
      const body = route.request().postDataJSON() as {
        messages?: Array<{ role: string; content: string }>;
      };
      const prompt = body.messages?.[0]?.content ?? '';

      let reply = 'Respuesta generada de prueba.';
      if (prompt.includes('resumen ejecutivo')) {
        reply = 'Resumen ejecutivo de prueba para validar la UI.';
      } else if (prompt.includes('elevator pitch')) {
        reply = 'Elevator pitch de prueba para validar la UI.';
      } else if (prompt.includes('landing page')) {
        reply = 'Texto de landing page de prueba para validar la UI.';
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reply }),
      });
    });

    await loginAndEnterWorkspace(page);
  });

  test('opens dedicated AI content section and generates outputs', async ({ page }) => {
    await page.getByRole('button', { name: '✨ Generar contenido IA' }).click();

    await expect(page.getByText('AI Content Studio')).toBeVisible();
    await expect(page.getByText('Convierte tu Lean Canvas en contenido listo para usar')).toBeVisible();

    const summaryCard = page.locator('article', { hasText: 'Resumen ejecutivo' });
    await summaryCard.getByRole('button', { name: 'Generar' }).click();
    await expect(summaryCard.getByText('Resumen ejecutivo de prueba para validar la UI.')).toBeVisible();
    await expect(summaryCard.getByRole('button', { name: 'Copiar resumen' })).toBeVisible();

    const pitchCard = page.locator('article', { hasText: 'Elevator pitch' });
    await pitchCard.getByRole('button', { name: 'Generar' }).click();
    await expect(pitchCard.getByText('Elevator pitch de prueba para validar la UI.')).toBeVisible();

    const landingCard = page.locator('article', { hasText: 'Texto para landing page' });
    await landingCard.getByRole('button', { name: 'Generar' }).click();
    await expect(landingCard.getByText('Texto de landing page de prueba para validar la UI.')).toBeVisible();

    await page.screenshot({ path: '/tmp/ai-content-studio.png', fullPage: true });

    await page.getByRole('button', { name: 'Volver al canvas' }).click();
    await expect(page.getByLabel('Seleccionar lienzo')).toBeVisible();
  });
});

