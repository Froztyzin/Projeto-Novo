
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Role } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { validateEmail } from '../utils';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  user: User | null;
  roles: Role[];
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, addUser, updateUser, user, roles }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

  const isEditing = useMemo(() => !!user, [user]);
  
  const validate = (data = formData) => {
    const newErrors: { [key: string]: string | undefined } = {};

    if (!data.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!data.email.trim()) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'E-mail inválido.';
    }
    if (!isEditing && !data.password) {
        newErrors.password = 'Senha é obrigatória para novos usuários.';
    }
    if (data.password && data.password.length < 6) {
        newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (data.password !== data.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem.';
    }
    if (!data.roleId) newErrors.roleId = 'Função é obrigatória.';

    return newErrors;
  };
  
  const isFormInvalid = useMemo(() => {
     return Object.values(validate(formData)).some(Boolean);
  }, [formData]);

  useEffect(() => {
    if (isOpen) {
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            confirmPassword: '',
            roleId: user.roleId,
          });
        } else {
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            roleId: roles.find(r => r.name === 'Recepcionista')?.id || '',
          });
        }
        setErrors({});
    }
  }, [user, roles, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalErrors = validate();
    setErrors(finalErrors);
    
    if (Object.keys(finalErrors).length > 0) return;
    
    const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password || (user ? user.password : ''), // Keep old password if not changed
        roleId: formData.roleId,
    };
    
    if (user) {
        updateUser({ ...user, ...userData });
    } else {
        addUser(userData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuário' : 'Adicionar Novo Usuário'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
          <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Deixe em branco para não alterar' : ''} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Senha</label>
          <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Função</p>
          <select name="roleId" id="roleId" value={formData.roleId} onChange={handleChange} required className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 ${errors.roleId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
            <option value="" disabled>Selecione uma função</option>
            {roles.filter(r => r.name !== 'Administrador').map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {errors.roleId && <p className="mt-1 text-sm text-red-500">{errors.roleId}</p>}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isFormInvalid}>{user ? 'Salvar Alterações' : 'Adicionar Usuário'}</Button>
        </div>
      </form>
    </Modal>
  );
};
