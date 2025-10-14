import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Role } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { RoleFormModal } from './RoleFormModal';
import { PlusCircleIcon, EditIcon, TrashIcon } from './ui/Icons';

interface RolesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolesManagementModal: React.FC<RolesManagementModalProps> = ({ isOpen, onClose }) => {
    const { roles, addRole, updateRole, deleteRole } = useAppContext();
    
    const [isRoleFormModalOpen, setIsRoleFormModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    const handleAddNewRole = () => {
        setEditingRole(null);
        setIsRoleFormModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsRoleFormModalOpen(true);
    };

    const handleDeleteRequest = (role: Role) => {
        setRoleToDelete(role);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (roleToDelete) {
            deleteRole(roleToDelete.id);
        }
        setIsDeleteConfirmOpen(false);
        setRoleToDelete(null);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Funções">
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={handleAddNewRole} size="sm">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Nova Função
                        </Button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {roles.map(role => (
                            <div key={role.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{role.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)} disabled={role.isEditable === false}>
                                        <EditIcon className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(role)} disabled={role.isEditable === false}>
                                        <TrashIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={onClose}>Fechar</Button>
                    </div>
                </div>
            </Modal>

            {isRoleFormModalOpen && (
                <RoleFormModal 
                    isOpen={isRoleFormModalOpen}
                    onClose={() => setIsRoleFormModalOpen(false)}
                    role={editingRole}
                    addRole={addRole}
                    updateRole={updateRole}
                />
            )}

            {isDeleteConfirmOpen && roleToDelete && (
                 <ConfirmationModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title={`Excluir Função "${roleToDelete.name}"`}
                    message="Você tem certeza que deseja excluir esta função? Usuários associados a ela podem perder o acesso."
                />
            )}
        </>
    );
};
