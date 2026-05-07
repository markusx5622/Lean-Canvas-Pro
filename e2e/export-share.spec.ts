import { test, expect } from '@playwright/test';
import {
  setupSupabaseMocks,
  loginAndEnterWorkspace,
} from './helpers/mocks';

// ── Authenticated flows ───────────────────────────────────────────────────────

test.describe('Export (authenticated)', () => {
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
});

