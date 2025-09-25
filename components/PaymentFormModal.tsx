import React, { useState, useEffect, useMemo } from 'react';
import type { Payment, Member, Plan } from '../types';
import { PaymentStatus } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { applyDateMask, validateDate, formatDateToDDMMYYYY, parseDDMMYYYYtoDate } from '../utils';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  payment: Payment | null;
  members: Member[];
  plans: Plan[];
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ isOpen, onClose, addPayment, updatePayment, payment, members, plans }) => {
  
  const getInitialState = () => {
    const firstMember = members.length > 0 ? members[0] : null;
    const firstPlan = firstMember ? plans.find(p => p.id === firstMember.planId) : null;
    return {
        memberId: firstMember?.id || '',
        planId: firstPlan?.id || '',
        description: firstPlan ? `Pagamento para ${firstPlan.name}` : '',
        amount: firstPlan?.price || 0,
        date: formatDateToDDMMYYYY(new Date()),
        status: PaymentStatus.Paid,
    };
  };
  
  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (data = formData) => {
    const newErrors: { [key: string]: string | undefined } = {};

    if (!data.memberId) newErrors.memberId = 'Aluno é obrigatório.';
    if (data.amount <= 0) newErrors.amount = 'O valor deve ser maior que zero.';
    if (!data.date.trim()) {
      newErrors.date = 'Data é obrigatória.';
    } else if (!validateDate(data.date)) {
      newErrors.date = 'Data inválida (DD/MM/AAAA).';
    }

    return newErrors;
  };

  const isFormInvalid = useMemo(() => {
     return Object.values(validate(formData)).some(Boolean);
  }, [formData]);

  useEffect(() => {
    if (isOpen) {
        if (payment) {
          setFormData({
            memberId: payment.memberId,
            planId: payment.planId,
            description: payment.description || '',
            amount: payment.amount,
            date: formatDateToDDMMYYYY(payment.date),
            status: payment.status,
          });
        } else {
          setFormData(getInitialState());
        }
        setErrors({});
        setTouched({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment, members, plans, isOpen]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    const member = members.find(m => m.id === memberId);
    const plan = member ? plans.find(p => p.id === member.planId) : null;
    
    setTouched(prev => ({ ...prev, memberId: true }));

    const updatedFormData = {
        ...formData,
        memberId: memberId,
        planId: plan?.id || '',
        amount: plan?.price || formData.amount,
        description: plan ? `Pagamento para ${plan.name}` : ''
    };
    setFormData(updatedFormData);
    setErrors(validate(updatedFormData));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, tagName } = e.target;
    
    if (tagName === 'SELECT') {
      setTouched(prev => ({ ...prev, [name]: true }));
    }

    let finalValue: string | number = value;
    if (name === 'date') {
        finalValue = applyDateMask(value);
    } else if (name === 'amount') {
        finalValue = parseFloat(value) || 0;
    }

    const updatedFormData = { ...formData, [name]: finalValue };
    setFormData(updatedFormData);
    setErrors(validate(updatedFormData));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalErrors = validate();
    setErrors(finalErrors);
    
    setTouched({ memberId: true, amount: true, date: true });

    const isValid = Object.keys(finalErrors).length === 0;

    if (isValid) {
        if (!formData.memberId || !formData.planId) {
            alert("Por favor, selecione um aluno válido.");
            return;
        }
        const paymentDate = parseDDMMYYYYtoDate(formData.date);
        if(!paymentDate) return;

        const paymentData = {
            ...formData,
            amount: Number(formData.amount),
            date: paymentDate
        };

        if (payment) {
          updatePayment({ ...payment, ...paymentData });
        } else {
          addPayment(paymentData);
        }
        onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={payment ? 'Editar Pagamento' : 'Registrar Novo Pagamento'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aluno</label>
          <select name="memberId" id="memberId" value={formData.memberId} onChange={handleMemberChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.memberId && touched.memberId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
            <option value="" disabled>Selecione um aluno</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          {errors.memberId && touched.memberId && <p className="mt-1 text-sm text-red-500">{errors.memberId}</p>}
        </div>
         <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
          <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} onBlur={handleBlur} required min="0" step="0.01" className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.amount && touched.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.amount && touched.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data do Pagamento</label>
          <input type="text" name="date" id="date" value={formData.date} onChange={handleChange} onBlur={handleBlur} required placeholder="DD/MM/AAAA" className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.date && touched.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.date && touched.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
         <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
            {Object.values(PaymentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isFormInvalid}>{payment ? 'Salvar Alterações' : 'Registrar Pagamento'}</Button>
        </div>
      </form>
    </Modal>
  );
};