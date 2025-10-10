
import React, { useState, useMemo } from 'react';
import type { Payment, Member, Plan } from '../types';
import { Button } from './ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon, CreditCardIcon, DollarSignIcon, AlertTriangleIcon, CheckCircleIcon } from './ui/Icons';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { PaymentStatusBadge } from './ui/Badges';
import { PaymentFormModal } from './PaymentFormModal';
import { PaymentStatus, Permission } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Skeleton } from './ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Pagination } from './ui/Pagination';
import { Avatar } from './ui/Avatar';

const PaymentsListSkeleton: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <Card>
            <CardContent className="p-4">
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
    </div>
);

const SortIcon: React.FC<{ direction?: 'ascending' | 'descending' }> = ({ direction }) => {
  if (!direction) {
    return <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
  }
  if (direction === 'ascending') {
    return <svg className="w-4 h-4 text-gray-700 dark:text-gray-300 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
  }
  return <svg className="w-4 h-4 text-gray-700 dark:text-gray-300 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
};

const StatCard: React.FC<{ title: string; value: string; count: number; icon: React.ReactNode }> = ({ title, value, count, icon }) => (
  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg flex items-start">
    <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{count} pagamentos</p>
    </div>
  </div>
);

type SortableKeys = keyof Payment | 'memberName' | 'planName';

