'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import { toast, ToastContainer, ToastContent, ToastOptions } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

// Define the shape of our context
interface IToastContextType {
  showToast: (message: ToastContent, type?: ToastType, options?: ToastOptions) => void;
}

// Define allowed toast types
type ToastType = 'info' | 'success' | 'warning' | 'error';

// Create the context with a default value
const ToastContext = createContext<IToastContextType | null>(null);

// Props for the ToastProvider component
interface IToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<IToastProviderProps> = ({ children }) => {
  const showToast = (message: ToastContent, type: ToastType = 'info', options: ToastOptions = {}) => {
    toast[type](message, options);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = (): IToastContextType => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
