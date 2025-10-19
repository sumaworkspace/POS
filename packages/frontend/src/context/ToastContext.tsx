import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const getToastStyle = (type: Toast['type']) => {
    const baseStyle = {
      padding: '12px 20px',
      borderRadius: '8px',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500' as const,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideIn 0.3s ease-out',
      minWidth: '300px',
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, background: '#10b981', color: 'white' };
      case 'error':
        return { ...baseStyle, background: '#dc2626', color: 'white' };
      case 'warning':
        return { ...baseStyle, background: '#f59e0b', color: 'white' };
      default:
        return { ...baseStyle, background: '#3b82f6', color: 'white' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={getToastStyle(toast.type)}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
