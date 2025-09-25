import React, { useState, useEffect } from 'react';
import type { Plan } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (plan: Plan) => void;
  plan: Plan | null;
}

interface PlanFormData {
    name: string;
    price: number;
    durationInMonths: number;
    dueDateDayOfMonth?: number;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, addPlan, updatePlan, plan }) => {
  const getInitialState = (): PlanFormData => ({
    name: '',
    price: 0,
    durationInMonths: 1,
    dueDateDayOfMonth: undefined,
  });

  const [formData, setFormData] = useState<PlanFormData>(getInitialState());

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price,
        durationInMonths: plan.durationInMonths,
        dueDateDayOfMonth: plan.dueDateDayOfMonth,
      });
    } else {
      setFormData(getInitialState());
    }
  }, [plan, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'dueDateDayOfMonth') {
        const numValue = value === '' ? undefined : parseInt(value, 10);
        setFormData(prev => ({ ...prev, dueDateDayOfMonth: isNaN(numValue!) ? undefined : numValue }));
        return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plan) {
      updatePlan({ ...plan, ...formData });
    } else {
      addPlan(formData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={plan ? 'Editar Plano' : 'Adicionar Novo Plano'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Plano</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço (R$)</label>
          <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="durationInMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração (Meses)</label>
          <input type="number" name="durationInMonths" id="durationInMonths" value={formData.durationInMonths} onChange={handleChange} required min="1" step="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="dueDateDayOfMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia de Vencimento (Opcional)</label>
          <input type="number" name="dueDateDayOfMonth" id="dueDateDayOfMonth" value={formData.dueDateDayOfMonth ?? ''} onChange={handleChange} min="1" max="31" placeholder="Ex: 5" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{plan ? 'Salvar Alterações' : 'Adicionar Plano'}</Button>
        </div>
      </form>
    </Modal>
  );
};