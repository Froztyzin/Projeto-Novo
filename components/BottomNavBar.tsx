import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import type { ViewType } from '../types';
import { Permission } from '../types';
import { DashboardIcon, UsersIcon, CreditCardIcon, CalendarIcon } from './ui/Icons';
import { useAppContext } from '../contexts/AppContext';

const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
}> = ({ to, icon, label }) => (
  <RouterNavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center h-full text-xs transition-colors duration-200 focus:outline-none ${
        isActive
          ? 'text-primary-400'
          : 'text-slate-400 hover:text-primary-300'
      }`
    }
  >
    {icon}
    <span className="mt-1 font-semibold">{label}</span>
  </RouterNavLink>
);

export const BottomNavBar: React.FC = () => {
  const { hasPermission } = useAppContext();
  
  const navItems = [
    { to: '/dashboard', label: 'Painel', icon: <DashboardIcon className="h-6 w-6" />, permissions: [Permission.VIEW_DASHBOARD] },
    { to: '/members', label: 'Alunos', icon: <UsersIcon className="h-6 w-6" />, permissions: [Permission.VIEW_MEMBERS] },
    { to: '/payments', label: 'Pagamentos', icon: <CreditCardIcon className="h-6 w-6" />, permissions: [Permission.VIEW_PAYMENTS] },
    { to: '/calendar', label: 'Calendário', icon: <CalendarIcon className="h-6 w-6" />, permissions: [Permission.VIEW_CALENDAR] },
  ];

  const visibleItems = navItems.filter(item => item.permissions.some(p => hasPermission(p)));

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 shadow-lg md:hidden z-30">
      <div className={`grid h-full`} style={{ gridTemplateColumns: `repeat(${visibleItems.length}, 1fr)`}}>
        {visibleItems.map(item => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div>
    </nav>
  );
};
