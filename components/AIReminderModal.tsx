import React, { useState, useEffect } from 'react';
import type { Member, Payment } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from './ui/Skeleton';
import { SparklesIcon, SendIcon } from './ui/Icons';
import { markdownToHtml } from '../utils';

interface AIReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
  payment: Payment;
}

const MessageSkeleton: React.FC = () => (
    <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
    </div>
);


export const AIReminderModal: React.FC<AIReminderModalProps> = ({ isOpen, onClose, member, payment }) => {
    const { generatePaymentReminderMessage } = useAppContext();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen && member && payment) {
            setIsLoading(true);
            generatePaymentReminderMessage(payment, member)
                .then(setMessage)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, member, payment, generatePaymentReminderMessage]);
    
    const getPlainText = () => {
         return message
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
            .replace(/(\*|_)(.*?)\1/g, '$2');   // italic
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(getPlainText())
            .then(() => {
                addToast('Mensagem copiada para a área de transferência!', 'success');
                onClose();
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                addToast('Falha ao copiar texto.', 'error');
            });
    };

    const handleSendWhatsApp = () => {
        if (!member.telefone) {
            addToast('Este aluno não possui um telefone cadastrado.', 'error');
            return;
        }

        const phone = member.telefone.replace(/\D/g, '');
        // Basic check for BR country code, assumes 55 if not present.
        const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
        const encodedMessage = encodeURIComponent(getPlainText());
        
        const url = `https://wa.me/${fullPhone}?text=${encodedMessage}`;

        window.open(url, '_blank');
        addToast('Abrindo WhatsApp em nova aba...', 'info');
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Assistente de Cobrança IA"
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-400">
                    A IA gerou a seguinte mensagem de cobrança para <span className="font-semibold text-slate-200">{member.name}</span>, com base em seu histórico de pagamentos.
                </p>

                <div className="p-4 bg-slate-800/70 rounded-lg min-h-[150px]">
                    {isLoading ? (
                        <MessageSkeleton />
                    ) : (
                        <div 
                          className="text-slate-200 whitespace-pre-wrap ai-content" 
                          dangerouslySetInnerHTML={{ __html: markdownToHtml(message) }}
                        />
                    )}
                </div>
                
                {!isLoading && !member.telefone && (
                    <p className="text-xs text-yellow-400 text-right">
                        Aluno sem telefone cadastrado para envio via WhatsApp.
                    </p>
                )}

                <div className="flex justify-end items-center space-x-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Fechar
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCopyToClipboard} disabled={isLoading}>
                        Copiar Texto
                    </Button>
                     <Button type="button" onClick={handleSendWhatsApp} disabled={isLoading || !member.telefone}>
                        <SendIcon className="w-5 h-5 mr-2" />
                        Enviar via WhatsApp
                    </Button>
                </div>
            </div>
        </Modal>
    );
};