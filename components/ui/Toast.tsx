import React from 'react';
import { useToast, ToastMessage, ToastType } from '../../contexts/ToastContext';
import { CheckCircleIcon, ExclamationCircleIcon, InfoCircleIcon, XIcon } from './Icons';

const toastConfig = {
    success: {
        icon: CheckCircleIcon,
        className: 'bg-green-500 border-green-600',
        iconClassName: 'text-green-200',
    },
    error: {
        icon: ExclamationCircleIcon,
        className: 'bg-red-500 border-red-600',
        iconClassName: 'text-red-200',
    },
    info: {
        icon: InfoCircleIcon,
        className: 'bg-blue-500 border-blue-600',
        iconClassName: 'text-blue-200',
    },
};

const Toast: React.FC<{ toast: ToastMessage, onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const { icon: Icon, className, iconClassName } = toastConfig[toast.type];

    return (
        <div className={`flex items-center p-4 text-white rounded-lg shadow-lg border-l-4 ${className}`}>
            <div className={`p-2 rounded-full ${iconClassName} bg-white/20 mr-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 font-medium">{toast.message}</div>
            <button onClick={() => onDismiss(toast.id)} className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-5 right-5 z-50 space-y-3">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};