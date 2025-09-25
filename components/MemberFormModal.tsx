import React, { useState, useEffect, useMemo } from 'react';
import type { Member, Plan } from '../types';
import { MemberStatus } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { applyDateMask, validateDate, validateEmail, formatDateToDDMMYYYY, parseDDMMYYYYtoDate, applyPhoneMask } from '../utils';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (member: Member) => void;
  member: Member | null;
  plans: Plan[];
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({ isOpen, onClose, addMember, updateMember, member, plans }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefone: '',
    planId: '',
    status: MemberStatus.Pending,
    joinDate: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (data = formData) => {
    const newErrors: { [key: string]: string | undefined } = {};

    if (!data.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!data.email.trim()) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'E-mail inválido.';
    }
    if (!data.joinDate.trim()) {
      newErrors.joinDate = 'Data é obrigatória.';
    } else if (!validateDate(data.joinDate)) {
      newErrors.joinDate = 'Data inválida (DD/MM/AAAA).';
    }
    if (!data.planId) newErrors.planId = 'Plano é obrigatório.';

    return newErrors;
  };

  const isFormInvalid = useMemo(() => {
     return Object.values(validate(formData)).some(Boolean);
  }, [formData]);


  useEffect(() => {
    if (isOpen) {
        if (member) {
          setFormData({
            name: member.name,
            email: member.email,
            telefone: member.telefone || '',
            planId: member.planId,
            status: member.status,
            joinDate: formatDateToDDMMYYYY(member.joinDate),
          });
        } else {
          setFormData({
            name: '',
            email: '',
            telefone: '',
            planId: plans.length > 0 ? plans[0].id : '',
            status: MemberStatus.Pending,
            joinDate: formatDateToDDMMYYYY(new Date()),
          });
        }
        setErrors({});
        setTouched({});
    }
  }, [member, plans, isOpen]);
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, tagName } = e.target;

    if (tagName === 'SELECT') {
      setTouched(prev => ({ ...prev, [name]: true }));
    }

    let finalValue = value;
    if (name === 'joinDate') {
        finalValue = applyDateMask(value);
    } else if (name === 'telefone') {
        finalValue = applyPhoneMask(value);
    }
    
    const updatedFormData = { ...formData, [name]: finalValue };
    
    setFormData(updatedFormData);
    setErrors(validate(updatedFormData));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalErrors = validate();
    setErrors(finalErrors);
    
    setTouched({ name: true, email: true, joinDate: true, planId: true, status: true });

    const isValid = Object.keys(finalErrors).length === 0;
    
    if (isValid) {
      const joinDate = parseDDMMYYYYtoDate(formData.joinDate);
      if (!joinDate) return;

      const memberData = {
          name: formData.name,
          email: formData.email,
          telefone: formData.telefone,
          planId: formData.planId,
          status: formData.status,
          joinDate,
      };
      
      if (member) {
        updateMember({ ...member, ...memberData });
      } else {
        addMember(memberData);
      }
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={member ? 'Editar Aluno' : 'Adicionar Novo Aluno'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.name && touched.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.email && touched.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone (Opcional)</label>
          <input type="tel" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} onBlur={handleBlur} placeholder="(XX) XXXXX-XXXX" className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
        </div>
        <div>
          <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Inscrição</label>
          <input type="text" name="joinDate" id="joinDate" value={formData.joinDate} onChange={handleChange} onBlur={handleBlur} required placeholder="DD/MM/AAAA" className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.joinDate && touched.joinDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.joinDate && touched.joinDate && <p className="mt-1 text-sm text-red-500">{errors.joinDate}</p>}
        </div>
        <div>
          <label htmlFor="planId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plano</label>
          <select name="planId" id="planId" value={formData.planId} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.planId && touched.planId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
            <option value="" disabled>Selecione um plano</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name} - {plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })}</option>
            ))}
          </select>
          {errors.planId && touched.planId && <p className="mt-1 text-sm text-red-500">{errors.planId}</p>}
        </div>
         <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700">
            {Object.values(MemberStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isFormInvalid}>{member ? 'Salvar Alterações' : 'Adicionar Aluno'}</Button>
        </div>
      </form>
    </Modal>
  );
};