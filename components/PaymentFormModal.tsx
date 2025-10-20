

import React, { useState, useEffect } from 'react';
import type { Payment, Member, Plan } from '../types';
import { PaymentStatus } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  payment: Payment | null;
  members: Member[];
  plans: Plan[];
}

const toInputDateString = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
};

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ isOpen, onClose, addPayment, updatePayment, payment, members, plans }) => {
  const getInitialState = () => ({
    memberId: '',
    planId: '',
    amount: 0,
    date: toInputDateString(new Date()),
    status: PaymentStatus.Pending,
    paidDate: undefined as string | undefined,
    description: '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
        if (payment) {
          setFormData({
            memberId: payment.memberId,
            planId: payment.planId,
            amount: payment.amount,
            date: toInputDateString(payment.date),
            status: payment.status,
            paidDate: payment.paidDate ? toInputDateString(payment.paidDate) : undefined,
            description: payment.description || '',
          });
        } else {
          setFormData(getInitialState());
        }
    }
  }, [payment, isOpen]);

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    const member = members.find(m => m.id === memberId);
    if (member) {
        const plan = plans.find(p => p.id === member.planId);
        setFormData(prev => ({
            ...prev,
            memberId: memberId,
            planId: member.planId,
            amount: plan?.price || 0,
        }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const newFormData = { ...formData, [name]: type === 'number' ? parseFloat(value) || 0 : value };

    if (name === 'status' && value === PaymentStatus.Paid && !newFormData.paidDate) {
        newFormData.paidDate = toInputDateString(new Date());
    }
    
    setFormData(newFormData);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = formData.date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    
    let paidDateObj: Date | undefined = undefined;
    if (formData.status === PaymentStatus.Paid && formData.paidDate) {
        const [pYear, pMonth, pDay] = formData.paidDate.split('-').map(Number);
        paidDateObj = new Date(pYear, pMonth - 1, pDay);
    } else if (formData.status === PaymentStatus.Paid && !formData.paidDate) {
        paidDateObj = new Date();
    }

    const paymentData = {
        memberId: formData.memberId,
        planId: formData.planId,
        amount: formData.amount,
        date: dueDate,
        status: formData.status,
        paidDate: paidDateObj,
        description: formData.description,
    };

    if (payment) {
      updatePayment({ ...payment, ...paymentData });
    } else {
      addPayment(paymentData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={payment ? 'Editar Pagamento' : 'Registrar Novo Pagamento'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aluno</label>
          <select name="memberId" id="memberId" value={formData.memberId} onChange={handleMemberChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
            <option value="" disabled>Selecione um aluno</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="planId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plano</label>
          <select name="planId" id="planId" value={formData.planId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
            <option value="" disabled>Selecione um plano</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
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
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
            {Object.values(PaymentStatus).map(status => (
              <option key={status as string} value={status}>{status}</option>
            ))}
          </select>
        </div>
        {formData.status === PaymentStatus.Paid && (
          <div>
            <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Pagamento</label>
            <input type="date" name="paidDate" id="paidDate" value={formData.paidDate || toInputDateString(new Date())} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
          </div>
        )}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (Opcional)</label>
          <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{payment ? 'Salvar Alterações' : 'Adicionar Pagamento'}</Button>
        </div>
      </form>
    </Modal>
  );
};