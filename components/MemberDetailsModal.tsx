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

const AIInsightSection: React.FC<{ insight: MemberInsight | null, isLoading: boolean }> = ({ insight, isLoading }) => {
    if (isLoading) {
        return (
             <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center mb-3">
                    <Skeleton className="h-6 w-6 rounded-full mr-2" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
        )
    }

    if (!insight) return null;

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-fadeIn">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-primary-500" />
                Análise de Risco (IA)
            </h3>
            <div className="flex items-center mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Risco de Evasão:</p>
                <ChurnRiskBadge risk={insight.risk} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                "{insight.analysis}"
            </p>
        </div>
    )
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({ isOpen, onClose, member, plan, payments, plans }) => {
  const { getMemberInsights } = useAppContext();
  const [insight, setInsight] = useState<MemberInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  useEffect(() => {
    if (isOpen && member) {
        setIsInsightLoading(true);
        setInsight(null);
        getMemberInsights(member, payments, plan)
            .then(setInsight)
            .finally(() => setIsInsightLoading(false));
    }
  }, [isOpen, member, payments, plan, getMemberInsights]);

  if (!isOpen) return null;

  const sortedPayments = useMemo(() => 
    payments.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [payments]);
  
  const getPlanName = (planId: string) => plans.find(p => p.id === planId)?.name || 'Pagamento Avulso';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Aluno">
      <div className="space-y-6">
        
        <AIInsightSection insight={insight} isLoading={isInsightLoading} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="Nome" value={member.name} />
          <DetailItem label="E-mail" value={member.email} />
          <DetailItem label="Telefone" value={member.telefone || 'N/A'} />
          <DetailItem label="Data de Inscrição" value={new Date(member.joinDate).toLocaleDateString('pt-BR')} />
          <DetailItem label="Status" value={<MemberStatusBadge status={member.status} />} />
          <DetailItem label="Plano Atual" value={plan?.name || 'N/A'} />
          {plan && <DetailItem label="Valor do Plano" value={plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })} />}
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Histórico de Pagamentos</h3>
          {sortedPayments.length > 0 ? (
            <div className="max-h-60 overflow-y-auto pr-2">
                <ul className="space-y-3">
                {sortedPayments.map(payment => (
                    <li key={payment.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getPlanName(payment.planId)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Vencimento: {new Date(payment.date).toLocaleDateString('pt-BR')}
                          </p>
                          {payment.paidDate && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Pago em: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                    </li>
                ))}
                </ul>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum pagamento encontrado.</p>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  );
};