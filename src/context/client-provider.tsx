
'use client';
import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { users } from '@/lib/data';
import { useCollection } from '@/firebase/firestore';
import type { Company, User } from '@/lib/types';

// Mocked current user ID. In a real app, this would come from an auth context.
// Change this to 'user-08' to test the client portal redirect.
const MOCKED_CURRENT_USER_ID = 'user-01'; // 'user-01' (Admin) vs 'user-08' (Client)

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string) => void;
  selectedClient: Company | null;
  currentUser: User | null;
}

export const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { data: companies, loading: companiesLoading } = useCollection<Company>('companies');
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(null);

  // Find the current user based on the mocked ID
  const currentUser = useMemo(() => users.find(u => u.id === MOCKED_CURRENT_USER_ID) || null, []);

  useEffect(() => {
    // This effect runs only on the client side after hydration
    if (companiesLoading) return;

    const storedClientId = localStorage.getItem('selectedClientId');
    if (storedClientId && companies.some(c => c.id === storedClientId)) {
      setSelectedClientIdState(storedClientId);
    } else {
      let initialClientId: string | null = null;
      if (currentUser?.clientId) {
        initialClientId = currentUser.clientId;
      } else if (companies.length > 0) {
        initialClientId = companies[0].id;
      }

      if (initialClientId) {
        setSelectedClientIdState(initialClientId);
        localStorage.setItem('selectedClientId', initialClientId);
      }
    }
  }, [currentUser, companies, companiesLoading]);

  const setSelectedClientId = (clientId: string) => {
    // Technicians should not change client context
    if (currentUser?.cmmsRole === 'TECNICO') return;
    localStorage.setItem('selectedClientId', clientId);
    setSelectedClientIdState(clientId);
  };

  const selectedClient = useMemo(() => {
    if (!selectedClientId) return null;
    return companies.find(c => c.id === selectedClientId) || null;
  }, [selectedClientId, companies]);

  const value = {
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    currentUser,
  };

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
