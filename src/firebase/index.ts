
'use client';

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Re-export hooks and providers
export * from './provider';

// Initialize Firebase app
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (!getApps().length) {  
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
firestore = getFirestore(app);

export const initializeFirebase = () => {
  return { app, auth, firestore };
};
