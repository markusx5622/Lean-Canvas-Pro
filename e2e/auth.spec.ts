import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from './helpers/mocks';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
  });

  test('shows the login page when unauthenticated', async ({ page }) => {
    await page.goto('/');

    // Login form should be visible
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('user can log in and reach the workspace', async ({ page }) => {
    await page.goto('/');

    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'test-password-123');
    await page.click('button[type="submit"]');

    // After login the splash landing page appears
    await expect(page.locator('button:has-text("Empezar gratis")').first()).toBeVisible({
      timeout: 10_000,
    });

    // Dismiss the splash and enter the workspace
    await page.locator('button:has-text("Empezar gratis")').first().click();

    // Canvas toolbar must be present
    await expect(page.locator('[aria-label="Seleccionar lienzo"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('shows an error message on invalid credentials', async ({ page }) => {
    // Override the token endpoint to return a 400 error for this test only
    await page.route('**/auth/v1/token*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
      });
    });

    await page.goto('/');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrong-password');
    await page.click('button[type="submit"]');

    // An error banner must appear
    await expect(page.locator('text=Invalid login credentials')).toBeVisible({ timeout: 5_000 });
  });
});
