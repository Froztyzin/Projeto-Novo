import React, { useState } from 'react';
import type { Payment } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { PixIcon, BarcodeIcon, CreditCardIcon } from './ui/Icons';
import { PixPaymentModal } from './PixPaymentModal';
import { BoletoPaymentModal } from './BoletoPaymentModal';
import { CreditCardPaymentModal } from './CreditCardPaymentModal';
import { useToast } from '../contexts/ToastContext';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment: Payment;
}

type PaymentStep = 'select' | 'pix' | 'boleto' | 'card';

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ isOpen, onClose, onConfirm, payment }) => {
  const [step, setStep] = useState<PaymentStep>('select');
  const { addToast } = useToast();

  const handleSuccess = () => {
    onConfirm();
    addToast('Pagamento confirmado com sucesso!', 'success');
    handleClose();
  }

  const handleClose = () => {
    setStep('select');
    onClose();
  };

  const renderContent = () => {
    switch(step) {
      case 'pix':
        return <PixPaymentModal isOpen={true} onClose={() => setStep('select')} onConfirm={handleSuccess} payment={payment} />;
      case 'boleto':
        return <BoletoPaymentModal isOpen={true} onClose={() => setStep('select')} onConfirm={handleSuccess} payment={payment} />;
      case 'card':
        return <CreditCardPaymentModal isOpen={true} onClose={() => setStep('select')} onConfirm={handleSuccess} payment={payment} />;
      case 'select':
      default:
        return (
          <Modal isOpen={isOpen} onClose={handleClose} title="Escolha o Método de Pagamento">
            <div className="text-center mb-6">
                <p className="text-slate-400">Valor a pagar:</p>
                <p className="text-3xl font-bold text-slate-100">{payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="space-y-4">
              <Button onClick={() => setStep('pix')} className="w-full !justify-start !py-4" variant="outline">
                <PixIcon className="w-6 h-6 mr-4" />
                <span className="text-lg">Pagar com Pix</span>
              </Button>
              <Button onClick={() => setStep('boleto')} className="w-full !justify-start !py-4" variant="outline">
                <BarcodeIcon className="w-6 h-6 mr-4" />
                <span className="text-lg">Pagar com Boleto</span>
              </Button>
              <Button onClick={() => setStep('card')} className="w-full !justify-start !py-4" variant="outline">
                <CreditCardIcon className="w-6 h-6 mr-4" />
                <span className="text-lg">Pagar com Cartão de Crédito</span>
              </Button>
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            </div>
          </Modal>
        );
    }
  }

  return <>{renderContent()}</>;
};