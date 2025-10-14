import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useExpenses } from '../hooks/useExpenses';
import type { Expense } from '../types';
import { Permission } from '../types';
import { Button } from './ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon, ReceiptIcon, CheckCircleIcon, DollarSignIcon } from './ui/Icons';
import { ExpenseFormModal } from './ExpenseFormModal';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { ExpenseStatusBadge } from './ui/Badges';
import { Skeleton } from './ui/Skeleton';
import { Pagination } from './ui/Pagination';
import { Card, CardContent } from './ui/Card';

const ExpensesListSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <Card>
            <CardContent className="p-4">
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
    </div>
);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg flex items-start">
    <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

export const ExpensesList: React.FC = () => {
  const { addExpense, updateExpense, deleteExpense, hasPermission, expenses: allExpenses } = useAppContext();
  
  const {
    isLoading,
    expenses: currentExpenses,
    filteredExpenses,
    filters,
    pagination,
    financialSummary,
    handleFilterChange,
    handlePageChange,
    clearFilters,
  } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const handleAddNew = () => { setEditingExpense(null); setIsModalOpen(true); };
  const handleEdit = (expense: Expense) => { setEditingExpense(expense); setIsModalOpen(true); };
  const handleDeleteRequest = (id: string) => { setExpenseToDelete(id); setIsConfirmModalOpen(true); };
  const handleConfirmDelete = () => {
    if (expenseToDelete) deleteExpense(expenseToDelete);
    setIsConfirmModalOpen(false);
    setExpenseToDelete(null);
  };

  const statCards = useMemo(() => ([
    { title: "Despesas Pagas", value: financialSummary.paidAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <CheckCircleIcon className="w-6 h-6"/> },
    { title: "Despesas Pendentes", value: financialSummary.pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <ReceiptIcon className="w-6 h-6"/> },
    { title: "Total em Despesas", value: financialSummary.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <DollarSignIcon className="w-6 h-6"/> }
  ]), [financialSummary]);

  if (isLoading) return <ExpensesListSkeleton />;

  return (
    <div className="space-y-6">
      {hasPermission(Permission.CREATE_EXPENSES) && (
          <div className="flex justify-end">
            <Button onClick={handleAddNew}>
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Adicionar Despesa
            </Button>
          </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
            <div key={card.title} className="animate-stagger" style={{ animationDelay: `${index * 100}ms` }}>
                <StatCard {...card} />
            </div>
        ))}
      </div>
      
      <Card>
          <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                      type="text"
                      name="searchTerm"
                      placeholder="Buscar por descrição ou categoria..."
                      value={filters.searchTerm}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 lg:col-span-2"
                  />
                  <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
              </div>
              <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar Filtros</Button>
              </div>
          </CardContent>
      </Card>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
        {/* Table View */}
        <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300">Descrição</th>
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300">Categoria</th>
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300">Valor</th>
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300">Data</th>
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentExpenses.length > 0 ? currentExpenses.map((expense, index) => (
                  <tr 
                    key={expense.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 animate-stagger" 
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{expense.description}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{expense.category}</td>
                    <td className="p-4 font-semibold text-gray-800 dark:text-gray-100">{expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">{expense.status && <ExpenseStatusBadge status={expense.status} />}</td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {hasPermission(Permission.UPDATE_EXPENSES) && <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}><EditIcon className="w-5 h-5" /></Button>}
                          {hasPermission(Permission.DELETE_EXPENSES) && <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(expense.id)}><TrashIcon className="w-5 h-5" /></Button>}
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500 dark:text-gray-400">
                      {allExpenses.length === 0 ? 'Nenhuma despesa registrada ainda.' : 'Nenhuma despesa encontrada com os filtros aplicados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
            {currentExpenses.length > 0 ? (
                currentExpenses.map((expense, index) => (
                    <div 
                        key={expense.id} 
                        className="bg-slate-50 dark:bg-gray-900/40 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 animate-stagger"
                        style={{ animationDelay: `${index * 70}ms` }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">{expense.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category}</p>
                            </div>
                            {expense.status && <ExpenseStatusBadge status={expense.status} />}
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                        <div className="flex justify-between items-center mb-3">
                           <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Valor</p>
                                <p className="font-semibold text-lg text-primary-600 dark:text-primary-400">{expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           </div>
                           <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-right">Data</p>
                                <p className="font-medium text-gray-700 dark:text-gray-200 text-sm text-right">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-end space-x-1">
                          {hasPermission(Permission.UPDATE_EXPENSES) && <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}><EditIcon className="w-5 h-5" /></Button>}
                          {hasPermission(Permission.DELETE_EXPENSES) && <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(expense.id)}><TrashIcon className="w-5 h-5" /></Button>}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  {allExpenses.length === 0 ? 'Nenhuma despesa registrada ainda.' : 'Nenhuma despesa encontrada com os filtros aplicados.'}
                </div>
            )}
        </div>
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredExpenses.length}
          itemsPerPage={pagination.ITEMS_PER_PAGE}
        />
      </div>
      
      {isModalOpen && <ExpenseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} addExpense={addExpense} updateExpense={updateExpense} expense={editingExpense} />}
      {isConfirmModalOpen && <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" message="Você tem certeza que deseja excluir este registro de despesa? Esta ação não pode ser desfeita." />}
    </div>
  );
};