
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Payment } from '../types';
import { PaymentStatus } from '../types';
import { Button } from './ui/Button';
import { PaymentStatusBadge } from './ui/Badges';
import { useAppContext } from '../contexts/AppContext';
import { Skeleton } from './ui/Skeleton';
import { AIInsightCard, AIInsightCardSkeleton } from './AIInsightCard';

const ReportsSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-8">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
        <AIInsightCardSkeleton />
        <Skeleton className="h-64 w-full" />
    </div>
);

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

const currencyFormatter = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const shortCurrencyFormatter = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label || payload[0].name}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.fill || pld.stroke }}>
                        {`${pld.name}: ${formatter(pld.value)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const Reports: React.FC = () => {
  const { payments, members, plans, isLoading, getReportInsights } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [insight, setInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name || 'Desconhecido';
  const getPlanName = (planId: string) => plans.find(p => p.id === planId)?.name || 'N/A';

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      paymentDate.setHours(0, 0, 0, 0);

      let start: Date | null = null;
      if (startDate) {
        const [y, m, d] = startDate.split('-').map(Number);
        start = new Date(y, m - 1, d);
      }
      
      let end: Date | null = null;
      if (endDate) {
        const [y, m, d] = endDate.split('-').map(Number);
        end = new Date(y, m - 1, d);
      }

      const statusMatch = statusFilter === 'all' || payment.status === statusFilter;
      const startDateMatch = !start || paymentDate >= start;
      const endDateMatch = !end || paymentDate <= end;
      
      return statusMatch && startDateMatch && endDateMatch;
    });
  }, [payments, statusFilter, startDate, endDate]);

  const monthlyRevenueData = useMemo(() => {
    const revenueByMonth: { [key: string]: { revenue: number, date: Date } } = {};
    filteredPayments.forEach(p => {
        if (p.status === PaymentStatus.Paid) {
            const paymentDate = new Date(p.date);
            const year = paymentDate.getFullYear();
            const month = paymentDate.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`;
            
            if (!revenueByMonth[key]) {
                revenueByMonth[key] = { revenue: 0, date: new Date(year, month, 1) };
            }
            revenueByMonth[key].revenue += p.amount;
        }
    });

    return Object.values(revenueByMonth)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(item => ({
            name: item.date.toLocaleString('pt-BR', { month: 'short' }).replace(/^\w/, c => c.toUpperCase()).replace('.',''),
            Receita: item.revenue,
    }));
  }, [filteredPayments]);

  const planDistributionData = useMemo(() => {
    const revenueByPlan: { [key: string]: number } = {};
    filteredPayments.forEach(p => {
        if (p.status === PaymentStatus.Paid) {
            const planName = getPlanName(p.planId);
            revenueByPlan[planName] = (revenueByPlan[planName] || 0) + p.amount;
        }
    });
    return Object.entries(revenueByPlan).map(([name, value]) => ({ name, value }));
  }, [filteredPayments, plans]);

  const reportSummary = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const paid = filteredPayments.filter(p => p.status === PaymentStatus.Paid).reduce((sum, p) => sum + p.amount, 0);
    const pending = filteredPayments.filter(p => p.status === PaymentStatus.Pending).reduce((sum, p) => sum + p.amount, 0);
    const overdue = filteredPayments.filter(p => p.status === PaymentStatus.Overdue).reduce((sum, p) => sum + p.amount, 0);
    return {
      totalAmount: total,
      paidAmount: paid,
      pendingAmount: pending,
      overdueAmount: overdue,
      totalPayments: filteredPayments.length,
      paidCount: filteredPayments.filter(p => p.status === PaymentStatus.Paid).length,
      pendingCount: filteredPayments.filter(p => p.status === PaymentStatus.Pending).length,
      overdueCount: filteredPayments.filter(p => p.status === PaymentStatus.Overdue).length,
    };
  }, [filteredPayments]);

  useEffect(() => {
    if (!isLoading && getReportInsights && filteredPayments.length > 0) {
      setIsInsightLoading(true);
      const reportContext = {
        filtros: {
          status: statusFilter,
          dataInicio: startDate,
          dataFim: endDate,
        },
        sumario: reportSummary,
        receitaMensal: monthlyRevenueData,
        distribuicaoPlanos: planDistributionData,
      };
      
      getReportInsights(reportContext)
        .then(setInsight)
        .finally(() => setIsInsightLoading(false));
    } else if (!isLoading && filteredPayments.length === 0) {
      setInsight("Não há dados suficientes no período selecionado para gerar uma análise.");
      setIsInsightLoading(false);
    }
  }, [filteredPayments, isLoading, getReportInsights, reportSummary, monthlyRevenueData, planDistributionData, statusFilter, startDate, endDate]);


  const handleExportCSV = () => {
    const headers = ['Nome do Aluno', 'Plano', 'Valor', 'Data de Pagamento', 'Status'];
    const rows = filteredPayments.map(p => [
        `"${getMemberName(p.memberId)}"`,
        `"${getPlanName(p.planId)}"`,
        p.amount.toFixed(2),
        new Date(p.date).toLocaleDateString('pt-BR'),
        p.status
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_pagamentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
      return <ReportsSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Relatórios de Pagamentos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
          >
            <option value="all">Todos</option>
            {/* FIX: Explicitly cast enum value to string for key prop */}
            {Object.values(PaymentStatus).map(s => <option key={s as string} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Início</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Fim</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700" />
        </div>
        <div className="self-end">
            <Button onClick={handleExportCSV} className="w-full">Exportar para CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Receita Mensal (Filtrada)</h3>
            <ResponsiveContainer width="100%" height={300}>
                {monthlyRevenueData.length > 0 ? (
                    <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={shortCurrencyFormatter} />
                        <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} content={<CustomTooltip formatter={currencyFormatter} />} />
                        <Bar dataKey="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        Sem dados para exibir
                    </div>
                )}
            </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Distribuição de Receita por Plano</h3>
            <ResponsiveContainer width="100%" height={300}>
                {planDistributionData.length > 0 ? (
                    <PieChart>
                        <Pie data={planDistributionData} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value" nameKey="name" label={({ percent }) => (percent * 100) > 3 ? `${(percent * 100).toFixed(0)}%` : ''} >
                            {planDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip formatter={currencyFormatter} />} />
                        <Legend />
                    </PieChart>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        Sem dados para exibir
                    </div>
                )}
            </ResponsiveContainer>
        </div>
      </div>

      {isInsightLoading ? <AIInsightCardSkeleton /> : <AIInsightCard insight={insight} />}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 uppercase">
              <th className="p-4 font-semibold">Nome do Aluno</th>
              <th className="p-4 font-semibold">Plano</th>
              <th className="p-4 font-semibold">Valor</th>
              <th className="p-4 font-semibold">Data de Pagamento</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPayments.length > 0 ? filteredPayments.map((payment, index) => (
              <tr 
                key={payment.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 animate-stagger"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{getMemberName(payment.memberId)}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">{getPlanName(payment.planId)}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                <td className="p-4"><PaymentStatusBadge status={payment.status} /></td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">
                  Nenhum pagamento encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};