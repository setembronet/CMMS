'use client';

import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirestore } from './provider';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from './errors';

// Helper function to handle Firestore errors and emit events
const handleError = (context: SecurityRuleContext, error: Error) => {
  if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
    const permissionError = new FirestorePermissionError(context);
    errorEmitter.emit('permission-error', permissionError);
    // Return a specific value or throw a custom error to be caught by the calling hook
    throw permissionError;
  }
  // For other errors, just log them
  console.error(`Error during Firestore '${context.operation}' on path '${context.path}':`, error);
  throw error;
};

// Hook to get a collection
export const useCollection = <T>(collectionName: string) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const context: SecurityRuleContext = { path: collectionName, operation: 'list' };
    const collectionRef = collection(firestore, collectionName);
    
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      (err) => {
        try {
          handleError(context, err);
        } catch (e) {
          setError(e as Error);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, firestore]);

  return { data, loading, error };
};

// Function to add a document
export const addDocument = async (
  firestore: Firestore,
  collectionName: string,
  data: DocumentData
) => {
  const context: SecurityRuleContext = { path: collectionName, operation: 'create', requestResourceData: data };
  try {
    const collectionRef = collection(firestore, collectionName);
    return await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleError(context, error as Error);
  }
};

// Function to update a document
export const updateDocument = async (
  firestore: Firestore,
  collectionName: string,
  docId: string,
  data: DocumentData
) => {
  const path = `${collectionName}/${docId}`;
  const context: SecurityRuleContext = { path, operation: 'update', requestResourceData: data };
  try {
    const docRef = doc(firestore, collectionName, docId);
    return await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleError(context, error as Error);
  }
};

// Function to delete a document
export const deleteDocument = async (
  firestore: Firestore,
  collectionName: string,
  docId: string
) => {
  const path = `${collectionName}/${docId}`;
  const context: SecurityRuleContext = { path, operation: 'delete' };
  try {
    const docRef = doc(firestore, collectionName, docId);
    return await deleteDoc(docRef);
  } catch (error) {
    handleError(context, error as Error);
  }
};
