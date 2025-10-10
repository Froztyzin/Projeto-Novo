import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { ToastContainer } from './components/ui/Toast';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MembersList } from './components/MembersList';
import { MemberDetailsModal } from './components/MemberDetailsModal';
import { PlansList } from './components/PlansList';
import { PaymentsList } from './components/PaymentsList';
import { ExpensesList } from './components/ExpensesList';
import { Reports } from './components/Reports';
import { CalendarView } from './components/CalendarView';
import { Settings } from './components/Settings';
import { UsersList } from './components/UsersList';
import { AuditLogList } from './components/AuditLogList';
import { AIAssistant } from './components/AIAssistant';
import { CommandPalette } from './components/CommandPalette';
import { BottomNavBar } from './components/BottomNavBar';
import ErrorBoundary from './components/ErrorBoundary';
import { MenuIcon, BellIcon } from './components/ui/Icons';
import type { ViewType, Member, Plan, Payment, AuthView } from './types';
import { CombinedLoginPage } from './components/CombinedLoginPage';
import { RequestPasswordResetPage } from './components/RequestPasswordResetPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { MemberPortal } from './components/MemberPortal';
import { NotificationsPanel } from './components/NotificationsPanel';

const viewTitles: Record<ViewType, string> = {
    dashboard: 'Painel',
    members: 'Gerenciamento de Alunos',
    plans: 'Planos de Matrícula',
    payments: 'Controle de Pagamentos',
    expenses: 'Despesas',
    users: 'Gerenciamento de Usuários',
    reports: 'Relatórios de Pagamentos',
    calendar: 'Calendário de Pagamentos',
    settings: 'Configurações',
    'audit-log': 'Registro de Atividades',
};

const AppContent: React.FC = () => {
    const { isAuthenticated, isAuthenticatedMember, isAuthLoading, members, plans, payments } = useAppContext();
    const { unreadCount } = useNotifications();
    const [view, setView] = useState<ViewType>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    // Auth view state for member login/reset flow
    const [authView, setAuthView] = useState<AuthView>('combinedLogin');
    const [resetToken, setResetToken] = useState<string | null>(null);

    const [isMemberDetailsModalOpen, setMemberDetailsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(isOpen => !isOpen);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    
    const openMemberDetails = (member: Member) => {
        setSelectedMember(member);
        setMemberDetailsModalOpen(true);
    };

    const closeMemberDetails = () => {
        setMemberDetailsModalOpen(false);
        setSelectedMember(null);
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard': return <Dashboard />;
            case 'members': return <MembersList openMemberDetails={openMemberDetails} />;
            case 'plans': return <PlansList />;
            case 'payments': return <PaymentsList />;
            case 'expenses': return <ExpensesList />;
            case 'reports': return <Reports />;
            case 'calendar': return <CalendarView />;
            case 'settings': return <Settings />;
            case 'users': return <UsersList />;
            case 'audit-log': return <AuditLogList />;
            default: return <Dashboard />;
        }
    };
    
    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (isAuthenticatedMember) {
        return <MemberPortal />;
    }

    if (!isAuthenticated) {
        switch(authView) {
            case 'requestReset':
                return <RequestPasswordResetPage setAuthView={setAuthView} setResetToken={setResetToken} />;
            case 'resetPassword':
                return <ResetPasswordPage setAuthView={setAuthView} token={resetToken} />;
            case 'combinedLogin':
            default:
                return <CombinedLoginPage setAuthView={setAuthView} />;
        }
    }

    const selectedMemberPlan = selectedMember ? plans.find(p => p.id === selectedMember.planId) : null;
    const selectedMemberPayments = selectedMember ? payments.filter(p => p.memberId === selectedMember.id) : [];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar currentView={view} setView={setView} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 shadow-md flex-shrink-0">
                    {/* Left side */}
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="text-slate-400 lg:hidden mr-4">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-100">{viewTitles[view]}</h1>
                    </div>

                    {/* Right side: Notifications */}
                    <div className="relative">
                        <button onClick={() => setIsNotificationsOpen(true)} className="text-slate-400 relative hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800">
                            <BellIcon className="h-6 w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-slate-900">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/70">
                    {renderView()}
                </div>
            </main>
            <AIAssistant />
            <CommandPalette 
                isOpen={isCommandPaletteOpen} 
                onClose={() => setIsCommandPaletteOpen(false)} 
                setView={setView}
                openMemberDetails={(member) => {
                    openMemberDetails(member);
                    setIsCommandPaletteOpen(false);
                }}
            />
            {selectedMember && (
                <MemberDetailsModal
                    isOpen={isMemberDetailsModalOpen}
                    onClose={closeMemberDetails}
                    member={selectedMember}
                    plan={selectedMemberPlan}
                    payments={selectedMemberPayments}
                    plans={plans}
                />
            )}
            <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
            <BottomNavBar currentView={view} setView={setView} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AppProvider>
                    <NotificationProvider>
                        <AppContent />
                        <ToastContainer />
                    </NotificationProvider>
                </AppProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
};

export default App;