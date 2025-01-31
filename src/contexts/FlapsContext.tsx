"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

interface FlapsContextType {
  flapsBalance: number;
  addFlaps: (amount: number) => void;
}

const FlapsContext = createContext<FlapsContextType | null>(null);

export const FlapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet } = useWallet();
  // Initialize from localStorage if available
  const [flapsBalance, setFlapsBalance] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flapsBalance');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Save to localStorage whenever balance changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('flapsBalance', flapsBalance.toString());
    }
  }, [flapsBalance]);

  const addFlaps = (amount: number) => {
    console.log('Adding FLAPS:', amount, 'Current:', flapsBalance);
    setFlapsBalance(prev => {
      const newBalance = prev + amount;
      console.log('New balance will be:', newBalance);
      return newBalance;
    });
  };

  return (
    <FlapsContext.Provider value={{ flapsBalance, addFlaps }}>
      {children}
    </FlapsContext.Provider>
  );
};

export const useFlaps = () => {
  const context = useContext(FlapsContext);
  if (!context) {
    throw new Error('useFlaps must be used within a FlapsProvider');
  }
  return context;
}; 