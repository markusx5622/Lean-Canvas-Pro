import { defineConfig, devices } from '@playwright/test';

// Use fixed mock credentials so Supabase SDK initialises without real creds.
// All actual HTTP calls are intercepted in e2e/helpers/mocks.ts.
process.env.VITE_SUPABASE_URL ??= 'https://pwtest.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY ??= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e2e-test-key';

export default defineConfig({
  testDir: './e2e',
  // Run files in parallel inside each worker; workers run serially to keep CI simple.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    // Dev server base URL (set by webServer below).
    baseURL: 'http://localhost:3000',
    // Capture trace on first retry for debugging.
    trace: 'on-first-retry',
    // Wider viewport — the canvas toolbar is hidden on mobile.
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: '3000',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
      // Suppress Sentry and PostHog in tests.
      VITE_SENTRY_DSN: '',
      VITE_POSTHOG_KEY: '',
      DISABLE_HMR: 'true',
    },
  },
});
