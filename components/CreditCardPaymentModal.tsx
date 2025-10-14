import React, { useState } from 'react';
import type { Payment } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { CreditCardIcon } from './ui/Icons';
import { applyCreditCardMask, applyExpiryDateMask } from '../utils';

interface CreditCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment: Payment;
}

export const CreditCardPaymentModal: React.FC<CreditCardPaymentModalProps> = ({ isOpen, onClose, onConfirm, payment }) => {
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === 'number') maskedValue = applyCreditCardMask(value);
    if (name === 'expiry') maskedValue = applyExpiryDateMask(value);
    if (name === 'cvc') maskedValue = value.replace(/\D/g, '').slice(0, 4);
    
    setCardData(prev => ({ ...prev, [name]: maskedValue }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 1500);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagar com Cartão">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
            <CreditCardIcon className="w-8 h-8 text-slate-400" />
            <div className="text-right">
                <p className="text-slate-400 text-sm">Total a Pagar</p>
                <p className="text-2xl font-bold text-slate-100">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
        </div>

        <div>
            <label htmlFor="number" className="block text-sm font-medium text-slate-300 mb-1">Número do Cartão</label>
            <input type="text" name="number" id="number" value={cardData.number} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 focus:ring-primary-500 focus:border-primary-500" placeholder="0000 0000 0000 0000" />
        </div>
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nome no Cartão</label>
            <input type="text" name="name" id="name" value={cardData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 focus:ring-primary-500 focus:border-primary-500" placeholder="Como aparece no cartão" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-slate-300 mb-1">Validade</label>
                <input type="text" name="expiry" id="expiry" value={cardData.expiry} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 focus:ring-primary-500 focus:border-primary-500" placeholder="MM/AA" />
            </div>
            <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-slate-300 mb-1">CVC</label>
                <input type="text" name="cvc" id="cvc" value={cardData.cvc} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 focus:ring-primary-500 focus:border-primary-500" placeholder="123" />
            </div>
        </div>

        <div className="flex justify-between items-center space-x-4 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Voltar</Button>
            <Button type="submit" isLoading={isLoading}>
              {isLoading ? 'Processando...' : `Pagar ${payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
            </Button>
        </div>
      </form>
    </Modal>
  );
};