import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';
import { AlertTriangleIcon } from './ui/Icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
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
