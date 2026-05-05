import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-5xl">⚠️</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Algo salió mal
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Se produjo un error inesperado. Puedes intentar recargar la página; tus datos guardados en el navegador no se perderán.
            </p>
          </div>
          {this.state.error && (
            <pre className="text-left text-xs bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-lg p-4 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
