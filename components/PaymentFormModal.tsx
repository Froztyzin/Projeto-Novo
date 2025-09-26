

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
  
  const getInitialState = () => ({
    memberId: '',
    planId: '',
    description: '',
    amount: 0,
    date: formatDateToDDMMYYYY(new Date()),
    paidDate: '',
    status: PaymentStatus.Pending,
  });
  
  const [formData, setFormData] = useState(getInitialState());
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (data = formData) => {
    const newErrors: { [key: string]: string | undefined } = {};

    if (!data.memberId) newErrors.memberId = 'Aluno é obrigatório.';
    if (data.amount <= 0) newErrors.amount = 'O valor deve ser maior que zero.';
    if (!data.date.trim()) {
      newErrors.date = 'Data de vencimento é obrigatória.';
    } else if (!validateDate(data.date)) {
      newErrors.date = 'Data de vencimento inválida (DD/MM/AAAA).';
    }
    
    if (data.status === PaymentStatus.Paid) {
        if (!data.paidDate.trim()) {
            newErrors.paidDate = 'Data de pagamento é obrigatória.';
        } else if (!validateDate(data.paidDate)) {
            newErrors.paidDate = 'Data de pagamento inválida (DD/MM/AAAA).';
        } else {
            const dueDate = parseDDMMYYYYtoDate(data.date);
            const paidDate = parseDDMMYYYYtoDate(data.paidDate);
            if (dueDate && paidDate && paidDate < dueDate) {
                newErrors.paidDate = 'A data de pagamento não pode ser anterior ao vencimento.';
            }
        }
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
            paidDate: payment.paidDate ? formatDateToDDMMYYYY(payment.paidDate) : '',
            status: payment.status,
          });
        } else {
          setFormData(getInitialState());
        }
        setErrors({});
        setTouched({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment, isOpen]);

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
        amount: plan?.price || 0,
        description: plan ? `Pagamento para ${plan.name}` : ''
    };
    setFormData(updatedFormData);
    setErrors(validate(updatedFormData));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'date' || name === 'paidDate') {
        updatedFormData[name] = applyDateMask(value);
    } else if (name === 'amount') {
        updatedFormData[name] = parseFloat(value) || 0;
    }
    
    if (name === 'status') {
        if (value === PaymentStatus.Paid) {
            const currentPaidDate = parseDDMMYYYYtoDate(formData.paidDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Preenche automaticamente com a data de hoje se a data de pagamento estiver vazia, for inválida ou uma data passada.
            // Uma data futura já preenchida será mantida.
            if (!currentPaidDate || currentPaidDate < today) {
                updatedFormData.paidDate = formatDateToDDMMYYYY(new Date());
            }
        } else {
            // Limpa a data de pagamento se o status for alterado para Pendente ou Vencido
            updatedFormData.paidDate = '';
        }
    }

    setFormData(updatedFormData);
    setErrors(validate(updatedFormData));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalErrors = validate();
    setErrors(finalErrors);
    
    setTouched({ memberId: true, amount: true, date: true, paidDate: true });

    if (Object.keys(finalErrors).length > 0) {
        return;
    }

    const dueDate = parseDDMMYYYYtoDate(formData.date);
    if (!dueDate) return;

    let paidDate: Date | undefined = undefined;
    if (formData.status === PaymentStatus.Paid) {
        const parsedPaidDate = parseDDMMYYYYtoDate(formData.paidDate);
        if(!parsedPaidDate) return;
        paidDate = parsedPaidDate;
    }

    const paymentData = {
        memberId: formData.memberId,
        planId: formData.planId,
        description: formData.description || '',
        amount: Number(formData.amount),
        date: dueDate,
        paidDate: paidDate,
        status: formData.status,
    };

    if (payment) {
        updatePayment({ id: payment.id, ...paymentData });
    } else {
        addPayment(paymentData);
    }
    onClose();
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
          <label htmlFor="planId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plano (Opcional)</label>
          <select name="planId" id="planId" value={formData.planId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
            <option value="">Nenhum / Pagamento Avulso</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name} - {plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
            ))}
          </select>
        </div>
         <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
          <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} onBlur={handleBlur} required min="0.01" step="0.01" className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.amount && touched.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.amount && touched.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Vencimento</label>
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
        {formData.status === PaymentStatus.Paid && (
            <div className="animate-fadeIn">
                <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data do Pagamento</label>
                <input type="text" name="paidDate" id="paidDate" value={formData.paidDate} onChange={handleChange} onBlur={handleBlur} required placeholder="DD/MM/AAAA" className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.paidDate && touched.paidDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {errors.paidDate && touched.paidDate && <p className="mt-1 text-sm text-red-500">{errors.paidDate}</p>}
            </div>
        )}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isFormInvalid}>{payment ? 'Salvar Alterações' : 'Registrar Pagamento'}</Button>
        </div>
      </form>
    </Modal>
  );
};
