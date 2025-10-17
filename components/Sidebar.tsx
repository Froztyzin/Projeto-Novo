
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import type { ViewType } from '../types';
import { Permission } from '../types';
import { DashboardIcon, UsersIcon, PackageIcon, ReceiptIcon, XIcon, BarChartIcon, CalendarIcon, SettingsIcon, CreditCardIcon, LogOutIcon, UserCogIcon, HistoryIcon, DumbbellIcon, MegaphoneIcon } from './ui/Icons';
import { useAppContext } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isLogout?: boolean;
}> = ({ to, icon, label, onClick, isLogout = false }) => (
  <RouterNavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-lg rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg'
          : isLogout
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="ml-4">{label}</span>
  </RouterNavLink>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { hasPermission, logout } = useAppContext();
  const { logo } = useSettings();
  
  const handleNavigation = () => {
    setIsOpen(false);
  };
  
  const navItems = [
    { to: '/dashboard', label: 'Painel', icon: <DashboardIcon className="h-6 w-6" />, permissions: [Permission.VIEW_DASHBOARD] },
    { to: '/members', label: 'Alunos', icon: <UsersIcon className="h-6 w-6" />, permissions: [Permission.VIEW_MEMBERS] },
    { to: '/plans', label: 'Planos', icon: <PackageIcon className="h-6 w-6" />, permissions: [Permission.VIEW_PLANS] },
    { to: '/payments', label: 'Pagamentos', icon: <CreditCardIcon className="h-6 w-6" />, permissions: [Permission.VIEW_PAYMENTS] },
    { to: '/expenses', label: 'Despesas', icon: <ReceiptIcon className="h-6 w-6" />, permissions: [Permission.VIEW_EXPENSES] },
    { to: '/announcements', label: 'Comunicados', icon: <MegaphoneIcon className="h-6 w-6" />, permissions: [Permission.VIEW_ANNOUNCEMENTS] },
    { to: '/reports', label: 'Relatórios', icon: <BarChartIcon className="h-6 w-6" />, permissions: [Permission.VIEW_REPORTS] },
    { to: '/calendar', label: 'Calendário', icon: <CalendarIcon className="h-6 w-6" />, permissions: [Permission.VIEW_CALENDAR] },
    { to: '/users', label: 'Usuários', icon: <UserCogIcon className="h-6 w-6" />, permissions: [Permission.VIEW_USERS] },
    { to: '/audit-log', label: 'Registro de Atividades', icon: <HistoryIcon className="h-6 w-6" />, permissions: [Permission.VIEW_AUDIT_LOG] },
    { to: '/settings', label: 'Configurações', icon: <SettingsIcon className="h-6 w-6" />, permissions: [Permission.MANAGE_SETTINGS, Permission.MANAGE_ROLES] },
  ];
    
  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-900 w-64 border-r border-slate-800 p-5 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-72 flex flex-col`}
      >
        <div>
          <div className="flex justify-between items-center mb-10 h-12">
            {logo ? (
              <img src={logo} alt="Logo" className="max-h-12 w-auto" />
            ) : (
              <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                      <DumbbellIcon className="h-7 w-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                      Elitte Corpus
                  </h1>
              </div>
            )}
            <button className="lg:hidden text-slate-400" onClick={() => setIsOpen(false)}>
              <XIcon className="w-6 h-6"/>
            </button>
          </div>
          <nav className="space-y-4">
            {navItems
              .filter(item => item.permissions.some(p => hasPermission(p)))
              .map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  onClick={handleNavigation}
                />
              ))}
          </nav>
        </div>
        <div className="mt-auto">
           <NavLink
              to="/login"
              icon={<LogOutIcon className="h-6 w-6" />}
              label="Sair"
              isLogout={true}
              onClick={logout}
            />
        </div>
      </aside>
    </>
  );
};