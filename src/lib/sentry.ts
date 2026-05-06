import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for the frontend.
 *
 * Call once as early as possible (before React renders).
 * If VITE_SENTRY_DSN is not set the SDK is not loaded and all calls
 * become no-ops, so the app works fine without the variable defined.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Capture 10 % of transactions in production; 100 % elsewhere.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Do not send PII – user email is deliberately omitted; only the
    // anonymous user ID is attached (see AuthContext.tsx).
    sendDefaultPii: false,
  });
}

export { Sentry };
