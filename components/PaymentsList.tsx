import React, { useState, useMemo } from 'react';
import type { Payment } from '../types';
import { Button } from './ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon, CreditCardIcon } from './ui/Icons';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { PaymentStatusBadge } from './ui/Badges';
import { PaymentFormModal } from './PaymentFormModal';
import { PaymentStatus, Permission } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Skeleton } from './ui/Skeleton';

const PaymentsListSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-6">
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    </div>
);

export const PaymentsList: React.FC = () => {
  const { payments, members, plans, addPayment, updatePayment, deletePayment, hasPermission, isLoading } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name || 'Desconhecido';

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const memberName = getMemberName(payment.memberId);
      const searchMatch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (payment.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || payment.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [payments, searchTerm, statusFilter, members]);

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingPayment(null);
    setIsModalOpen(true);
  };
  
  const handleDeleteRequest = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete);
    }
    setIsConfirmModalOpen(false);
    setPaymentToDelete(null);
  };
  
  if (isLoading) {
      return <PaymentsListSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Controle de Pagamentos</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar por aluno ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PaymentStatus | 'all')} className="w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <option value="all">Todos os Status</option>
                {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {hasPermission(Permission.CREATE_PAYMENTS) && (
            <Button onClick={handleAddNew} className="flex items-center justify-center">
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Registrar Pagamento
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 uppercase">
              <th className="p-4 font-semibold">Aluno</th>
              <th className="p-4 font-semibold">Descrição</th>
              <th className="p-4 font-semibold">Valor</th>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                <tr 
                  key={payment.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 animate-stagger"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{getMemberName(payment.memberId)}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{payment.description}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4"><PaymentStatusBadge status={payment.status} /></td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end">
                            {hasPermission(Permission.UPDATE_PAYMENTS) && (
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)}>
                                    <EditIcon className="w-5 h-5" />
                                </Button>
                            )}
                            {hasPermission(Permission.DELETE_PAYMENTS) && (
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(payment.id)}>
                                    <TrashIcon className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={6}>
                        <div className="text-center py-16">
                            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
                                {payments.length === 0 ? 'Nenhum pagamento registrado' : 'Nenhum pagamento encontrado'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {payments.length === 0 ? 'Registre o primeiro pagamento para começar.' : 'Tente ajustar os filtros de busca.'}
                            </p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <PaymentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          addPayment={addPayment}
          updatePayment={updatePayment}
          payment={editingPayment}
          members={members}
          plans={plans}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message="Você tem certeza que deseja excluir este registro de pagamento? Esta ação não pode ser desfeita."
        />
      )}
    </div>
  );
};