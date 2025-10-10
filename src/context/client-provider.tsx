
'use client';
import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { companies, users } from '@/lib/data';
import type { Company, User } from '@/lib/types';

// Mocked current user ID. In a real app, this would come from an auth context.
const MOCKED_CURRENT_USER_ID = 'user-05'; // Switch between 'user-04' (Manager) and 'user-05' (Technician) to test

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string) => void;
  selectedClient: Company | null;
  currentUser: User | null;
}

export const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Find the current user based on the mocked ID
  const currentUser = useMemo(() => users.find(u => u.id === MOCKED_CURRENT_USER_ID) || null, []);

  useEffect(() => {
    // On mount, try to get the stored client ID or default based on user profile
    const storedClientId = localStorage.getItem('selectedClientId');
    let initialClientId = storedClientId;
    
    if (!initialClientId) {
      if (currentUser?.clientId) {
        initialClientId = currentUser.clientId;
      } else if (companies.length > 0) {
        initialClientId = companies[0].id;
      }
    }

    if (initialClientId) {
      setSelectedClientIdState(initialClientId);
    }
    setIsMounted(true);
  }, [currentUser]);

  const setSelectedClientId = (clientId: string) => {
    // Technicians should not change client context
    if (currentUser?.cmmsRole === 'TECNICO') return;
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
    currentUser,
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
