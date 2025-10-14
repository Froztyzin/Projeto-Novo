import React, { useState, useMemo, useEffect } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PaymentStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { AIInsightCard, AIInsightCardSkeleton } from './AIInsightCard';
import { PaymentsChart } from './PaymentsChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Skeleton } from './ui/Skeleton';


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

export const Reports: React.FC = () => {
    const { payments, plans, getReportInsights, isLoading } = useAppContext();
    const [insight, setInsight] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(true);

    const reportData = useMemo(() => {
        if (isLoading) return null;

        const totalRevenue = payments
            .filter(p => p.status === PaymentStatus.Paid)
            .reduce((sum, p) => sum + p.amount, 0);

        const paymentsByStatus = payments.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<PaymentStatus, number>);

        const revenueByPlan = payments
            .filter(p => p.status === PaymentStatus.Paid)
            .reduce((acc, p) => {
                const planName = plans.find(pl => pl.id === p.planId)?.name || 'Avulso';
                acc[planName] = (acc[planName] || 0) + p.amount;
                return acc;
            }, {} as Record<string, number>);

        return {
            totalRevenue,
            paymentsByStatus,
            revenueByPlan: Object.entries(revenueByPlan).map(([name, value]) => ({ name, value })),
        };
    }, [payments, plans, isLoading]);
    
    useEffect(() => {
        if (!isLoading && reportData && getReportInsights) {
            setIsInsightLoading(true);
            getReportInsights(reportData)
                .then(setInsight)
                .finally(() => setIsInsightLoading(false));
        }
    }, [reportData, isLoading, getReportInsights]);

    if (isLoading) {
        return <ReportsSkeleton />;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Visão Geral dos Relatórios</CardTitle>
                    <CardDescription>Análise financeira e de pagamentos da academia.</CardDescription>
                </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Receita por Plano</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportData?.revenueByPlan}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {reportData?.revenueByPlan.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={currencyFormatter} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <PaymentsChart payments={payments} />
            </div>

            {isInsightLoading ? <AIInsightCardSkeleton /> : <AIInsightCard insight={insight} />}
        </div>
    );
};
