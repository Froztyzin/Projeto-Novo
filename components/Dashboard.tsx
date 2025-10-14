import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import { StatCard } from './ui/StatCard';
import { DollarSignIcon, UsersRoundIcon, AlertTriangleIcon, ReceiptIcon } from './ui/Icons';
import { PaymentStatus, MemberStatus } from '../types';
import { PaymentStatusBadge } from './ui/Badges';
import { Skeleton } from './ui/Skeleton';
import { AIInsightCard, AIInsightCardSkeleton } from './AIInsightCard';

type Period = 'thisMonth' | 'last30' | 'thisYear' | 'all';

const CustomFinancialTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.fill }}>
                        {`${pld.name}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pld.value as number)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const CustomMemberTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <p key={index} style={{ color: pld.stroke }}>
                        {`${pld.name}: ${pld.value} alunos`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-8">
        <div className="flex justify-end mb-6">
            <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[370px]" />
            <Skeleton className="h-[370px]" />
        </div>
        <AIInsightCardSkeleton />
        <Skeleton className="h-60" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-60" />
            <Skeleton className="h-60" />
        </div>
    </div>
);


const PeriodFilter: React.FC<{ selected: Period; onSelect: (period: Period) => void }> = ({ selected, onSelect }) => {
    const options: { key: Period; label: string }[] = [
        { key: 'thisMonth', label: 'Este Mês' },
        { key: 'last30', label: 'Últimos 30 dias' },
        { key: 'thisYear', label: 'Este Ano' },
        { key: 'all', label: 'Todo o Período' },
    ];

    return (
        <div className="flex justify-center sm:justify-end mb-6">
            <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-lg flex flex-wrap justify-center items-center gap-1">
                {options.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => onSelect(opt.key)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            selected === opt.key
                                ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/50'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
    const { members, payments, plans, expenses, isLoading, getDashboardInsights } = useAppContext();
    const [period, setPeriod] = useState<Period>('thisMonth');
    const [insight, setInsight] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(true);

    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = new Date();

        switch (period) {
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'last30':
                start = new Date();
                start.setDate(now.getDate() - 30);
                break;
            case 'thisYear':
                start = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all':
            default:
                start = null;
                end = null;
                break;
        }
        
        start?.setHours(0, 0, 0, 0);
        end?.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
    }, [period]);

    const filteredData = useMemo(() => {
        if (isLoading) return { revenueInPeriod: 0, expensesInPeriod: 0, newMembersCount: 0, overdueInPeriod: 0, recentPayments: [] };
        
        const filteredPayments = payments.filter(p => {
            if (!startDate && !endDate) return true;
            const paymentDate = new Date(p.date);
            return (!startDate || paymentDate >= startDate) && (!endDate || paymentDate <= endDate);
        });

        const filteredExpenses = expenses.filter(e => {
            if (!startDate && !endDate) return true;
            const expenseDate = new Date(e.date);
            return (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate);
        });

        const newMembers = members.filter(m => {
            if (!startDate && !endDate) return true;
            const joinDate = new Date(m.joinDate);
            return (!startDate || joinDate >= startDate) && (!endDate || joinDate <= endDate);
        });

        const revenueInPeriod = filteredPayments
            .filter(p => p.status === PaymentStatus.Paid)
            .reduce((sum, p) => sum + p.amount, 0);

        const expensesInPeriod = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

        const overdueInPeriod = filteredPayments.filter(p => p.status === PaymentStatus.Overdue).length;

        return {
            revenueInPeriod,
            expensesInPeriod,
            newMembersCount: newMembers.length,
            overdueInPeriod,
            recentPayments: filteredPayments.slice(0, 5)
        };
    }, [payments, expenses, members, startDate, endDate, isLoading]);

    const chartData = useMemo(() => {
        if (isLoading) return { financialChart: [], memberGrowthChart: [] };

        const months: { [key: string]: { revenue: number, expense: number } } = {};
        const memberCount: { [key: string]: { count: number, date: Date } } = {};

        const allTimePayments = payments.filter(p => p.status === PaymentStatus.Paid);
        const allTimeExpenses = expenses;

        const earliestDate = members.length > 0 ? new Date(Math.min(
            ...members.map(m => new Date(m.joinDate).getTime()),
            ...allTimePayments.map(p => new Date(p.date).getTime())
        )) : new Date();

        let currentDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
        const today = new Date();
        const endChartDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        while(currentDate <= endChartDate) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const key = `${year}-${String(month).padStart(2, '0')}`;
            
            // Revenue and Expense
            const monthlyRevenue = allTimePayments
                .filter(p => new Date(p.date).getFullYear() === year && new Date(p.date).getMonth() === month)
                .reduce((sum, p) => sum + p.amount, 0);
            
            const monthlyExpense = allTimeExpenses
                .filter(e => new Date(e.date).getFullYear() === year && new Date(e.date).getMonth() === month)
                .reduce((sum, e) => sum + e.amount, 0);
            
            months[key] = { revenue: monthlyRevenue, expense: monthlyExpense };
            
            // Member Count
            const activeMembersThisMonth = members.filter(m => new Date(m.joinDate) <= new Date(year, month + 1, 0)).length;
            memberCount[key] = {
                count: activeMembersThisMonth,
                date: new Date(currentDate)
            };
            
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        const financialChart = Object.entries(months).map(([key, value]) => ({
            name: new Date(key + '-02').toLocaleString('pt-BR', { month: 'short' }).replace(/^\w/, c => c.toUpperCase()),
            Receita: value.revenue,
            Despesa: value.expense,
        })).slice(-12); // Last 12 months

        const memberGrowthChart = Object.values(memberCount).sort((a,b) => a.date.getTime() - b.date.getTime()).map(item => ({
             name: item.date.toLocaleString('pt-BR', { month: 'short' }).replace(/^\w/, c => c.toUpperCase()),
             Alunos: item.count,
        })).slice(-12); // Last 12 months

        return { financialChart, memberGrowthChart };
    }, [payments, expenses, members, isLoading]);

    const immediateActions = useMemo(() => {
        if (isLoading) return { overdue: [], expiring: [] };

        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const overdueActions = payments
            .filter(p => p.status === PaymentStatus.Overdue)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
        
        const expiringPlansActions: { member: typeof members[0], plan: typeof plans[0], expiryDate: Date }[] = [];
        
        const activeMembers = members.filter(m => m.status === MemberStatus.Active);

        activeMembers.forEach(member => {
            const memberPayments = payments.filter(p => p.memberId === member.id && p.status === PaymentStatus.Paid)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (memberPayments.length > 0) {
                const lastPayment = memberPayments[0];
                const plan = plans.find(p => p.id === lastPayment.planId);
                if (plan) {
                    const expiryDate = new Date(lastPayment.date);
                    expiryDate.setMonth(expiryDate.getMonth() + plan.durationInMonths);

                    if (expiryDate > today && expiryDate <= sevenDaysFromNow) {
                        expiringPlansActions.push({ member, plan, expiryDate });
                    }
                }
            }
        });

        return {
            overdue: overdueActions,
            expiring: expiringPlansActions.sort((a,b) => a.expiryDate.getTime() - b.expiryDate.getTime())
        };
    }, [payments, members, plans, isLoading]);

    useEffect(() => {
        if (!isLoading && getDashboardInsights) {
            setIsInsightLoading(true);
            const insightContext = {
                periodo: period,
                kpis: filteredData,
                historicoFinanceiro: chartData.financialChart.slice(-3),
                historicoAlunos: chartData.memberGrowthChart.slice(-3),
            };

            getDashboardInsights(insightContext)
                .then(setInsight)
                .finally(() => setIsInsightLoading(false));
        }
    }, [period, filteredData, chartData, isLoading, getDashboardInsights]);

    const statCards = useMemo(() => ([
        { title: "Receita no Período", value: filteredData.revenueInPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <DollarSignIcon className="h-6 w-6 text-primary-700 dark:text-primary-300" />, colorClass: "bg-primary-100 dark:bg-primary-500/10" },
        { title: "Novos Alunos", value: filteredData.newMembersCount, icon: <UsersRoundIcon className="h-6 w-6 text-blue-700 dark:text-blue-300" />, colorClass: "bg-blue-100 dark:bg-blue-500/10" },
        { title: "Despesas no Período", value: filteredData.expensesInPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: <ReceiptIcon className="h-6 w-6 text-orange-700 dark:text-orange-300" />, colorClass: "bg-orange-100 dark:bg-orange-500/10" },
        { title: "Pagamentos Vencidos", value: filteredData.overdueInPeriod, icon: <AlertTriangleIcon className="h-6 w-6 text-red-700 dark:text-red-300" />, colorClass: "bg-red-100 dark:bg-red-500/10" },
    ]), [filteredData]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8">
            <PeriodFilter selected={period} onSelect={setPeriod} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div key={card.title} className="animate-stagger" style={{ animationDelay: `${index * 100}ms` }}>
                        <StatCard {...card} />
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-stagger" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Receitas vs. Despesas (Últimos 12 meses)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        {chartData.financialChart.length > 0 ? (
                            <BarChart data={chartData.financialChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value as number)} />
                                <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} content={<CustomFinancialTooltip />} />
                                <Legend />
                                <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                Sem dados para exibir
                            </div>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Member Growth Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-stagger" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Evolução de Alunos (Últimos 12 meses)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        {chartData.memberGrowthChart.length > 0 ? (
                           <LineChart data={chartData.memberGrowthChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip cursor={{ stroke: 'rgba(128, 128, 128, 0.2)', strokeWidth: 2 }} content={<CustomMemberTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="Alunos" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                Sem dados para exibir
                            </div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* AI Insight Card */}
            <div className="animate-stagger" style={{ animationDelay: '400ms' }}>
                {isInsightLoading ? <AIInsightCardSkeleton /> : <AIInsightCard insight={insight} />}
            </div>

            {/* Recent Payments */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-stagger" style={{ animationDelay: '500ms' }}>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Pagamentos no Período</h3>
                <ul className="space-y-4">
                    {filteredData.recentPayments.length > 0 ? filteredData.recentPayments.map(payment => {
                        const member = members.find(m => m.id === payment.memberId);
                        return (
                            <li key={payment.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{member?.name || 'Aluno Desconhecido'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(payment.date).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-primary-600 dark:text-primary-400">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    <PaymentStatusBadge status={payment.status} />
                                </div>
                            </li>
                        );
                    }) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum pagamento encontrado no período selecionado.</p>}
                </ul>
            </div>
            
             {/* Immediate Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-stagger" style={{ animationDelay: '600ms' }}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Ações Pendentes (Vencidos)</h3>
                     <ul className="space-y-3">
                        {immediateActions.overdue.length > 0 ? immediateActions.overdue.map(payment => {
                            const member = members.find(m => m.id === payment.memberId);
                            return (
                                <li key={payment.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-red-800 dark:text-red-300">{member?.name || 'Aluno'}</p>
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            Vencido em: {new Date(payment.date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <p className="font-bold text-red-700 dark:text-red-200">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </li>
                            );
                        }) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum pagamento vencido.</p>}
                    </ul>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-stagger" style={{ animationDelay: '700ms' }}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Planos Expirando (Próx. 7 dias)</h3>
                     <ul className="space-y-3">
                        {immediateActions.expiring.length > 0 ? immediateActions.expiring.map(({ member, expiryDate }) => {
                            return (
                                <li key={member.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-yellow-800 dark:text-yellow-300">{member.name}</p>
                                    </div>
                                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-200">
                                        Expira em: {expiryDate.toLocaleDateString('pt-BR')}
                                    </p>
                                </li>
                            );
                        }) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum plano expirando nos próximos 7 dias.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};
