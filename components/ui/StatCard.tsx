import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
      <div className={`rounded-full p-3 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
};