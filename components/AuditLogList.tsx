import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { LogActionType } from '../types';
import { Skeleton } from './ui/Skeleton';
import { Pagination } from './ui/Pagination';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { 
    PlusCircleIcon, 
    EditIcon, 
    TrashIcon, 
    LogOutIcon, 
    SettingsIcon
} from './ui/Icons';

const AuditLogSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
        </div>
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const actionIcons: Record<LogActionType, React.ReactNode> = {
    [LogActionType.USER_LOGIN]: <LogOutIcon className="h-5 w-5 text-green-500 rotate-180" />,
    [LogActionType.USER_LOGOUT]: <LogOutIcon className="h-5 w-5 text-red-500" />,
    [LogActionType.CREATE_MEMBER]: <PlusCircleIcon className="h-5 w-5 text-primary-500" />,
    [LogActionType.UPDATE_MEMBER]: <EditIcon className="h-5 w-5 text-blue-500" />,
    [LogActionType.DELETE_MEMBER]: <TrashIcon className="h-5 w-5 text-red-500" />,
    [LogActionType.CREATE_PLAN]: <PlusCircleIcon className="h-5 w-5 text-primary-500" />,
    [LogActionType.UPDATE_PLAN]: <EditIcon className="h-5 w-5 text-blue-500" />,
    [LogActionType.DELETE_PLAN]: <TrashIcon className="h-5 w-5 text-red-500" />,
    [LogActionType.CREATE_PAYMENT]: <PlusCircleIcon className="h-5 w-5 text-primary-500" />,
    [LogActionType.UPDATE_PAYMENT]: <EditIcon className="h-5 w-5 text-blue-500" />,
    [LogActionType.DELETE_PAYMENT]: <TrashIcon className="h-5 w-5 text-red-500" />,
    [LogActionType.CREATE_EXPENSE]: <PlusCircleIcon className="h-5 w-5 text-primary-500" />,
    [LogActionType.UPDATE_EXPENSE]: <EditIcon className="h-5 w-5 text-blue-500" />,
    [LogActionType.DELETE_EXPENSE]: <TrashIcon className="h-5 w-5 text-red-500" />,
    [LogActionType.CREATE_USER]: <PlusCircleIcon className="h-5 w-5 text-primary-500" />,
    [LogActionType.UPDATE_USER]: <EditIcon className="h-5 w-5 text-blue-500" />,
    [LogActionType.DELETE_USER]: <TrashIcon className="h-5 w-5 text-red-500" />,
    [LogActionType.CREATE_ROLE]: <PlusCircleIcon className="h-5 w-5 text-primary-500" />,
    [LogActionType.UPDATE_ROLE]: <EditIcon className="h-5 w-5 text-blue-500" />,
    [LogActionType.DELETE_ROLE]: <TrashIcon className="h-5 w-5 text-red-500" />,
    [LogActionType.IMPORT_DATA]: <PlusCircleIcon className="h-5 w-5 text-purple-500" />,
    [LogActionType.UPDATE_SETTINGS]: <SettingsIcon className="h-5 w-5 text-yellow-500" />,
    [LogActionType.CREATE_ANNOUNCEMENT]: <PlusCircleIcon className="h-5 w-5 text-primary-500" />,
    [LogActionType.UPDATE_ANNOUNCEMENT]: <EditIcon className="h-5 w-5 text-blue-500" />,
    [LogActionType.DELETE_ANNOUNCEMENT]: <TrashIcon className="h-5 w-5 text-red-500" />,
};

export const AuditLogList: React.FC = () => {
  const { auditLogs, isLoading, users } = useAppContext();
  const [filters, setFilters] = useState({ userId: 'all', startDate: '', endDate: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({ userId: 'all', startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);

      const userMatch = filters.userId === 'all' || log.userId === filters.userId;
      const startDateMatch = filters.startDate === '' || logDate >= new Date(new Date(filters.startDate).setHours(0,0,0,0));
      const endDateMatch = filters.endDate === '' || logDate <= new Date(new Date(filters.endDate).setHours(0,0,0,0));
      
      return userMatch && startDateMatch && endDateMatch;
    });
  }, [auditLogs, filters]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredLogs.slice(start, end);
  }, [filteredLogs, currentPage]);

  if (isLoading) {
    return <AuditLogSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select name="userId" value={filters.userId} onChange={handleFilterChange} className="md:col-span-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <option value="all">Todos os Usuários</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
            </div>
             <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar Filtros</Button>
            </div>
        </div>

        <div className="flow-root">
            <ul className="-mb-8">
                {currentLogs.length > 0 ? currentLogs.map((log, index) => (
                    <li key={log.id}>
                        <div className="relative pb-8">
                            {index !== currentLogs.length - 1 && (
                                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                            )}
                            <div className="relative flex items-start space-x-3 animate-stagger" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                                        {actionIcons[log.action]}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1 py-1.5">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{log.userName}</span>{' '}
                                        {log.details.toLowerCase()}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(log.timestamp).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                )) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        {auditLogs.length === 0 ? 'Nenhuma atividade registrada ainda.' : 'Nenhuma atividade encontrada com os filtros aplicados.'}
                    </p>
                )}
            </ul>
        </div>
        
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={ITEMS_PER_PAGE}
        />
    </div>
  );
};