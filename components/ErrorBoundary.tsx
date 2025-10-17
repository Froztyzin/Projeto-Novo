// FIX: The `import * as React` syntax was causing a type resolution issue with `this.props` in the class component, likely due to project-wide tsconfig settings (`esModuleInterop: true`). Changed to the consistent `import React` syntax used across the project.
import React from 'react';
import { Button } from './ui/Button';
import { AlertTriangleIcon } from './ui/Icons';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  public state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 text-center p-4">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-xl shadow-2xl max-w-lg">
                <AlertTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Ops! Algo deu errado.</h1>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                    Lamentamos pelo inconveniente. Nossa equipe foi notificada sobre o problema.
                    Tente recarregar a página para continuar.
                </p>
                <Button onClick={this.handleReload} className="mt-8">
                    Recarregar Página
                </Button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
