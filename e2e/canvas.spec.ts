import { test, expect } from '@playwright/test';
import { setupSupabaseMocks, loginAndEnterWorkspace, MOCK_CANVAS } from './helpers/mocks';

test.describe('Canvas management', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
    await loginAndEnterWorkspace(page);
  });

  // ── Create canvas ────────────────────────────────────────────────────────────

  test('creates a new canvas', async ({ page }) => {
    const initialName = await page.locator('[aria-label="Seleccionar lienzo"]').inputValue();

    // Click the "Nuevo" button (hidden on small screens; viewport is 1280px wide)
    await page.click('button:has-text("Nuevo")');

    // The project dropdown now contains at least two entries
    const options = page.locator('[aria-label="Seleccionar lienzo"] option');
    await expect(options).toHaveCount(2, { timeout: 5_000 });

    // The selected canvas should have changed
    const newName = await page.locator('[aria-label="Seleccionar lienzo"]').inputValue();
    expect(newName).not.toBe(initialName);
  });

  // ── Edit a block ─────────────────────────────────────────────────────────────

  test('opens a block editor and autosaves changes', async ({ page }) => {
    // Click on the first block card — "Problema" (block id 1)
    await page.locator('text=Problema').first().click();

    // The desktop editor panel must appear (#editorCanvas is the desktop textarea)
    const textarea = page.locator('#editorCanvas');
    await expect(textarea).toBeVisible({ timeout: 5_000 });

    // Type some content
    const sampleText = 'Los clientes no encuentran transporte confiable a tiempo.';
    await textarea.fill(sampleText);

    // The "Guardando…" indicator should appear briefly in either editor
    await expect(page.locator('text=Guardando...').first()).toBeVisible({ timeout: 3_000 });

    // Then resolve to "Guardado" once the mock PATCH resolves
    await expect(page.locator('text=Guardado').first()).toBeVisible({ timeout: 5_000 });

    // Content is preserved in the textarea
    await expect(textarea).toHaveValue(sampleText);
  });

  // ── Strategic audit ──────────────────────────────────────────────────────────

  test('runs the strategic audit after editing blocks', async ({ page }) => {
    // Fill block 1 (Problema) so the audit button becomes enabled
    await page.locator('text=Problema').first().click();
    const textarea = page.locator('#editorCanvas');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill('Encontrar transporte de confianza en tiempo real.');
    // Wait for autosave to complete before triggering audit
    await expect(page.locator('text=Guardado').first()).toBeVisible({ timeout: 5_000 });

    // The audit button in the toolbar
    const auditBtn = page.locator('button:has-text("Auditoría Estratégica")');
    await expect(auditBtn).toBeEnabled({ timeout: 3_000 });
    await auditBtn.click();

    // The audit dialog must open with a score headline
    await expect(page.locator('[role="dialog"][aria-labelledby="audit-dialog-title"]')).toBeVisible({
      timeout: 5_000,
    });

    // Score should be a number 0-100
    const scoreText = await page.locator('[role="dialog"] .text-5xl').textContent();
    expect(Number(scoreText)).toBeGreaterThanOrEqual(0);

    // Close the dialog
    await page.click('[aria-label="Cerrar auditoría"]');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3_000 });
  });

  // ── Per-block audit ──────────────────────────────────────────────────────────

  test('runs a per-block audit from the editor panel', async ({ page }) => {
    await page.locator('text=Problema').first().click();
    const textarea = page.locator('#editorCanvas');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill('Los clientes no tienen acceso a transporte local seguro y económico.');

    // Click "Auditar bloque"
    const blockAuditBtn = page.locator('button:has-text("Auditar bloque")');
    await expect(blockAuditBtn).toBeEnabled({ timeout: 3_000 });
    await blockAuditBtn.click();

    // Inline block audit result must appear
    await expect(page.locator('text=Análisis del bloque')).toBeVisible({ timeout: 5_000 });
  });
});

