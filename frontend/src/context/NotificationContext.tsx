import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'DONATION_REQUEST' | 'STATUS_UPDATE' | 'GENERAL';
  read: boolean;
  createdAt: Date;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: ToastItem[];
  addToast: (title: string, message: string, type: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { socket } = useSocket();
  const { user } = useAuth();

  // Load initial notifications list
  useEffect(() => {
    if (user) {
      // Mock loading initial notifications
      setNotifications([
        {
          id: 'init-1',
          title: 'Welcome to FoodBridge',
          message: 'Your account is ready! Thank you for joining our mission.',
          type: 'GENERAL',
          read: false,
          createdAt: new Date(),
        }
      ]);
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Listen to Socket.IO notifications
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      console.log('Socket notification received:', data);
      const newNotification: NotificationItem = {
        id: data.id || Math.random().toString(36).substr(2, 9),
        title: data.title,
        message: data.message,
        type: data.type || 'GENERAL',
        read: false,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Map backend notification types to Toast types
      let toastType: ToastItem['type'] = 'info';
      if (data.type === 'DONATION_REQUEST') toastType = 'success';
      if (data.type === 'STATUS_UPDATE') toastType = 'info';

      addToast(data.title, data.message, toastType);
    };

    socket.on('notification-received', handleNotification);

    return () => {
      socket.off('notification-received', handleNotification);
    };
  }, [socket]);

  const addToast = (title: string, message: string, type: ToastItem['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}

      {/* Floating Toast Notification Containers */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border cursor-pointer hover:opacity-90 transform translate-y-0 transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-50'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/90 dark:border-amber-800 dark:text-amber-50'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-50'
                : 'bg-slate-50 border-slate-200 text-slate-950 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-50'
            }`}
          >
            <div className="flex-1">
              <h4 className="font-bold text-sm">{toast.title}</h4>
              <p className="text-xs mt-1 opacity-90">{toast.message}</p>
            </div>
            <button className="text-xs font-bold opacity-60 hover:opacity-100">×</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
