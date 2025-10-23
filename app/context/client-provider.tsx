
'use client';
import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useCollection } from '@/firebase/firestore';
import type { Company, User } from '@/lib/types';
import { users as allUsersData } from '@/lib/data';

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string) => void;
  selectedClient: Company | null;
  currentUser: User | null;
  authLoading: boolean;
}

export const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { data: companies, loading: companiesLoading } = useCollection<Company>('companies');
  
  // Simulate a logged-in user without Firebase Auth
  useEffect(() => {
    // Find the admin user from the mock data
    const adminUser = allUsersData.find(u => u.email === 'admin@tenantcare.com');
    setCurrentUser(adminUser || null);
    
    // Set a default client if none is selected
    if (!localStorage.getItem('selectedClientId') && companies.length > 0) {
      const initialClientId = companies[0].id;
      setSelectedClientIdState(initialClientId);
      localStorage.setItem('selectedClientId', initialClientId);
    } else {
        setSelectedClientIdState(localStorage.getItem('selectedClientId'));
    }

    setAuthLoading(false);
  }, [companies]);


  const setSelectedClientId = (clientId: string) => {
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
    authLoading,
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
