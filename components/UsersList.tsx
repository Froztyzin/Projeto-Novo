import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { User } from '../types';
import { Permission } from '../types';
import { Button } from './ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon, ShieldCheckIcon } from './ui/Icons';
import { UserFormModal } from './UserFormModal';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { Skeleton } from './ui/Skeleton';
import { Avatar } from './ui/Avatar';
import { RolesManagementModal } from './RolesManagementModal';
import { Pagination } from './ui/Pagination';

const UsersListSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    </div>
);

export const UsersList: React.FC = () => {
  const { users, roles, addUser, updateUser, deleteUser, hasPermission, isLoading } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return users.slice(start, end);
  }, [users, currentPage]);

  const getRoleName = (roleId: string): string => {
    return roles.find(r => r.id === roleId)?.name || 'N/A';
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (userId: string) => {
    setUserToDelete(userId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete && deleteUser) {
        deleteUser(userToDelete);
    }
    setIsConfirmModalOpen(false);
    setUserToDelete(null);
  };

  if (isLoading) {
    return <UsersListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
          <div className="flex justify-end">
              <div className="flex items-center gap-2">
                  {hasPermission(Permission.MANAGE_ROLES) && (
                      <Button onClick={() => setIsRolesModalOpen(true)} variant="outline">
                          <ShieldCheckIcon className="w-5 h-5 mr-2" />
                          Gerenciar Funções
                      </Button>
                  )}
                  {hasPermission(Permission.CREATE_USERS) && (
                      <Button onClick={handleAddNew} className="flex items-center justify-center">
                          <PlusCircleIcon className="w-5 h-5 mr-2" />
                          Adicionar Usuário
                      </Button>
                  )}
              </div>
          </div>

          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left">
              <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 uppercase">
                  <th className="p-4 font-semibold">Usuário</th>
                  <th className="p-4 font-semibold">Função</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentUsers.length > 0 ? (
                      currentUsers.map((user, index) => (
                      <tr 
                          key={user.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 animate-stagger"
                          style={{ animationDelay: `${index * 50}ms` }}
                      >
                          <td className="p-4">
                              <div className="flex items-center">
                                  <Avatar name={user.name} />
                                  <div>
                                      <p className="font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-300">{getRoleName(user.roleId)}</td>
                          <td className="p-4">
                          <div className="flex items-center justify-end space-x-1">
                              {hasPermission(Permission.UPDATE_USERS) && (
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                      <EditIcon className="w-5 h-5" />
                                  </Button>
                              )}
                              {hasPermission(Permission.DELETE_USERS) && (
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(user.id)}>
                                      <TrashIcon className="w-5 h-5" />
                                  </Button>
                              )}
                          </div>
                          </td>
                      </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={3} className="text-center p-8 text-gray-500 dark:text-gray-400">
                            Nenhum usuário cadastrado ainda.
                          </td>
                      </tr>
                  )}
              </tbody>
              </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
              {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                      <div 
                          key={user.id} 
                          className="bg-slate-50 dark:bg-gray-900/40 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 animate-stagger" 
                          style={{ animationDelay: `${index * 70}ms` }}
                      >
                          <div className="flex justify-between items-start">
                              <div className="flex items-center mb-2">
                                  <Avatar name={user.name} />
                                  <div>
                                      <p className="font-bold text-gray-800 dark:text-gray-100">{user.name}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                  </div>
                              </div>
                          </div>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                          <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-500 dark:text-gray-400">Função</p>
                              <p className="font-medium text-gray-700 dark:text-gray-200">{getRoleName(user.roleId)}</p>
                          </div>

                          <div className="flex items-center justify-end space-x-1 mt-4">
                              {hasPermission(Permission.UPDATE_USERS) && (
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                      <EditIcon className="w-5 h-5" />
                                  </Button>
                              )}
                              {hasPermission(Permission.DELETE_USERS) && (
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(user.id)}>
                                      <TrashIcon className="w-5 h-5" />
                                  </Button>
                              )}
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                      Nenhum usuário cadastrado ainda.
                  </div>
              )}
          </div>
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={users.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />
      
      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          addUser={addUser}
          updateUser={updateUser}
          user={editingUser}
          roles={roles}
        />
      )}
      
      {isRolesModalOpen && (
        <RolesManagementModal
            isOpen={isRolesModalOpen}
            onClose={() => setIsRolesModalOpen(false)}
        />
      )}

      {isConfirmModalOpen && (
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão de Usuário"
            message="Você tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
          />
      )}
    </div>
  );
};