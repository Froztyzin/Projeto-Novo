
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, message: string) => void;
  markAsRead: (id: number) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((title: string, message: string) => {
    const id = Date.now() + Math.random(); // Add random to avoid collision
    setNotifications(current => {
        // Prevent duplicate messages
        if (current.some(n => n.title === title && n.message === message)) {
            return current;
        }
        return [{ id, title, message, read: false }, ...current];
    });
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications(current =>
      current.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const value = { notifications, addNotification, markAsRead, unreadCount };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};