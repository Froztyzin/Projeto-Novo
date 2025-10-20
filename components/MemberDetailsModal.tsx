
import React, { useMemo, useState, useEffect } from 'react';
import type { Member, Plan, Payment } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { MemberStatusBadge, PaymentStatusBadge } from './ui/Badges';
import { useAppContext } from '../contexts/AppContext';
import { Skeleton } from './ui/Skeleton';
import { SparklesIcon } from './ui/Icons';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  plan: Plan | null;
  payments: Payment[];
  plans: Plan[];
}

type MemberInsight = {
    risk: 'Alto' | 'Médio' | 'Baixo';
    analysis: string;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-md text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

const ChurnRiskBadge: React.FC<{ risk: 'Alto' | 'Médio' | 'Baixo' }> = ({ risk }) => {
    const riskClasses = {
        'Alto': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
        'Médio': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
        'Baixo': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
    };
    return <span className={`px-2.5 py-1 text-sm font-semibold rounded-full inline-block ${riskClasses[risk]}`}>{risk}</span>;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({ isOpen, onClose, member, plan, payments, plans }) => {
    const { getMemberInsights } = useAppContext();
    const [insight, setInsight] = useState<MemberInsight | null>(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState(true);

    useEffect(() => {
        if (isOpen && member) {
            setIsLoadingInsight(true);
            getMemberInsights(member, payments, plan)
                .then(setInsight)
                .finally(() => setIsLoadingInsight(false));
        }
    }, [isOpen, member, payments, plan, getMemberInsights]);
    
    const sortedPayments = useMemo(() => {
        return [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments]);

    const getInitials = (nameStr: string) => {
        if (!nameStr) return '??';
        const names = nameStr.trim().split(' ').filter(Boolean);
        if (names.length === 0) return '??';
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return names[0].substring(0, 2).toUpperCase();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Aluno">
            <div className="space-y-6">
                
                {/* Member Info */}
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-2xl">
                           {getInitials(member.name)}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{member.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                </div>

                {/* AI Insight */}
                <div className="p-4 bg-slate-800/70 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-primary-400" />
                        Análise de Risco (IA)
                    </h4>
                    {isLoadingInsight ? (
                        <Skeleton className="h-16 w-full" />
                    ) : (
                        insight && (
                            <div className="flex items-start space-x-4">
                                <ChurnRiskBadge risk={insight.risk} />
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">{insight.analysis}</p>
                            </div>
                        )
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Status" value={<MemberStatusBadge status={member.status} />} />
                    <DetailItem label="Plano Atual" value={plan?.name || 'N/A'} />
                    <DetailItem label="Data de Inscrição" value={new Date(member.joinDate).toLocaleDateString('pt-BR')} />
                    <DetailItem label="Telefone" value={member.telefone || 'Não informado'} />
                </div>
                
                {/* Payments History */}
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Histórico Recente de Pagamentos</h4>
                    <div className="max-h-48 overflow-y-auto pr-2">
                        {sortedPayments.length > 0 ? (
                             <ul className="space-y-2">
                                {sortedPayments.slice(0, 5).map(p => (
                                    <li key={p.id} className="flex justify-between items-center p-2 bg-slate-800/70 rounded-md">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{plans.find(pl => pl.id === p.planId)?.name || 'Pagamento'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                            <PaymentStatusBadge status={p.status} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Nenhum pagamento encontrado.</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </Modal>
    );
};