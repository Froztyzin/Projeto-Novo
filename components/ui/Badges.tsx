

import React from 'react';
import { MemberStatus, PaymentStatus, ExpenseStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className }) => (
  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${className}`}>
    {children}
  </span>
);

export const MemberStatusBadge: React.FC<{ status: MemberStatus }> = ({ status }) => {
  const statusClasses = {
    [MemberStatus.Active]: 'bg-primary-100 text-primary-800 dark:bg-primary-500/10 dark:text-primary-400',
    [MemberStatus.Inactive]: 'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400',
    [MemberStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
    [MemberStatus.Archived]: 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
    [MemberStatus.Prospect]: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  };
  return <Badge className={statusClasses[status]}>{status}</Badge>;
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const statusClasses = {
    [PaymentStatus.Paid]: 'bg-primary-100 text-primary-800 dark:bg-primary-500/10 dark:text-primary-400',
    [PaymentStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
    [PaymentStatus.Overdue]: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
  };
  return <Badge className={statusClasses[status]}>{status}</Badge>;
};

export const ExpenseStatusBadge: React.FC<{ status: ExpenseStatus }> = ({ status }) => {
  const statusClasses = {
    [ExpenseStatus.Paid]: 'bg-primary-100 text-primary-800 dark:bg-primary-500/10 dark:text-primary-400',
    [ExpenseStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
    [ExpenseStatus.Overdue]: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
  };
  return <Badge className={statusClasses[status]}>{status}</Badge>;
};