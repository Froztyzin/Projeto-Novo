import React, { useState, useMemo, useEffect } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { PaymentStatus, ExpenseCategory } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { AIInsightCard, AIInsightCardSkeleton } from './AIInsightCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Skeleton } from './ui/Skeleton';
import { DollarSignIcon, ReceiptIcon, UsersIcon, TrendingUpIcon, ArrowUp, ArrowDown } from './ui/Icons';
import { PaymentStatusBadge } from './ui/Badges';

const ReportsSkeleton: React.FC = () => (
    <div className="space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Skeleton className="h-[400px] lg:col-span-3" />
            <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[300px]" />
            </div>
        </div>
        <AIInsightCardSkeleton />
        <Skeleton className="h-60" />
    </div>
);

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#f59e0b', '#6366f1'];
const currencyFormatter = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl text-sm">
                <p className="font-bold text-slate-100 mb-2">{label}</p>
                 {payload.map((pld: any) => (
                    <div key={pld.name} className="flex items-center justify-between space-x-4">
                        <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: pld.color || pld.stroke || pld.fill }}></span>
                            <span style={{ color: pld.color || pld.stroke || pld.fill }}>{pld.name}:</span>
                        </div>
                        <span className="font-semibold">{formatter(pld.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

type Period = 'thisMonth' | 'last30' | 'thisYear' | 'custom';

const PeriodFilter: React.FC<{ selected: Period; onSelect: (period: Period) => void }> = ({ selected, onSelect }) => {
    const options: { key: Period; label: string }[] = [
        { key: 'thisMonth', label: 'Este Mês' },
        { key: 'last30', label: 'Últimos 30 dias' },
        { key: 'thisYear', label: 'Este Ano' },
    ];

    return (
        <div className="flex justify-center sm:justify-end">
            <div className="bg-slate-800 p-1 rounded-lg flex flex-wrap justify-center items-center gap-1">
                {options.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => onSelect(opt.key)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            selected === opt.key
                                ? 'bg-slate-700 text-primary-400 shadow'
                                : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change: number | null, positiveIsGood?: boolean }> = ({ title, value, icon, change, positiveIsGood = true }) => {
    const isPositive = change !== null && (positiveIsGood ? change >= 0 : change < 0);
    const isNegative = change !== null && (positiveIsGood ? change < 0 : change >= 0);
    const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

    return (
        <Card className="overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== null && isFinite(change) && (
                     <p className={`text-xs mt-1 font-semibold flex items-center ${changeColor}`}>
                        {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {Math.abs(change).toFixed(1)}% vs. período anterior
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

const TopPerformerItem: React.FC<{ name: string, value: number, total: number }> = ({ name, value, total }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300 font-medium">{name}</span>
                <span className="text-slate-400">{currencyFormatter(value)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

export const Reports: React.FC = () => {
    const { payments, plans, expenses, members, getReportInsights, isLoading } = useAppContext();
    const [insight, setInsight] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('thisMonth');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });

    const [startDate, endDate, previousStartDate, previousEndDate] = useMemo(() => {
        const now = new Date();
        let start: Date, end: Date, prevStart: Date, prevEnd: Date;

        if (period === 'custom') {
            const customStart = customDates.start ? new Date(customDates.start + 'T00:00:00') : null;
            const customEnd = customDates.end ? new Date(customDates.end + 'T23:59:59') : null;

            if (customStart && customEnd && customStart <= customEnd) {
                start = customStart;
                end = customEnd;

                const diff = end.getTime() - start.getTime();
                prevEnd = new Date(start.getTime() - 1); // one millisecond before start
                prevStart = new Date(prevEnd.getTime() - diff);
            } else {
                // Default fallback if custom range is invalid/incomplete
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            }
        } else {
             switch (period) {
                case 'last30':
                    end = new Date();
                    start = new Date();
                    start.setDate(now.getDate() - 30);
                    prevEnd = new Date(start);
                    prevEnd.setDate(prevEnd.getDate() - 1);
                    prevStart = new Date(prevEnd);
                    prevStart.setDate(prevEnd.getDate() - 30);
                    break;
                case 'thisYear':
                    start = new Date(now.getFullYear(), 0, 1);
                    end = new Date(now.getFullYear(), 11, 31);
                    prevStart = new Date(now.getFullYear() - 1, 0, 1);
                    prevEnd = new Date(now.getFullYear() - 1, 11, 31);
                    break;
                case 'thisMonth':
                default:
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                    break;
            }
        }
        
        start?.setHours(0, 0, 0, 0);
        end?.setHours(23, 59, 59, 999);
        prevStart?.setHours(0, 0, 0, 0);
        prevEnd?.setHours(23, 59, 59, 999);
        return [start, end, prevStart, prevEnd];
    }, [period, customDates]);

    const handlePeriodSelect = (selectedPeriod: Period) => {
        setPeriod(selectedPeriod);
        if (selectedPeriod !== 'custom') {
            setCustomDates({ start: '', end: '' });
        }
    };

    const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomDates(prev => {
            const newDates = { ...prev, [name]: value };
            if (newDates.start && newDates.end) {
                setPeriod('custom');
            }
            return newDates;
        });
    };

    const calculateMetrics = (start: Date, end: Date) => {
        if (!start || !end) return { totalRevenue: 0, totalExpenses: 0, newMembers: 0 };
        const dateFilter = (item: { date: Date }) => {
            const itemDate = new Date(item.date);
            return itemDate >= start && itemDate <= end;
        };
        const memberJoinFilter = (m: { joinDate: Date }) => {
            const joinDate = new Date(m.joinDate);
            return joinDate >= start && joinDate <= end;
        };
        const filteredPayments = payments.filter(dateFilter);
        const filteredExpenses = expenses.filter(dateFilter);
        const filteredMembers = members.filter(memberJoinFilter);

        const totalRevenue = filteredPayments.filter(p => p.status === PaymentStatus.Paid).reduce((sum, p) => sum + p.amount, 0);
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        return { totalRevenue, totalExpenses, newMembers: filteredMembers.length };
    };

    const processedData = useMemo(() => {
        if (isLoading) return null;

        const currentMetrics = calculateMetrics(startDate, endDate);
        const previousMetrics = calculateMetrics(previousStartDate, previousEndDate);
        
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };

        const revenueChange = calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue);
        const expensesChange = calculateChange(currentMetrics.totalExpenses, previousMetrics.totalExpenses);
        const netIncome = currentMetrics.totalRevenue - currentMetrics.totalExpenses;
        const previousNetIncome = previousMetrics.totalRevenue - previousMetrics.totalExpenses;
        const netIncomeChange = calculateChange(netIncome, previousNetIncome);
        const newMembersChange = calculateChange(currentMetrics.newMembers, previousMetrics.newMembers);

        const dateFilter = (item: { date: Date }) => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        };
        const filteredPayments = payments.filter(dateFilter);
        const filteredExpenses = expenses.filter(dateFilter);

        const recentPayments = filteredPayments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(p => ({
                ...p,
                memberName: members.find(m => m.id === p.memberId)?.name || 'Desconhecido',
            }));

        const revenueByPlan = filteredPayments
            .filter(p => p.status === PaymentStatus.Paid)
            .reduce((acc, p) => {
                const planName = plans.find(pl => pl.id === p.planId)?.name || 'Avulso';
                acc[planName] = (acc[planName] || 0) + p.amount;
                return acc;
            }, {} as Record<string, number>);
        
        const expensesByCategory = filteredExpenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);
        
        const financialTrendData = (() => {
            const data: Record<string, { revenue: number, expense: number, date: Date }> = {};
            const allItems = [
                ...filteredPayments.filter(p => p.status === PaymentStatus.Paid).map(p => ({...p, type: 'revenue'})),
                ...filteredExpenses.map(e => ({...e, date: e.date, amount: e.amount, type: 'expense' }))
            ];

            allItems.forEach(item => {
                const date = new Date(item.date);
                const key = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
                if (!data[key]) data[key] = { revenue: 0, expense: 0, date: new Date(key) };
                if (item.type === 'revenue') data[key].revenue += item.amount;
                else data[key].expense += item.amount;
            });

            return Object.values(data)
                .sort((a,b) => a.date.getTime() - b.date.getTime())
                .map(item => ({
                    name: item.date.toLocaleString('pt-BR', { month: 'short', year: period === 'thisYear' || period === 'custom' ? 'numeric' : undefined }).replace(/^\w/, c => c.toUpperCase()),
                    Receita: item.revenue,
                    Despesa: item.expense,
                    Lucro: item.revenue - item.expense,
            }));
        })();

        return {
            totalRevenue: currentMetrics.totalRevenue,
            totalExpenses: currentMetrics.totalExpenses,
            netIncome,
            newMembers: currentMetrics.newMembers,
            revenueChange, expensesChange, netIncomeChange, newMembersChange,
            recentPayments,
            revenueByPlan: Object.entries(revenueByPlan).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
            expensesByCategory: Object.entries(expensesByCategory).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
            financialTrendData
        };
    }, [payments, plans, expenses, members, startDate, endDate, previousStartDate, previousEndDate, isLoading, period]);
    
    useEffect(() => {
        if (!isLoading && processedData && getReportInsights) {
            setIsInsightLoading(true);
            getReportInsights({ period, ...processedData })
                .then(setInsight)
                .finally(() => setIsInsightLoading(false));
        }
    }, [processedData, isLoading, getReportInsights, period]);
    
    if (isLoading || !processedData) {
        return <ReportsSkeleton />;
    }

    const kpiCards = [
        { title: "Receita Bruta", value: currencyFormatter(processedData.totalRevenue), icon: <DollarSignIcon className="h-4 w-4 text-slate-400" />, change: processedData.revenueChange },
        { title: "Despesas Totais", value: currencyFormatter(processedData.totalExpenses), icon: <ReceiptIcon className="h-4 w-4 text-slate-400" />, change: processedData.expensesChange, positiveIsGood: false },
        { title: "Lucro Líquido", value: currencyFormatter(processedData.netIncome), icon: <TrendingUpIcon className="h-4 w-4 text-slate-400" />, change: processedData.netIncomeChange },
        { title: "Novos Alunos", value: `${processedData.newMembers}`, icon: <UsersIcon className="h-4 w-4 text-slate-400" />, change: processedData.newMembersChange },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Visão Geral dos Relatórios</h1>
                    <p className="text-slate-400 mt-1">Análise financeira e de desempenho da academia.</p>
                </div>
                 <div className="flex flex-wrap items-center justify-end gap-2">
                    <PeriodFilter selected={period} onSelect={handlePeriodSelect} />
                    <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg">
                        <input
                            type="date"
                            name="start"
                            value={customDates.start}
                            onChange={handleCustomDateChange}
                            aria-label="Data de início"
                            className="bg-slate-700 text-slate-300 rounded-md px-2 py-1.5 text-sm font-semibold border-none focus:ring-2 focus:ring-primary-500"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            name="end"
                            value={customDates.end}
                            onChange={handleCustomDateChange}
                            aria-label="Data de fim"
                            className="bg-slate-700 text-slate-300 rounded-md px-2 py-1.5 text-sm font-semibold border-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card, index) => (
                    <div key={card.title} className="animate-stagger" style={{ animationDelay: `${index * 100}ms`}}>
                        <StatCard {...card} />
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3 animate-stagger" style={{ animationDelay: '400ms'}}>
                    <CardHeader>
                        <CardTitle>Tendência Financeira</CardTitle>
                        <CardDescription>Evolução de receitas, despesas e lucro no período.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                             {processedData.financialTrendData.length > 0 ? (
                                <LineChart data={processedData.financialTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `${currencyFormatter(value as number).replace('R$', '')}`} />
                                    <Tooltip content={<CustomTooltip formatter={currencyFormatter} />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                                    <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Despesa" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Lucro" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                                </LineChart>
                            ) : (
                                 <div className="flex items-center justify-center h-full text-slate-500">Sem dados para exibir a tendência.</div>
                            )}
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 flex flex-col gap-8">
                    <Card className="flex-1 flex flex-col animate-stagger" style={{ animationDelay: '500ms'}}>
                        <CardHeader>
                            <CardTitle>Destaques do Período</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-300">Top Planos por Receita</h4>
                                {processedData.revenueByPlan.slice(0, 3).map(item => (
                                    <TopPerformerItem key={item.name} {...item} total={processedData.totalRevenue} />
                                ))}
                                {processedData.revenueByPlan.length === 0 && <p className="text-sm text-slate-500">Nenhuma receita.</p>}
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <h4 className="text-sm font-semibold text-slate-300">Maiores Despesas</h4>
                                {processedData.expensesByCategory.slice(0, 3).map(item => (
                                    <TopPerformerItem key={item.name} {...item} total={processedData.totalExpenses} />
                                ))}
                                 {processedData.expensesByCategory.length === 0 && <p className="text-sm text-slate-500">Nenhuma despesa.</p>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="animate-stagger" style={{ animationDelay: '600ms'}}>
                        <CardHeader>
                            <CardTitle>Receita por Plano</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={180}>
                                 {processedData.revenueByPlan.length > 0 ? (
                                    <PieChart>
                                        <Pie data={processedData.revenueByPlan} cx="50%" cy="50%" labelLine={false} innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                                            {processedData.revenueByPlan.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip formatter={currencyFormatter} />} />
                                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                                    </PieChart>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-500">Nenhuma receita no período.</div>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <div className="animate-stagger" style={{ animationDelay: '700ms'}}>
                {isInsightLoading ? <AIInsightCardSkeleton /> : <AIInsightCard insight={insight} />}
            </div>

            <Card className="animate-stagger" style={{ animationDelay: '800ms'}}>
                <CardHeader>
                    <CardTitle>Pagamentos Recentes no Período</CardTitle>
                    <CardDescription>Os últimos pagamentos registrados no período selecionado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flow-root">
                        <ul className="-my-4 divide-y divide-slate-800">
                            {processedData.recentPayments.length > 0 ? (
                                processedData.recentPayments.map(payment => (
                                    <li key={payment.id} className="flex items-center justify-between py-4">
                                        <div>
                                            <p className="font-semibold text-slate-100 truncate">{payment.memberName}</p>
                                            <p className="text-sm text-slate-400">Vencimento: {new Date(payment.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg text-primary-400">{currencyFormatter(payment.amount)}</p>
                                            <div className="mt-1">
                                                <PaymentStatusBadge status={payment.status} />
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center text-slate-500 py-8">
                                    Nenhum pagamento encontrado no período selecionado.
                                </li>
                            )}
                        </ul>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};