import React, { useState, useEffect } from 'react';
import type { Role } from '../types';
import { Permission } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  addRole: (role: Omit<Role, 'id' | 'isEditable'>) => void;
  updateRole: (role: Role) => void;
  role: Role | null;
}

const permissionGroups = [
  {
    module: 'Geral',
    permissions: [
      { key: Permission.VIEW_DASHBOARD, label: 'Ver Painel' },
      { key: Permission.VIEW_CALENDAR, label: 'Ver Calendário' },
      { key: Permission.VIEW_REPORTS, label: 'Ver Relatórios' },
    ],
  },
  {
    module: 'Alunos',
    permissions: [
      { key: Permission.VIEW_MEMBERS, label: 'Ver' },
      { key: Permission.CREATE_MEMBERS, label: 'Criar' },
      { key: Permission.UPDATE_MEMBERS, label: 'Editar' },
      { key: Permission.DELETE_MEMBERS, label: 'Excluir' },
    ],
  },
  {
    module: 'Planos',
    permissions: [
      { key: Permission.VIEW_PLANS, label: 'Ver' },
      { key: Permission.CREATE_PLANS, label: 'Criar' },
      { key: Permission.UPDATE_PLANS, label: 'Editar' },
      { key: Permission.DELETE_PLANS, label: 'Excluir' },
    ],
  },
    {
    module: 'Pagamentos',
    permissions: [
      { key: Permission.VIEW_PAYMENTS, label: 'Ver' },
      { key: Permission.CREATE_PAYMENTS, label: 'Criar' },
      { key: Permission.UPDATE_PAYMENTS, label: 'Editar' },
      { key: Permission.DELETE_PAYMENTS, label: 'Excluir' },
    ],
  },
  {
    module: 'Despesas',
    permissions: [
      { key: Permission.VIEW_EXPENSES, label: 'Ver' },
      { key: Permission.CREATE_EXPENSES, label: 'Criar' },
      { key: Permission.UPDATE_EXPENSES, label: 'Editar' },
      { key: Permission.DELETE_EXPENSES, label: 'Excluir' },
    ],
  },
  {
    module: 'Administração',
    permissions: [
      { key: Permission.MANAGE_SETTINGS, label: 'Gerenciar Configurações Gerais' },
      { key: Permission.MANAGE_ROLES, label: 'Gerenciar Funções e Permissões' },
    ],
  },
];


export const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, addRole, updateRole, role }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set());

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setPermissions(new Set(role.permissions));
    } else {
      setName('');
      setDescription('');
      setPermissions(new Set());
    }
  }, [role, isOpen]);

  const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
    setPermissions(prev => {
      const newPermissions = new Set(prev);
      if (isChecked) {
        newPermissions.add(permission);
      } else {
        newPermissions.delete(permission);
      }
      return newPermissions;
    });
  };

  const handleSelectAllGroup = (groupPermissions: { key: Permission }[], isChecked: boolean) => {
     setPermissions(prev => {
        const newPermissions = new Set(prev);
        groupPermissions.forEach(p => {
            if (isChecked) {
                newPermissions.add(p.key);
            } else {
                newPermissions.delete(p.key);
            }
        });
        return newPermissions;
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roleData = {
      name,
      description,
      permissions: Array.from(permissions),
    };
    if (role) {
      updateRole({ ...role, ...roleData });
    } else {
      addRole(roleData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Editar Função' : 'Adicionar Nova Função'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Função</label>
          <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <input type="text" name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">Permissões</h3>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
            {permissionGroups.map(group => {
                const allGroupPermissions = group.permissions.map(p => p.key);
                const isAllSelected = allGroupPermissions.every(p => permissions.has(p));
                return (
                    <div key={group.module} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-semibold text-gray-700 dark:text-gray-300">{group.module}</h4>
                           {group.permissions.length > 1 && (
                             <div className="flex items-center">
                                <label htmlFor={`select-all-${group.module}`} className="text-sm mr-2 text-gray-600 dark:text-gray-400">Selecionar todos</label>
                                <input 
                                    type="checkbox" 
                                    id={`select-all-${group.module}`}
                                    checked={isAllSelected}
                                    onChange={e => handleSelectAllGroup(group.permissions, e.target.checked)}
                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:focus:ring-offset-gray-800"
                                />
                             </div>
                           )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {group.permissions.map(perm => (
                                <div key={perm.key} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={perm.key}
                                        checked={permissions.has(perm.key)}
                                        onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                                        className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:focus:ring-offset-gray-800"
                                    />
                                    <label htmlFor={perm.key} className="ml-2 text-sm text-gray-600 dark:text-gray-300">{perm.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{role ? 'Salvar Alterações' : 'Adicionar Função'}</Button>
        </div>
      </form>
    </Modal>
  );
};