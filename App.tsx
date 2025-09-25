import React, { useState, useEffect } from 'react';
import type { ViewType } from './types';
import { Permission } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MembersList } from './components/MembersList';
import { PlansList } from './components/PlansList';
import { PaymentsList } from './components/PaymentsList';
import { ExpensesList } from './components/ExpensesList';
import { Reports } from './components/Reports';
import { CalendarView } from './components/CalendarView';
import { Settings } from './components/Settings';
import { MenuIcon } from './components/ui/Icons';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/Toast';
import { LoginPage } from './components/LoginPage';
import { AIAssistant } from './components/AIAssistant';
import ErrorBoundary from './components/ErrorBoundary';

const MainApplication: React.FC = () => {
  const [view, setView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { hasPermission, currentUserRole } = useAppContext();

  useEffect(() => {
    const viewPermissionMap: Record<ViewType, Permission | Permission[]> = {
      dashboard: Permission.VIEW_DASHBOARD,
      members: Permission.VIEW_MEMBERS,
      plans: Permission.VIEW_PLANS,
      payments: Permission.VIEW_PAYMENTS,
      expenses: Permission.VIEW_EXPENSES,
      reports: Permission.VIEW_REPORTS,
      calendar: Permission.VIEW_CALENDAR,
      settings: [Permission.MANAGE_SETTINGS, Permission.MANAGE_ROLES],
    };

    const requiredPermission = viewPermissionMap[view];
    let isAuthorized = false;

    if (Array.isArray(requiredPermission)) {
        isAuthorized = requiredPermission.some(p => hasPermission(p));
    } else if (requiredPermission) {
        isAuthorized = hasPermission(requiredPermission);
    }

    if (!isAuthorized) {
        const availableViews: ViewType[] = [
            'dashboard', 'members', 'plans', 'payments', 'expenses', 'reports', 'calendar', 'settings'
        ];
        
        const fallbackView = availableViews.find(v => {
            const perm = viewPermissionMap[v];
            if (Array.isArray(perm)) {
                return perm.some(p => hasPermission(p));
            }
            return hasPermission(perm);
        });

        if (fallbackView && fallbackView !== view) {
            setView(fallbackView);
        }
    }
  }, [view, currentUserRole, hasPermission, setView]);


  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'members': return <MembersList />;
      case 'plans': return <PlansList />;
      case 'payments': return <PaymentsList />;
      case 'expenses': return <ExpensesList />;
      case 'reports': return <Reports />;
      case 'calendar': return <CalendarView />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const viewTitles: { [key in ViewType]: string } = {
    dashboard: 'Painel',
    members: 'Gerenciamento de Alunos',
    plans: 'Planos de Matrícula',
    payments: 'Controle de Pagamentos',
    expenses: 'Gerenciamento de Despesas',
    reports: 'Relatórios de Pagamentos',
    calendar: 'Calendário de Pagamentos',
    settings: 'Configurações do Sistema',
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
      <Sidebar
        currentView={view}
        setView={setView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <button
            className="text-gray-500 focus:outline-none lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold">{viewTitles[view]}</h1>
          <div className="w-6"></div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <div key={view} className="animate-fadeIn">
            {renderView()}
          </div>
        </main>
      </div>
      <AIAssistant />
      <ToastContainer />
    </div>
  );
};


const AuthResolver: React.FC = () => {
    const { isAuthenticated, isAuthLoading } = useAppContext();

    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100 dark:bg-slate-900">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <>
                <LoginPage />
                <ToastContainer />
            </>
        );
    }
    
    return <MainApplication />;
};


const App: React.FC = () => {
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AuthResolver />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;