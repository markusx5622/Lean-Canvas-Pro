import React, { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { SharedCanvasView } from './components/SharedCanvasView';
import { WorkspacePage } from './pages/WorkspacePage';
import { LegalPage } from './pages/LegalPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiesPage } from './pages/CookiesPage';
import { useLocalStorage } from './hooks/useLocalStorage';

// Minimal client-side routing: detect /share/:token paths.
function getShareToken(): string | null {
  const match = window.location.pathname.match(
    /^\/share\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
  );
  return match ? match[1] : null;
}

function getLegalRoute(): 'legal' | 'privacy' | 'cookies' | null {
  const path = window.location.pathname;
  if (path === '/legal') return 'legal';
  if (path === '/privacy') return 'privacy';
  if (path === '/cookies') return 'cookies';
  return null;
}

// ── App ───────────────────────────────────────────────────────────────────────

const App = () => {
  const { user, loading, session, isSupabaseConfigured } = useAuth();
  const [theme] = useLocalStorage<'light' | 'dark'>('lean-canvas-pro-theme', 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const shareToken = getShareToken();
  if (shareToken) {
    return <SharedCanvasView token={shareToken} />;
  }

  const legalRoute = getLegalRoute();
  if (legalRoute === 'legal') return <LegalPage />;
  if (legalRoute === 'privacy') return <PrivacyPage />;
  if (legalRoute === 'cookies') return <CookiesPage />;

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-5xl">⚙️</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Configuración incompleta
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Las variables de entorno de Supabase no están definidas. Para habilitar la autenticación
              y la sincronización en la nube, crea un archivo{' '}
              <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code>{' '}
              con los valores:
            </p>
          </div>
          <pre className="text-left text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg p-4 overflow-auto">
            {`VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co\nVITE_SUPABASE_ANON_KEY=<tu-anon-key>`}
          </pre>
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            Consulta el archivo <code className="font-mono">.env.example</code> del repositorio para más detalles.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-950 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!user || !session) {
    return <AuthPage theme={theme} />;
  }

  return <WorkspacePage />;
};

export default App;
