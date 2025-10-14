import React from 'react';
import type { Payment } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from '../contexts/ToastContext';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment: Payment;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({ isOpen, onClose, onConfirm, payment }) => {
  const { addToast } = useToast();
  const pixCode = '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266554400005204000053039865802BR5913NOME DO LOJISTA6009SAO PAULO62070503***6304E2A4';
  
  const handleCopy = () => {
      navigator.clipboard.writeText(pixCode).then(() => {
          addToast('Código Pix copiado!', 'success');
      });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagar com Pix">
      <div className="flex flex-col items-center text-center space-y-4">
        <p className="text-slate-400">Escaneie o QR Code com o app do seu banco ou copie o código abaixo.</p>
        
        <div className="bg-white p-2 rounded-lg">
            <svg width="200" height="200" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 0H11V11H0V0ZM4 4H7V7H4V4Z" fill="black"/>
                <path d="M4 15H7V18H4V15Z" fill="black"/>
                <path d="M0 26H11V37H0V26ZM4 30H7V33H4V30Z" fill="black"/>
                <path d="M15 4H18V7H15V4Z" fill="black"/>
                <path d="M26 0H37V11H26V0ZM30 4H33V7H30V4Z" fill="black"/>
                <path d="M15 26H18V29H15V26Z" fill="black"/>
                <path d="M26 26H37V37H26V26ZM30 30H33V33H30V30Z" fill="black"/>
                <path d="M30 15H33V18H30V15Z" fill="black"/>
                <path d="M26 15H29V18H26V15Z" fill="black"/>
                <path d="M15 15H18V18H15V15Z" fill="black"/>
                <path d="M19 15H22V18H19V15Z" fill="black"/>
                <path d="M23 15H25V18H23V15Z" fill="black"/>
                <path d="M19 19H22V22H19V19Z" fill="black"/>
                <path d="M19 23H22V25H19V23Z" fill="black"/>
                <path d="M23 19H25V22H23V19Z" fill="black"/>
                <path d="M26 19H29V22H26V19Z" fill="black"/>
                <path d="M30 19H33V22H30V19Z" fill="black"/>
                <path d="M30 23H33V25H30V23Z" fill="black"/>
                <path d="M15 19H18V22H15V19Z" fill="black"/>
                <path d="M15 23H18V25H15V23Z" fill="black"/>
                <path d="M19 11H22V14H19V11Z" fill="black"/>
                <path d="M23 11H25V14H23V11Z" fill="black"/>
                <path d="M26 11H29V14H26V11Z" fill="black"/>
                <path d="M15 11H18V14H15V11Z" fill="black"/>
                <path d="M11 11H14V14H11V11Z" fill="black"/>
                <path d="M11 15H14V18H11V15Z" fill="black"/>
                <path d="M11 19H14V22H11V19Z" fill="black"/>
                <path d="M11 23H14V25H11V23Z" fill="black"/>
                <path d="M11 26H14V29H11V26Z" fill="black"/>
                <path d="M11 30H14V33H11V30Z" fill="black"/>
                <path d="M11 34H14V37H11V34Z" fill="black"/>
                <path d="M15 30H18V33H15V30Z" fill="black"/>
                <path d="M19 30H22V33H19V30Z" fill="black"/>
                <path d="M23 30H25V33H23V30Z" fill="black"/>
                <path d="M23 26H25V29H23V26Z" fill="black"/>
                <path d="M19 26H22V29H19V26Z" fill="black"/>
                <path d="M11 0H14V3H11V0Z" fill="black"/>
                <path d="M15 0H18V3H15V0Z" fill="black"/>
                <path d="M19 0H22V3H19V0Z" fill="black"/>
                <path d="M19 4H22V7H19V4Z" fill="black"/>
                <path d="M23 4H25V7H23V4Z" fill="black"/>
                <path d="M11 4H14V7H11V4Z" fill="black"/>
                <path d="M11 8H14V10H11V8Z" fill="black"/>
                <path d="M8 11H10V14H8V11Z" fill="black"/>
                <path d="M4 11H7V14H4V11Z" fill="black"/>
                <path d="M4 19H7V22H4V19Z" fill="black"/>
                <path d="M8 19H10V22H8V19Z" fill="black"/>
                <path d="M4 23H7V25H4V23Z" fill="black"/>
                <path d="M8 23H10V25H8V23Z" fill="black"/>
                <path d="M0 11H3V14H0V11Z" fill="black"/>
                <path d="M0 15H3V18H0V15Z" fill="black"/>
                <path d="M0 19H3V22H0V19Z" fill="black"/>
                <path d="M0 34H3V37H0V34Z" fill="black"/>
                <path d="M4 34H7V37H4V34Z" fill="black"/>
                <path d="M8 34H10V37H8V34Z" fill="black"/>
                <path d="M8 30H10V33H8V30Z" fill="black"/>
                <path d="M8 26H10V29H8V26Z" fill="black"/>
                <path d="M26 34H29V37H26V34Z" fill="black"/>
                <path d="M30 34H33V37H30V34Z" fill="black"/>
                <path d="M34 34H37V37H37V34H34Z" fill="black"/>
                <path d="M34 30H37V33H34V30Z" fill="black"/>
                <path d="M34 26H37V29H34V26Z" fill="black"/>
                <path d="M34 11H37V14H34V11Z" fill="black"/>
                <path d="M34 0H37V3H34V0Z" fill="black"/>
                <path d="M34 4H37V7H34V4Z" fill="black"/>
            </svg>
        </div>
        
        <div className="w-full">
            <textarea
                readOnly
                value={pixCode}
                className="w-full h-24 p-2 text-xs bg-slate-800 text-slate-300 rounded-md resize-none border border-slate-700"
            />
            <Button onClick={handleCopy} variant="outline" className="w-full mt-2">Copiar Código</Button>
        </div>

        <div className="flex justify-center space-x-4 pt-4 w-full">
            <Button type="button" variant="ghost" onClick={onClose}>Voltar</Button>
            <Button type="button" onClick={onConfirm}>Já paguei, confirmar</Button>
        </div>
      </div>
    </Modal>
  );
};