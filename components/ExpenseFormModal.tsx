

import React, { useState, useEffect } from 'react';
import type { Expense } from '../types';
import { ExpenseCategory, ExpenseStatus } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  expense: Expense | null;
}

const toInputDateString = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
};

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose, addExpense, updateExpense, expense }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: toInputDateString(new Date()),
    category: ExpenseCategory.Other,
    status: ExpenseStatus.Pending,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount,
        date: toInputDateString(expense.date),
        category: expense.category,
        status: expense.status || ExpenseStatus.Pending,
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        date: toInputDateString(new Date()),
        category: ExpenseCategory.Other,
        status: ExpenseStatus.Pending,
      });
    }
  }, [expense, isOpen]);

  // Auto-set status based on date
  useEffect(() => {
    if (formData.status === ExpenseStatus.Paid) {
      return; // Do not change if already marked as paid
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [year, month, day] = formData.date.split('-').map(Number);
    const expenseDate = new Date(year, month - 1, day);
    
    const newStatus = expenseDate < today ? ExpenseStatus.Overdue : ExpenseStatus.Pending;

    if (newStatus !== formData.status) {
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  }, [formData.date, formData.status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = formData.date.split('-').map(Number);
    const expenseDate = new Date(year, month - 1, day);
    
    const expenseData = {
        ...formData,
        date: expenseDate,
    };

    if (expense) {
      updateExpense({ ...expense, ...expenseData });
    } else {
      addExpense(expenseData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Editar Despesa' : 'Adicionar Nova Despesa'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
          <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Vencimento</label>
          <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
          <select name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
            {/* FIX: Explicitly cast enum value to string for key prop */}
            {Object.values(ExpenseCategory).map(category => (
              <option key={category as string} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
            {/* FIX: Explicitly cast enum value to string for key prop */}
            {Object.values(ExpenseStatus).map(status => (
              <option key={status as string} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{expense ? 'Salvar Alterações' : 'Adicionar Despesa'}</Button>
        </div>
      </form>
    </Modal>
  );
};