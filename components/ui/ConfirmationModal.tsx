import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangleIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmButtonClass?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmButtonClass }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-800/30">
          <AlertTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
            <p className="text-lg text-gray-600 dark:text-gray-300">
                {message}
            </p>
        </div>
      </div>
      <div className="mt-6 flex justify-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className={confirmButtonClass || 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'}
          onClick={onConfirm}
        >
          {confirmText || 'Confirmar Exclusão'}
        </Button>
      </div>
    </Modal>
  );
};