import type { Page, Route } from '@playwright/test';

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  app_metadata: { provider: 'email' },
  user_metadata: {},
};

export const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_USER,
};

export const MOCK_CANVAS_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

export const MOCK_CANVAS = {
  id: MOCK_CANVAS_ID,
  user_id: MOCK_USER.id,
  name: 'Mi Primer Canvas',
  data: {},
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const MOCK_SHARE_TOKEN = 'bbbbbbbb-1111-1111-1111-000000000001';

export const MOCK_SHARE = {
  id: 'cccccccc-0000-0000-0000-000000000001',
  canvas_id: MOCK_CANVAS_ID,
  token: MOCK_SHARE_TOKEN,
  created_at: '2024-01-01T00:00:00.000Z',
};

// ── Route helpers ─────────────────────────────────────────────────────────────

/**
 * Intercepts all Supabase API calls so no real network traffic is generated.
 * Call this in beforeEach for every test that needs the app to function.
 */
export async function setupSupabaseMocks(page: Page): Promise<void> {
  // ── Auth endpoints ──────────────────────────────────────────────────────────

  // Login with password  →  return mock session
  await page.route('**/auth/v1/token*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION),
    });
  });

  // Session refresh / validate
  await page.route('**/auth/v1/session*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SESSION),
    });
  });

  // Current user info
  await page.route('**/auth/v1/user*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_USER),
    });
  });

  // ── Canvases table ──────────────────────────────────────────────────────────

  await page.route('**/rest/v1/canvases*', async (route: Route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([MOCK_CANVAS]),
      });
      return;
    }

    if (method === 'POST') {
      // createCanvas — parse body to use provided id/name
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
      } catch {
        /* ignore */
      }
      const newCanvas = {
        ...MOCK_CANVAS,
        id: (body.id as string | undefined) ?? crypto.randomUUID(),
        name: (body.name as string | undefined) ?? 'Lienzo 1',
        data: (body.data as Record<string, string> | undefined) ?? {},
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newCanvas),
      });
      return;
    }

    // PATCH / DELETE — acknowledge silently
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // ── Canvas shares table ─────────────────────────────────────────────────────

  await page.route('**/rest/v1/canvas_shares*', async (route: Route) => {
    const method = route.request().method();

    if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SHARE),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      return;
    }

    // GET — no active share by default; override per-test if needed
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // ── Canvas snapshots table ──────────────────────────────────────────────────

  await page.route('**/rest/v1/canvas_snapshots*', async (route: Route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '{}' });
  });
}

// ── App navigation helpers ────────────────────────────────────────────────────

/**
 * Navigates to the app, performs the login flow and dismisses the splash screen.
 * After this call the full workspace is visible.
 */
export async function loginAndEnterWorkspace(page: Page): Promise<void> {
  await page.goto('/');

  // Fill in the login form
  await page.fill('#email', MOCK_USER.email);
  await page.fill('#password', 'test-password-123');
  await page.click('button[type="submit"]');

  // Wait for the workspace + splash screen
  await page.waitForSelector('button:has-text("Empezar gratis")', { timeout: 10_000 });
  await page.click('button:has-text("Empezar gratis")');

  // Wait for the canvas grid to be visible
  await page.waitForSelector('[aria-label="Seleccionar lienzo"]', { timeout: 10_000 });
}
