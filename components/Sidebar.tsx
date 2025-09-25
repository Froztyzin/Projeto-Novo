import React from 'react';
import type { ViewType } from '../types';
import { Permission } from '../types';
import { DashboardIcon, UsersIcon, PackageIcon, ReceiptIcon, XIcon, BarChartIcon, CalendarIcon, SettingsIcon, CreditCardIcon, LogOutIcon } from './ui/Icons';
import { useAppContext } from '../contexts/AppContext';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isLogout?: boolean;
}> = ({ icon, label, isActive, onClick, isLogout = false }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`flex items-center px-4 py-3 text-lg rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary-600 text-white font-semibold shadow-lg'
        : isLogout
        ? 'text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10'
        : 'text-gray-500 hover:bg-primary-100 hover:text-primary-700 dark:text-gray-400 dark:hover:bg-slate-700'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </a>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen }) => {
  const { hasPermission, logout, logo } = useAppContext();
  
  const handleNavigation = (view: ViewType) => {
    setView(view);
    setIsOpen(false);
  };
  
  const navItems = [
    { view: 'dashboard', label: 'Painel', icon: <DashboardIcon className="h-6 w-6" />, permissions: [Permission.VIEW_DASHBOARD] },
    { view: 'members', label: 'Alunos', icon: <UsersIcon className="h-6 w-6" />, permissions: [Permission.VIEW_MEMBERS] },
    { view: 'plans', label: 'Planos', icon: <PackageIcon className="h-6 w-6" />, permissions: [Permission.VIEW_PLANS] },
    { view: 'payments', label: 'Pagamentos', icon: <CreditCardIcon className="h-6 w-6" />, permissions: [Permission.VIEW_PAYMENTS] },
    { view: 'expenses', label: 'Despesas', icon: <ReceiptIcon className="h-6 w-6" />, permissions: [Permission.VIEW_EXPENSES] },
    { view: 'reports', label: 'Relatórios', icon: <BarChartIcon className="h-6 w-6" />, permissions: [Permission.VIEW_REPORTS] },
    { view: 'calendar', label: 'Calendário', icon: <CalendarIcon className="h-6 w-6" />, permissions: [Permission.VIEW_CALENDAR] },
    { view: 'settings', label: 'Configurações', icon: <SettingsIcon className="h-6 w-6" />, permissions: [Permission.MANAGE_SETTINGS, Permission.MANAGE_ROLES] },
  ];
    
  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-800 w-64 border-r border-gray-200 dark:border-slate-700 p-5 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-72 flex flex-col`}
      >
        <div>
          <div className="flex justify-between items-center mb-10 h-12">
            {logo ? (
              <img src={logo} alt="Logo" className="max-h-12 w-auto" />
            ) : (
              <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Ellite Corpus</h1>
            )}
            <button className="lg:hidden text-gray-500 dark:text-gray-400" onClick={() => setIsOpen(false)}>
              <XIcon className="w-6 h-6"/>
            </button>
          </div>
          <nav className="space-y-4">
            {navItems
              .filter(item => item.permissions.some(p => hasPermission(p)))
              .map(item => (
                <NavLink
                  key={item.view}
                  icon={item.icon}
                  label={item.label}
                  isActive={currentView === item.view}
                  onClick={() => handleNavigation(item.view as ViewType)}
                />
              ))}
          </nav>
        </div>
        <div className="mt-auto">
           <NavLink
              icon={<LogOutIcon className="h-6 w-6" />}
              label="Sair"
              isActive={false}
              isLogout={true}
              onClick={logout}
            />
        </div>
      </aside>
    </>
  );
};