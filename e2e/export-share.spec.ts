import { test, expect } from '@playwright/test';
import {
  setupSupabaseMocks,
  loginAndEnterWorkspace,
  MOCK_SHARE,
  MOCK_SHARE_TOKEN,
  MOCK_CANVAS,
} from './helpers/mocks';

// ── Authenticated flows ───────────────────────────────────────────────────────

test.describe('Export and sharing (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
    await loginAndEnterWorkspace(page);
  });

  // ── PDF export ───────────────────────────────────────────────────────────────

  test('exports the canvas as a PDF download', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Exportar PDF")');
    await expect(exportBtn).toBeVisible({ timeout: 5_000 });

    await exportBtn.click();

    // The export options dialog should appear
    const dialog = page.locator('[role="dialog"][aria-labelledby="export-options-title"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Start watching for a download before submitting
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });

    // Submit the dialog to generate the PDF
    await dialog.locator('button[type="submit"]').click();

    // The toolbar button should enter a loading state
    await expect(page.locator('text=Generando...').first()).toBeVisible({ timeout: 5_000 });

    // A download should eventually be triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  // ── Share link ───────────────────────────────────────────────────────────────

  test('generates a read-only share link', async ({ page }) => {
    // Open the share modal
    const shareBtn = page.locator('[aria-label*="Compartir"]').first();
    await expect(shareBtn).toBeVisible({ timeout: 5_000 });
    await shareBtn.click();

    // The share dialog must appear
    const dialog = page.locator('[role="dialog"][aria-labelledby="share-modal-title"]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Click "Generar enlace de solo lectura"
    const generateBtn = dialog.locator('button:has-text("Generar enlace de solo lectura")');
    await expect(generateBtn).toBeVisible({ timeout: 3_000 });
    await generateBtn.click();

    // The generated URL should contain the mock share token
    await expect(dialog.locator('span').filter({ hasText: MOCK_SHARE_TOKEN })).toBeVisible({
      timeout: 5_000,
    });

    // Close the modal and check the active-share indicator dot in the toolbar
    await dialog.locator('[aria-label="Cerrar"]').click();
    const activeBadge = page.locator('[aria-label*="Canvas compartido"]');
    await expect(activeBadge).toBeVisible({ timeout: 3_000 });
  });
});

// ── Public shared view ────────────────────────────────────────────────────────

test.describe('Shared canvas (read-only public view)', () => {
  test('renders the canvas in read-only mode via a share link', async ({ page }) => {
    // Mock the public RPC that SharedCanvasView uses to load the canvas
    await page.route('**/rest/v1/rpc/get_canvas_by_share_token*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...MOCK_CANVAS }]),
      });
    });

    // Navigate directly to the share URL — no auth required for the shared view
    await page.goto(`/share/${MOCK_SHARE_TOKEN}`);

    // The read-only badge must be visible
    await expect(page.locator('text=Solo lectura').first()).toBeVisible({ timeout: 10_000 });

    // The edit textarea must NOT be rendered in the shared view
    await expect(page.locator('#editorCanvas')).not.toBeVisible({ timeout: 5_000 });

    // Block titles are rendered (even for empty blocks)
    await expect(page.locator('h3').filter({ hasText: 'Problema' })).toBeVisible({ timeout: 5_000 });
  });
});

