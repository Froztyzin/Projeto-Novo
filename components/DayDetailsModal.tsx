import React from 'react';
import type { Payment, Member, Plan } from '../types';
import { Modal } from './ui/Modal';
import { PaymentStatusBadge } from './ui/Badges';
import { Button } from './ui/Button';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  payments: Payment[];
  members: Member[];
  plans: Plan[];
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ isOpen, onClose, date, payments, members, plans }) => {
  if (!isOpen || !date) return null;

  const getMemberName = (memberId: string) => members.find(m => m.id === memberId)?.name || 'Desconhecido';
  const getPlanName = (planId: string) => plans.find(p => p.id === planId)?.name || 'N/A';

  const title = `Pagamentos de ${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {payments.length > 0 ? (
          <div className="max-h-96 overflow-y-auto pr-2">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map(payment => (
                <li key={payment.id} className="py-4 flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{getMemberName(payment.memberId)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getPlanName(payment.planId)}</p>
                      {payment.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{payment.description}"</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-green-600 dark:text-green-400">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                </li>
                ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhum pagamento registrado para esta data.
          </p>
        )}
         <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </Modal>
  );
};
