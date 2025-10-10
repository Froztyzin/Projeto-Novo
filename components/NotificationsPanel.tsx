
import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { BellIcon, XIcon } from './ui/Icons';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const { notifications, markAsRead } = useNotifications();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div 
                className="absolute top-16 right-4 w-full max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-700 animate-fadeIn"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="font-semibold text-lg text-slate-100">Notificações</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div 
                                key={n.id}
                                className={`p-4 border-b border-slate-700 last:border-b-0 ${n.read ? 'opacity-60' : ''}`}
                            >
                                <p className="font-semibold text-slate-200">{n.title}</p>
                                <p className="text-sm text-slate-400">{n.message}</p>
                                {!n.read && (
                                    <button onClick={() => markAsRead(n.id)} className="text-xs text-primary-400 mt-2 hover:underline">
                                        Marcar como lida
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <BellIcon className="h-8 w-8 mx-auto mb-2" />
                            <p>Nenhuma notificação nova.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
