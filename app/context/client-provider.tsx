'use client';
import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useCollection } from '@/firebase/firestore';
import type { Company, User } from '@/lib/types';
import { useAuth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string) => void;
  selectedClient: Company | null;
  currentUser: User | null;
  authLoading: boolean;
}

export const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const { data: companies, loading: companiesLoading } = useCollection<Company>('companies');
  const { data: allUsers, loading: usersLoading } = useCollection<User>('users');
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && allUsers.length > 0) {
        const appUser = allUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
        setCurrentUser(appUser || null);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [auth, allUsers]);


  useEffect(() => {
    if (authLoading || companiesLoading) return;

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
  }, [currentUser, companies, companiesLoading, authLoading]);

  const setSelectedClientId = (clientId: string) => {
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
