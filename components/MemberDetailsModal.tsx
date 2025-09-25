import React, { useMemo } from 'react';
import type { Member, Plan, Payment } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { MemberStatusBadge, PaymentStatusBadge } from './ui/Badges';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  plan: Plan | null;
  payments: Payment[];
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-md text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({ isOpen, onClose, member, plan, payments }) => {
  if (!isOpen) return null;

  const sortedPayments = useMemo(() => 
    payments.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [payments]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Aluno">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="Nome" value={member.name} />
          <DetailItem label="E-mail" value={member.email} />
          <DetailItem label="Telefone" value={member.telefone || 'N/A'} />
          <DetailItem label="Data de Inscrição" value={new Date(member.joinDate).toLocaleDateString('pt-BR')} />
          <DetailItem label="Status" value={<MemberStatusBadge status={member.status} />} />
          <DetailItem label="Plano" value={plan?.name || 'N/A'} />
          {plan && <DetailItem label="Valor do Plano" value={plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })} />}
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Histórico de Pagamentos</h3>
          {sortedPayments.length > 0 ? (
            <div className="max-h-60 overflow-y-auto pr-2">
                <ul className="space-y-3">
                {sortedPayments.map(payment => (
                    <li key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.date).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <PaymentStatusBadge status={payment.status} />
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