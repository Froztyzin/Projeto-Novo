import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Payment } from '../types';
import { PaymentStatus } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

// Tooltip customizado para formatar valores em BRL
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{label}</p>
                <p style={{ color: payload[0].fill }}>
                    {`${payload[0].name}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value as number)}`}
                </p>
            </div>
        );
    }
    return null;
};

// Formata os valores do eixo Y como moeda
const currencyFormatter = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

interface PaymentsChartProps {
  payments: Payment[];
}

export const PaymentsChart: React.FC<PaymentsChartProps> = ({ payments }) => {
  const monthlyRevenueData = useMemo(() => {
    const revenueByMonth: { [key: string]: { revenue: number, date: Date } } = {};
    
    payments.forEach(p => {
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
            name: item.date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace(/^\w/, c => c.toUpperCase()).replace('.',''),
            Receita: item.revenue,
    }));
  }, [payments]);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Pagamentos Recebidos por Mês</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                {monthlyRevenueData.length > 0 ? (
                    <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={currencyFormatter} />
                        <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="Receita" fill="rgb(var(--color-primary-500))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        Sem dados de pagamentos para exibir.
                    </div>
                )}
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
};
