'use client';
import { FirebaseProvider, initializeFirebase } from '@/firebase';
import React, { ReactNode } from 'react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

let app: ReturnType<typeof initializeFirebase>;

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  if (!app) {
    app = initializeFirebase();
  }
  return (
    <FirebaseProvider {...app}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
