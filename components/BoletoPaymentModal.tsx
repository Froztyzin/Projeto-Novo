import React from 'react';
import type { Payment } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import { BarcodeIcon } from './ui/Icons';

interface BoletoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment: Payment;
}

export const BoletoPaymentModal: React.FC<BoletoPaymentModalProps> = ({ isOpen, onClose, onConfirm, payment }) => {
  const { addToast } = useToast();
  const boletoCode = '12345.67890 12345.678901 12345.678902 1 12345678901234';
  
  const handleCopy = () => {
      navigator.clipboard.writeText(boletoCode.replace(/\s/g, '')).then(() => {
          addToast('Linha digitável copiada!', 'success');
      });
  }

  const handleDownload = () => {
      addToast('Download do boleto iniciado (simulação).', 'info');
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagar com Boleto">
      <div className="flex flex-col items-center text-center space-y-4">
        <p className="text-slate-400">Copie a linha digitável abaixo ou clique para baixar o boleto em PDF.</p>
        
        <div className="p-4 bg-slate-800 rounded-lg w-full">
            <p className="text-sm text-slate-400">Linha Digitável</p>
            <p className="font-mono text-lg text-slate-100 break-words">{boletoCode}</p>
        </div>

        <div className="flex items-center justify-center w-full">
            <BarcodeIcon className="h-16 w-full text-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
            <Button onClick={handleCopy} variant="outline" className="w-full">Copiar Linha Digitável</Button>
            <Button onClick={handleDownload} variant="outline" className="w-full">Baixar PDF</Button>
        </div>

        <div className="flex justify-center space-x-4 pt-4 w-full">
            <Button type="button" variant="ghost" onClick={onClose}>Voltar</Button>
            <Button type="button" onClick={onConfirm}>Já paguei, confirmar</Button>
        </div>
      </div>
    </Modal>
  );
};