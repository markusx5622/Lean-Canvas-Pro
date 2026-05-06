import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { initSentry } from './lib/sentry.ts';
import { initAnalytics } from './lib/analytics.ts';
import './index.css';

// Must be called before the first React render so that errors caught by
// ErrorBoundary or unhandled promise rejections are reported from the start.
initSentry();
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