export const PaymentsList: React.FC = () => {
  const { payments, members, plans, addPayment, updatePayment, deletePayment, hasPermission, isLoading } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({ searchTerm: '', status: 'all', startDate: '', endDate: '' });
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const memberMap = useMemo(() => members.reduce((acc, member) => ({ ...acc, [member.id]: member }), {} as Record<string, Member>), [members]);
  const planMap = useMemo(() => plans.reduce((acc, plan) => ({ ...acc, [plan.id]: plan }), {} as Record<string, Plan>), [plans]);

  const processedPayments = useMemo(() => {
    const filtered = payments.filter(p => {
        const memberName = memberMap[p.memberId]?.name || '';
        const searchMatch = filters.searchTerm === '' || memberName.toLowerCase().includes(filters.searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase());
        const statusMatch = filters.status === 'all' || p.status === filters.status;
        const startDateMatch = filters.startDate === '' || new Date(new Date(p.date).setHours(0,0,0,0)) >= new Date(new Date(filters.startDate).setHours(0,0,0,0));
        const endDateMatch = filters.endDate === '' || new Date(new Date(p.date).setHours(0,0,0,0)) <= new Date(new Date(filters.endDate).setHours(0,0,0,0));
        return searchMatch && statusMatch && startDateMatch && endDateMatch;
    });

    return filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'memberName') {
            aValue = memberMap[a.memberId]?.name || '';
            bValue = memberMap[b.memberId]?.name || '';
        } else if (sortConfig.key === 'planName') {
            aValue = planMap[a.planId]?.name || '';
            bValue = planMap[b.planId]?.name || '';
        } else {
            aValue = a[sortConfig.key as keyof Payment];
            bValue = b[sortConfig.key as keyof Payment];
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });
  }, [payments, filters, sortConfig, memberMap, planMap]);
  
  const totalPages = Math.ceil(processedPayments.length / ITEMS_PER_PAGE);
  const currentPayments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return processedPayments.slice(start, end);
  }, [processedPayments, currentPage]);

  const kpiData = useMemo(() => {
    return processedPayments.reduce((acc, p) => {
        if(p.status === PaymentStatus.Paid) {
            acc.paid.total += p.amount;
            acc.paid.count++;
        } else if (p.status === PaymentStatus.Pending) {
            acc.pending.total += p.amount;
            acc.pending.count++;
        } else if (p.status === PaymentStatus.Overdue) {
            acc.overdue.total += p.amount;
            acc.overdue.count++;
        }
        return acc;
    }, {
        paid: { total: 0, count: 0 },
        pending: { total: 0, count: 0 },
        overdue: { total: 0, count: 0 },
    });
  }, [processedPayments]);

  const statCards = useMemo(() => ([
    { title: "Recebido", value: kpiData.paid.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), count: kpiData.paid.count, icon: <CheckCircleIcon className="w-6 h-6"/> },
    { title: "Pendente", value: kpiData.pending.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), count: kpiData.pending.count, icon: <CreditCardIcon className="w-6 h-6"/> },
    { title: "Vencido", value: kpiData.overdue.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), count: kpiData.overdue.count, icon: <AlertTriangleIcon className="w-6 h-6"/> },
    { title: "Total", value: (kpiData.paid.total + kpiData.pending.total + kpiData.overdue.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), count: processedPayments.length, icon: <DollarSignIcon className="w-6 h-6"/> }
  ]), [kpiData, processedPayments.length]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleAddNew = () => { setEditingPayment(null); setIsModalOpen(true); };
  const handleEdit = (payment: Payment) => { setEditingPayment(payment); setIsModalOpen(true); };
  const handleDeleteRequest = (id: string) => { setPaymentToDelete(id); setIsConfirmModalOpen(true); };
  const handleConfirmDelete = () => {
    if (paymentToDelete) deletePayment(paymentToDelete);
    setIsConfirmModalOpen(false);
    setPaymentToDelete(null);
  };
  
  const renderSortableHeader = (label: string, key: SortableKeys) => (
    <th className="p-4 font-semibold">
        <button className="flex items-center w-full text-left uppercase text-sm text-gray-600 dark:text-gray-300" onClick={() => requestSort(key)}>
            {label}
            <SortIcon direction={sortConfig.key === key ? sortConfig.direction : undefined} />
        </button>
    </th>
  );

  if (isLoading) return <PaymentsListSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Controle de Pagamentos</h2>
        {hasPermission(Permission.CREATE_PAYMENTS) && (
            <Button onClick={handleAddNew}>
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Registrar Pagamento
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
            <div key={card.title} className="animate-stagger" style={{ animationDelay: `${index * 100}ms` }}>
                <StatCard {...card} />
            </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <input type="text" name="searchTerm" placeholder="Buscar por aluno ou descrição..." value={filters.searchTerm} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    <option value="all">Todos os Status</option>
                    {/* FIX: Explicitly cast enum value to string for key prop */}
                    {Object.values(PaymentStatus).map(s => <option key={s as string} value={s}>{s}</option>)}
                </select>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200" />
            </div>
        </CardContent>
      </Card>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
        {/* Table View */}
        <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  {renderSortableHeader('Aluno', 'memberName')}
                  {renderSortableHeader('Plano', 'planName')}
                  {renderSortableHeader('Valor', 'amount')}
                  {renderSortableHeader('Vencimento', 'date')}
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300">Pagamento</th>
                  {renderSortableHeader('Status', 'status')}
                  <th className="p-4 font-semibold uppercase text-sm text-gray-600 dark:text-gray-300 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentPayments.length > 0 ? currentPayments.map((p, index) => (
                  <tr 
                    key={p.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 animate-stagger" 
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                        <div className="flex items-center">
                            <Avatar name={memberMap[p.memberId]?.name} />
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{memberMap[p.memberId]?.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{memberMap[p.memberId]?.email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{planMap[p.planId]?.name || 'Avulso'}</td>
                    <td className="p-4 font-semibold text-gray-800 dark:text-gray-100">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.paidDate ? new Date(p.paidDate).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="p-4"><PaymentStatusBadge status={p.status} /></td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {hasPermission(Permission.UPDATE_PAYMENTS) && <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><EditIcon className="w-5 h-5" /></Button>}
                          {hasPermission(Permission.DELETE_PAYMENTS) && <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(p.id)}><TrashIcon className="w-5 h-5" /></Button>}
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="text-center p-8 text-gray-500 dark:text-gray-400">Nenhum pagamento encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-4">
            {currentPayments.length > 0 ? (
                currentPayments.map((p, index) => (
                    <div 
                        key={p.id} 
                        className="bg-slate-50 dark:bg-gray-900/40 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 animate-stagger"
                        style={{ animationDelay: `${index * 70}ms` }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                                <Avatar name={memberMap[p.memberId]?.name} />
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-100">{memberMap[p.memberId]?.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{planMap[p.planId]?.name || 'Avulso'}</p>
                                </div>
                            </div>
                            <PaymentStatusBadge status={p.status} />
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Valor</p>
                                <p className="font-semibold text-lg text-primary-600 dark:text-primary-400">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Vencimento</p>
                                <p className="font-medium text-gray-700 dark:text-gray-200">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                            {p.paidDate && (
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Pago em</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">{new Date(p.paidDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-1">
                            {hasPermission(Permission.UPDATE_PAYMENTS) && <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><EditIcon className="w-5 h-5" /></Button>}
                            {hasPermission(Permission.DELETE_PAYMENTS) && <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteRequest(p.id)}><TrashIcon className="w-5 h-5" /></Button>}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    {payments.length === 0 ? 'Nenhum pagamento registrado ainda.' : 'Nenhum pagamento encontrado com os filtros aplicados.'}
                </div>
            )}
        </div>
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={processedPayments.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {isModalOpen && <PaymentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} addPayment={addPayment} updatePayment={updatePayment} payment={editingPayment} members={members} plans={plans} />}
      {isConfirmModalOpen && <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" message="Você tem certeza que deseja excluir este registro de pagamento? Esta ação não pode ser desfeita." />}
    </div>
  );
};