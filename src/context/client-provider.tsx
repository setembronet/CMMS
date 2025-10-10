
'use client';
import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { companies } from '@/lib/data';
import type { Company } from '@/lib/types';

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string) => void;
  selectedClient: Company | null;
}

export const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // On mount, try to get the stored client ID or default to the first one
    const storedClientId = localStorage.getItem('selectedClientId');
    const initialClientId = storedClientId || (companies.length > 0 ? companies[0].id : null);
    if (initialClientId) {
      setSelectedClientIdState(initialClientId);
    }
    setIsMounted(true);
  }, []);

  const setSelectedClientId = (clientId: string) => {
    localStorage.setItem('selectedClientId', clientId);
    setSelectedClientIdState(clientId);
  };

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return companies.find(c => c.id === selectedClientId) || null;
  }, [selectedClientId]);

  const value = {
    selectedClientId,
    setSelectedClientId,
    selectedClient,
  };

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = React.useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

    