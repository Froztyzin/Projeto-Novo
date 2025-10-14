import React, { useState, useMemo, useContext } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useMembers } from '../hooks/useMembers';
import type { Member, Plan } from '../types';
import { MemberStatus, Permission } from '../types';
import { MemberStatusBadge } from './ui/Badges';
import { Button } from './ui/Button';
import { PlusCircleIcon, UsersIcon, EditIcon, TrashIcon, MailIcon, HeartIcon } from './ui/Icons';
import { MemberFormModal } from './MemberFormModal';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { Skeleton } from './ui/Skeleton';
import { Pagination } from './ui/Pagination';
import { Avatar } from './ui/Avatar';
import { useToast } from '../contexts/ToastContext';
import { AIReengagementModal } from './AIReengagementModal';
import { LayoutContext } from './router/Layout';

const MembersListSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    </div>
);

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center shadow-sm">
    <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

export const MembersList: React.FC = () => {
  const { plans, addMember, updateMember, deleteMember, hasPermission, requestPasswordResetForMember } = useAppContext();
  const { addToast } = useToast();
  const layoutContext = useContext(LayoutContext);

  if (!layoutContext) {
    throw new Error("MembersList must be used within a Layout provider");
  }
  const { openMemberDetails } = layoutContext;
  
  const {
      isLoading,
      members: currentMembers,
      allMembers,
      filteredMembers,
      filters,
      pagination,
      handleSearchChange,
      handleStatusChange,
      handlePlanChange,
      handlePageChange,
      clearFilters,
  } = useMembers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [reengagementModalData, setReengagementModalData] = useState<{ member: Member, plan: Plan | null } | null>(null);

  const stats = useMemo(() => ([
    { title: "Total de Alunos", value: allMembers.length, icon: <UsersIcon className="h-5 w-5"/> },
    { title: "Alunos Ativos", value: allMembers.filter(m => m.status === MemberStatus.Active).length, icon: <UsersIcon className="h-5 w-5"/> },
    { title: "Pag. Pendente", value: allMembers.filter(m => m.status === MemberStatus.Pending).length, icon: <UsersIcon className="h-5 w-5"/> },
    { title: "Alunos Inativos", value: allMembers.filter(m => m.status === MemberStatus.Inactive).length, icon: <UsersIcon className="h-5 w-5"/> },
  ]), [allMembers]);

  const getPlanName = (planId: string, plans: Plan[]): string => {
    return plans.find(p => p.id === planId)?.name || 'N/A';
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (memberId: string) => {
    setMemberToDelete(memberId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete && deleteMember) {
        deleteMember(memberToDelete);
    }
    setIsConfirmModalOpen(false);
    setMemberToDelete(null);
  };
  
  const handleSendResetLink = async (email: string) => {
    const result = await requestPasswordResetForMember(email);
    addToast(result.message, result.success ? 'success' : 'error');
  };

  const handleReengagementClick = (member: Member) => {
    const memberPlan = plans.find(p => p.id === member.planId) || null;
    setReengagementModalData({ member, plan: memberPlan });
  };

  if (isLoading) {
    return <MembersListSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-6">
        {hasPermission(Permission.CREATE_MEMBERS) && (
            <div className="flex justify-end">
                <Button onClick={handleAddNew} className="flex items-center justify-center">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Adicionar Aluno
                </Button>
            </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div key={stat.title} className="animate-stagger" style={{ animationDelay: `${index * 100}ms` }}>
                    <StatCard {...stat} />
                </div>
            ))}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="md:col-span-2 lg:col-span-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <select value={filters.statusFilter} onChange={e => handleStatusChange(e.target.value as MemberStatus | 'all')} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <option value="all">Todos os Status</option>
                    {Object.values(MemberStatus).map(s => <option key={s as string} value={s}>{s}</option>)}
                </select>
                <select value={filters.planFilter} onChange={e => handlePlanChange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <option value="all">Todos os Planos</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar Filtros</Button>
            </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 uppercase">
                <th className="p-4 font-semibold">Aluno</th>
                <th className="p-4 font-semibold">Plano</th>
                <th className="p-4 font-semibold">Data de Inscrição</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentMembers.length > 0 ? (
                    currentMembers.map((member, index) => (
                    <tr 
                        key={member.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer animate-stagger"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => openMemberDetails(member)}
                    >
                        <td className="p-4">
                            <div className="flex items-center">
                                <Avatar name={member.name} />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{member.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                    {member.telefone && <p className="text-sm text-gray-500 dark:text-gray-400">{member.telefone}</p>}
                                </div>
                            </div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{getPlanName(member.planId, plans)}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(member.joinDate).toLocaleDateString('pt-BR')}</td>
                        <td className="p-4"><MemberStatusBadge status={member.status} /></td>
                        <td className="p-4">
                        <div className="flex items-center justify-end space-x-1" onClick={e => e.stopPropagation()}>
                            {member.status === MemberStatus.Inactive && hasPermission(Permission.UPDATE_MEMBERS) && (
                                <Button variant="ghost" size="icon" title="Gerar mensagem de reengajamento" onClick={() => handleReengagementClick(member)}>
                                    <HeartIcon className="w-5 h-5 text-pink-400" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Enviar link para definir senha" onClick={() => handleSendResetLink(member.email)}>
                                <MailIcon className="w-5 h-5" />
                            </Button>
                            {hasPermission(Permission.UPDATE_MEMBERS) && (
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                                    <EditIcon className="w-5 h-5" />
                                </Button>
                            )}
                            {hasPermission(Permission.DELETE_MEMBERS) && (
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(member.id)}>
                                    <TrashIcon className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">
                        {allMembers.length === 0 ? 'Nenhum aluno cadastrado ainda.' : 'Nenhum aluno encontrado com os filtros aplicados.'}
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {currentMembers.length > 0 ? (
                    currentMembers.map((member, index) => (
                        <div 
                            key={member.id} 
                            className="bg-slate-50 dark:bg-gray-900/40 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 animate-stagger" 
                            style={{ animationDelay: `${index * 70}ms` }}
                            onClick={() => openMemberDetails(member)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center mb-2">
                                    <Avatar name={member.name} />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{member.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                </div>
                                <MemberStatusBadge status={member.status} />
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Plano</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">{getPlanName(member.planId, plans)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Inscrição</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">{new Date(member.joinDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-1 mt-4" onClick={e => e.stopPropagation()}>
                                {member.status === MemberStatus.Inactive && hasPermission(Permission.UPDATE_MEMBERS) && (
                                    <Button variant="ghost" size="icon" title="Gerar mensagem de reengajamento" onClick={() => handleReengagementClick(member)}>
                                        <HeartIcon className="w-5 h-5 text-pink-400" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" title="Enviar link para definir senha" onClick={() => handleSendResetLink(member.email)}>
                                    <MailIcon className="w-5 h-5" />
                                </Button>
                                {hasPermission(Permission.UPDATE_MEMBERS) && (
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                                        <EditIcon className="w-5 h-5" />
                                    </Button>
                                )}
                                {hasPermission(Permission.DELETE_MEMBERS) && (
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(member.id)}>
                                        <TrashIcon className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        {allMembers.length === 0 ? 'Nenhum aluno cadastrado ainda.' : 'Nenhum aluno encontrado com os filtros aplicados.'}
                    </div>
                )}
            </div>
      </div>
      
      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredMembers.length}
        itemsPerPage={pagination.ITEMS_PER_PAGE}
      />
      
      {isModalOpen && (
        <MemberFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          addMember={addMember}
          updateMember={updateMember}
          member={editingMember}
          plans={plans}
        />
      )}

      {isConfirmModalOpen && (
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão de Aluno"
            message="Você tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
          />
      )}

      {reengagementModalData && (
        <AIReengagementModal
            isOpen={!!reengagementModalData}
            onClose={() => setReengagementModalData(null)}
            member={reengagementModalData.member}
            plan={reengagementModalData.plan}
        />
      )}
    </div>
  );
};
