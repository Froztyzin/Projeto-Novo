import React, { useState, useMemo } from 'react';
import type { Expense } from '../types';
import { Button } from './ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon, ReceiptIcon, DollarSignIcon, CheckCircleIcon, AlertTriangleIcon } from './ui/Icons';
import { ExpenseFormModal } from './ExpenseFormModal';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { ExpenseStatusBadge } from './ui/Badges';
import { useAppContext } from '../contexts/AppContext';
import { useExpenses } from '../hooks/useExpenses';
import { Permission } from '../types';
import { Skeleton } from './ui/Skeleton';
import { StatCard } from './ui/StatCard';
import { Pagination } from './ui/Pagination';

const ExpensesListSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/4" />
            <div className="flex gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-40" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    </div>
);

export const ExpensesList: React.FC = () => {
  const { addExpense, updateExpense, deleteExpense, hasPermission } = useAppContext();

  const {
      isLoading,
      expenses: currentExpenses,
      filteredExpenses,
      searchTerm,
      pagination,
      financialSummary,
      handleSearchChange,
      handlePageChange,
  } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const statCards = useMemo(() => ([
    {
        title: "Total em Despesas",
        value: financialSummary.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        icon: <DollarSignIcon className="h-6 w-6 text-orange-700 dark:text-orange-300" />,
        colorClass: "bg-orange-100 dark:bg-orange-500/10"
    },
    {
        title: "Total Pago",
        value: financialSummary.paidAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        icon: <CheckCircleIcon className="h-6 w-6 text-primary-700 dark:text-primary-300" />,
        colorClass: "bg-primary-100 dark:bg-primary-500/10"
    },
    {
        title: "Total Pendente",
        value: financialSummary.pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        icon: <AlertTriangleIcon className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />,
        colorClass: "bg-yellow-100 dark:bg-yellow-500/10"
    }
  ]), [financialSummary]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };
  
  const handleDeleteRequest = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete);
    }
    setIsConfirmModalOpen(false);
    setExpenseToDelete(null);
  };

  if (isLoading) {
      return <ExpensesListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-end items-center mb-6 gap-4">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            {hasPermission(Permission.CREATE_EXPENSES) && (
              <Button onClick={handleAddNew} className="flex items-center justify-center">
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Adicionar Despesa
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {statCards.map((card, index) => (
              <div key={card.title} className="animate-stagger" style={{ animationDelay: `${index * 100}ms` }}>
                  <StatCard {...card} />
              </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 uppercase">
                <th className="p-4 font-semibold">Descrição</th>
                <th className="p-4 font-semibold">Categoria</th>
                <th className="p-4 font-semibold">Valor</th>
                <th className="p-4 font-semibold">Data</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentExpenses.length > 0 ? (
                  currentExpenses.map((expense, index) => (
                  <tr 
                    key={expense.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 animate-stagger"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                      <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{expense.description}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{expense.category}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-4">
                      {expense.status && <ExpenseStatusBadge status={expense.status} />}
                      </td>
                      <td className="p-4 text-right">
                      {hasPermission(Permission.UPDATE_EXPENSES) && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                            <EditIcon className="w-5 h-5" />
                        </Button>
                      )}
                      {hasPermission(Permission.DELETE_EXPENSES) && (
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(expense.id)}>
                            <TrashIcon className="w-5 h-5" />
                        </Button>
                      )}
                      </td>
                  </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={6}>
                          <div className="text-center py-16">
                              <ReceiptIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
                                  {filteredExpenses.length === 0 && searchTerm ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa registrada'}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {filteredExpenses.length === 0 && searchTerm ? 'Tente buscar por outro termo.' : 'Adicione sua primeira despesa para começar.'}
                              </p>
                          </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
              {currentExpenses.length > 0 ? (
                  currentExpenses.map((expense, index) => (
                      <div 
                          key={expense.id} 
                          className="bg-slate-50 dark:bg-gray-900/40 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 animate-stagger"
                          style={{ animationDelay: `${index * 50}ms` }}
                      >
                          <div className="flex justify-between items-start">
                              <div className="flex-1 pr-4">
                                  <p className="font-bold text-gray-800 dark:text-gray-100">{expense.description}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category}</p>
                              </div>
                              {expense.status && <ExpenseStatusBadge status={expense.status} />}
                          </div>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">Valor</p>
                                  <p className="font-semibold text-lg text-primary-600 dark:text-primary-400">{expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                              </div>
                              <div>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">Data</p>
                                  <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">{new Date(expense.date).toLocaleDateString('pt-BR')}</p>
                              </div>
                          </div>

                          <div className="flex items-center justify-end space-x-1 mt-3">
                              {hasPermission(Permission.UPDATE_EXPENSES) && (
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                                      <EditIcon className="w-5 h-5" />
                                  </Button>
                              )}
                              {hasPermission(Permission.DELETE_EXPENSES) && (
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(expense.id)}>
                                      <TrashIcon className="w-5 h-5" />
                                  </Button>
                              )}
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-10">
                      <ReceiptIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
                           {filteredExpenses.length === 0 && searchTerm ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa registrada'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                           {filteredExpenses.length === 0 && searchTerm ? 'Tente buscar por outro termo.' : 'Adicione sua primeira despesa para começar.'}
                      </p>
                  </div>
              )}
          </div>
      </div>
      
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredExpenses.length}
        itemsPerPage={pagination.ITEMS_PER_PAGE}
      />
      
      {isModalOpen && (
        <ExpenseFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          addExpense={addExpense}
          updateExpense={updateExpense}
          expense={editingExpense}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message="Você tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        />
      )}
    </div>
  );
};
