import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Member, Plan, ViewType } from '../types';
import { Permission } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { 
    SearchIcon, 
    DashboardIcon, 
    UsersIcon, 
    PackageIcon, 
    CreditCardIcon, 
    ReceiptIcon, 
    BarChartIcon, 
    CalendarIcon, 
    SettingsIcon 
} from './ui/Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: ViewType) => void;
  openMemberDetails: (member: Member) => void;
}

type SearchableItem = {
    id: string;
    type: 'action' | 'member' | 'plan';
    title: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    original: any;
};

const viewIcons: Record<ViewType, React.ReactNode> = {
    dashboard: <DashboardIcon className="h-5 w-5" />,
    members: <UsersIcon className="h-5 w-5" />,
    plans: <PackageIcon className="h-5 w-5" />,
    payments: <CreditCardIcon className="h-5 w-5" />,
    expenses: <ReceiptIcon className="h-5 w-5" />,
    reports: <BarChartIcon className="h-5 w-5" />,
    calendar: <CalendarIcon className="h-5 w-5" />,
    settings: <SettingsIcon className="h-5 w-5" />,
};

const viewTitles: Record<ViewType, string> = {
    dashboard: 'Painel',
    members: 'Alunos',
    plans: 'Planos',
    payments: 'Pagamentos',
    expenses: 'Despesas',
    reports: 'Relatórios',
    calendar: 'Calendário',
    settings: 'Configurações',
};

const navItems = [
    { view: 'dashboard', label: 'Ir para o Painel', permissions: [Permission.VIEW_DASHBOARD] },
    { view: 'members', label: 'Ir para Alunos', permissions: [Permission.VIEW_MEMBERS] },
    { view: 'plans', label: 'Ir para Planos', permissions: [Permission.VIEW_PLANS] },
    { view: 'payments', label: 'Ir para Pagamentos', permissions: [Permission.VIEW_PAYMENTS] },
    { view: 'expenses', label: 'Ir para Despesas', permissions: [Permission.VIEW_EXPENSES] },
    { view: 'reports', label: 'Ir para Relatórios', permissions: [Permission.VIEW_REPORTS] },
    { view: 'calendar', label: 'Ir para Calendário', permissions: [Permission.VIEW_CALENDAR] },
    { view: 'settings', label: 'Ir para Configurações', permissions: [Permission.MANAGE_SETTINGS, Permission.MANAGE_ROLES] },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setView, openMemberDetails }) => {
    const { members, plans, hasPermission } = useAppContext();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            const timer = setTimeout(() => setIsMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const searchableItems = useMemo<SearchableItem[]>(() => {
        const actions: SearchableItem[] = navItems
            .filter(item => item.permissions.some(p => hasPermission(p)))
            .map(item => ({
                id: `action-${item.view}`,
                type: 'action',
                title: item.label,
                description: `Navegar para a tela de ${viewTitles[item.view as ViewType]}`,
                icon: viewIcons[item.view as ViewType],
                action: () => setView(item.view as ViewType),
                original: item,
            }));
        
        const memberItems: SearchableItem[] = members.map(member => ({
            id: `member-${member.id}`,
            type: 'member',
            title: member.name,
            description: member.email,
            icon: <UsersIcon className="h-5 w-5" />,
            action: () => openMemberDetails(member),
            original: member,
        }));

        const planItems: SearchableItem[] = plans.map(plan => ({
            id: `plan-${plan.id}`,
            type: 'plan',
            title: plan.name,
            description: `Plano de ${plan.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`,
            icon: <PackageIcon className="h-5 w-5" />,
            action: () => setView('plans'),
            original: plan,
        }));
        
        return [...actions, ...memberItems, ...planItems];
    }, [members, plans, hasPermission, setView, openMemberDetails]);

    const filteredResults = useMemo(() => {
        if (!query) return [];
        const lowerCaseQuery = query.toLowerCase();
        return searchableItems.filter(item => 
            item.title.toLowerCase().includes(lowerCaseQuery) ||
            item.description?.toLowerCase().includes(lowerCaseQuery)
        );
    }, [query, searchableItems]);

    const groupedResults = useMemo(() => {
        return filteredResults.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = [];
            }
            acc[item.type].push(item);
            return acc;
        }, {} as Record<string, SearchableItem[]>);
    }, [filteredResults]);
    
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filteredResults.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + (filteredResults.length || 1)) % (filteredResults.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredResults[selectedIndex]) {
                    filteredResults[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredResults, selectedIndex, onClose]);
    
    useEffect(() => {
        const selectedElement = resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        selectedElement?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!isMounted) return null;

    const groupTitles: Record<string, string> = {
        action: 'Ações',
        member: 'Alunos',
        plan: 'Planos',
    };
    const groupOrder: (keyof typeof groupTitles)[] = ['action', 'member', 'plan'];

    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-center items-start pt-20 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div
                className={`relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-lg shadow-2xl overflow-hidden transform transition-all duration-300 ease-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <SearchIcon className="h-5 w-5 text-slate-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar por alunos, planos ou ações..."
                        className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                </div>
                <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
                    {filteredResults.length > 0 ? (
                        // Fix: Replaced Object.entries with a direct mapping over `groupOrder`
                        // to ensure type safety and correct ordering, resolving the "map is not a function" error.
                        groupOrder.map(group => {
                            const items = groupedResults[group];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={group}>
                                    <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{groupTitles[group]}</h3>
                                    <ul>
                                        {items.map((item) => {
                                            const globalIndex = filteredResults.findIndex(fr => fr.id === item.id);
                                            return (
                                                <li
                                                    key={item.id}
                                                    data-index={globalIndex}
                                                    onMouseMove={() => setSelectedIndex(globalIndex)}
                                                    onClick={() => {
                                                        item.action();
                                                        onClose();
                                                    }}
                                                    className={`flex items-center px-4 py-3 cursor-pointer ${
                                                        selectedIndex === globalIndex ? 'bg-primary-500 text-white' : 'text-slate-700 dark:text-slate-200'
                                                    }`}
                                                >
                                                    <span className={`mr-4 ${selectedIndex === globalIndex ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
                                                    <div>
                                                        <p className={`font-medium ${selectedIndex === globalIndex ? 'text-white' : ''}`}>{item.title}</p>
                                                        {item.description && <p className={`text-sm ${selectedIndex === globalIndex ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>{item.description}</p>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })
                    ) : (
                        query && (
                            <p className="p-10 text-center text-slate-500">Nenhum resultado encontrado.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};