
import React, { useState, useEffect, createContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSettings } from '../../contexts/SettingsContext';

import { Sidebar } from '../Sidebar';
import { BottomNavBar } from '../BottomNavBar';
import { AIAssistant } from '../AIAssistant';
import { CommandPalette } from '../CommandPalette';
import { MemberDetailsModal } from '../MemberDetailsModal';
import { NotificationsPanel } from '../NotificationsPanel';
import { MenuIcon, BellIcon } from '../ui/Icons';
import type { Member } from '../../types';

interface LayoutContextType {
  openMemberDetails: (member: Member) => void;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

const pathTitleMap: Record<string, string> = {
    '/dashboard': 'Painel',
    '/members': 'Gerenciamento de Alunos',
    '/plans': 'Planos de Matrícula',
    '/payments': 'Controle de Pagamentos',
    '/expenses': 'Despesas',
    '/announcements': 'Comunicados',
    '/users': 'Gerenciamento de Usuários',
    '/reports': 'Relatórios de Pagamentos',
    '/calendar': 'Calendário de Pagamentos',
    '/settings': 'Configurações',
    '/audit-log': 'Registro de Atividades',
};

export const Layout: React.FC = () => {
    const { plans, payments, isLoading, getSystemNotifications } = useAppContext();
    const { addNotification, unreadCount } = useNotifications();
    const { billingRulerSettings } = useSettings();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isMemberDetailsModalOpen, setMemberDetailsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [notificationsGenerated, setNotificationsGenerated] = useState(false);

    useEffect(() => {
        if (!isLoading && !notificationsGenerated && getSystemNotifications) {
            const systemNotifications = getSystemNotifications(billingRulerSettings);
            systemNotifications.forEach(n => addNotification(n.title, n.message));
            setNotificationsGenerated(true);
        }
    }, [isLoading, notificationsGenerated, getSystemNotifications, billingRulerSettings, addNotification]);


    const openMemberDetails = (member: Member) => {
        setSelectedMember(member);
        setMemberDetailsModalOpen(true);
    };

    const closeMemberDetails = () => {
        setMemberDetailsModalOpen(false);
        setSelectedMember(null);
    };

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

    const selectedMemberPlan = selectedMember ? plans.find(p => p.id === selectedMember.planId) : null;
    const selectedMemberPayments = selectedMember ? payments.filter(p => p.memberId === selectedMember.id) : [];
    
    const currentTitle = pathTitleMap[location.pathname] || 'Painel';

    return (
        <LayoutContext.Provider value={{ openMemberDetails }}>
            <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 shadow-md flex-shrink-0">
                        <div className="flex items-center">
                            <button onClick={() => setSidebarOpen(true)} className="text-slate-400 lg:hidden mr-4">
                                <MenuIcon className="h-6 w-6" />
                            </button>
                            <h1 className="text-xl font-bold text-slate-100">{currentTitle}</h1>
                        </div>
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
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8 bg-slate-950/70">
                        <div key={location.pathname} className="animate-fadeIn">
                           <Outlet />
                        </div>
                    </div>
                </main>
                <AIAssistant />
                <CommandPalette 
                    isOpen={isCommandPaletteOpen} 
                    onClose={() => setIsCommandPaletteOpen(false)}
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
                <BottomNavBar />
            </div>
        </LayoutContext.Provider>
    );
};