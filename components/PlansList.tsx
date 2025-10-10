import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Plan } from '../types';
import { Permission } from '../types';
import { Button } from './ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon, PackageIcon } from './ui/Icons';
import { PlanFormModal } from './PlanFormModal';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { Skeleton } from './ui/Skeleton';
import { Pagination } from './ui/Pagination';

const PlansListSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
        </div>
    </div>
);


export const PlansList: React.FC = () => {
  const { plans, addPlan, updatePlan, deletePlan, hasPermission, isLoading } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const totalPages = Math.ceil(plans.length / ITEMS_PER_PAGE);
  const currentPlans = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return plans.slice(start, end);
  }, [plans, currentPage]);


  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (planId: string) => {
    setPlanToDelete(planId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
        deletePlan(planToDelete);
    }
    setIsConfirmModalOpen(false);
    setPlanToDelete(null);
  };
  
  if (isLoading) {
      return <PlansListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        {hasPermission(Permission.CREATE_PLANS) && (
            <div className="flex justify-end mb-6">
              <Button onClick={handleAddNew} className="flex items-center">
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Adicionar Plano
              </Button>
            </div>
        )}
        
        {currentPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPlans.map((plan, index) => (
              <div 
                key={plan.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition-shadow animate-stagger"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div>
                  <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">{plan.name}</h3>
                  <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 my-4">{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })}</p>
                  <p className="text-gray-500 dark:text-gray-400">{plan.durationInMonths} Mês{plan.durationInMonths > 1 ? 'es' : ''}</p>
                  {plan.dueDateDayOfMonth && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Dia de Vencimento: <span className="font-semibold">{plan.dueDateDayOfMonth}</span>
                    </p>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  {hasPermission(Permission.UPDATE_PLANS) && (
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                        <EditIcon className="w-5 h-5" />
                      </Button>
                  )}
                  {hasPermission(Permission.DELETE_PLANS) && (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(plan.id)}>
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
              <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">Nenhum plano cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {plans.length === 0 ? "Comece adicionando um novo plano de matrícula." : "Nenhum plano encontrado."}
              </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={plans.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {isModalOpen && (
        <PlanFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          addPlan={addPlan}
          updatePlan={updatePlan}
          plan={editingPlan}
        />
      )}

      {isConfirmModalOpen && (
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Confirmar Exclusão"
            message="Você tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita."
          />
      )}
    </div>
  );
};