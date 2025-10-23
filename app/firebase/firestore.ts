'use client';

import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  limit,
  orderBy,
  startAt,
  endAt,
  Query,
  DocumentData,
  Firestore,
  onSnapshot as onSnapshot_
} from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
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


export const useCollection = <T extends { id: string }>(collectionName: string) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) return;
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

  return { data, loading, error, setData };
};


export const useDocument = <T extends { id: string }>(collectionName: string, docId: string) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore || !docId) {
      setLoading(false);
      setData(null);
      return;
    };

    const path = `${collectionName}/${docId}`;
    const context: SecurityRuleContext = { path, operation: 'get' };
    const docRef = doc(firestore, collectionName, docId);

    const unsubscribe = onSnapshot_(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
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
  }, [collectionName, docId, firestore]);

  return { data, loading, error, setData };
};


// Function to add a document
export const addDocument = (
  firestore: Firestore,
  collectionName: string,
  data: DocumentData
) => {
  const collectionRef = collection(firestore, collectionName);
  
  addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch((serverError) => {
    const context: SecurityRuleContext = {
      path: collectionName,
      operation: 'create',
      requestResourceData: data
    };
    const permissionError = new FirestorePermissionError(context);
    errorEmitter.emit('permission-error', permissionError);
  });
};


// Function to update a document
export const updateDocument = (
  firestore: Firestore,
  collectionName: string,
  docId: string,
  data: DocumentData
) => {
  const path = `${collectionName}/${docId}`;
  const docRef = doc(firestore, collectionName, docId);

  updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }).catch((serverError) => {
    const context: SecurityRuleContext = {
      path: path,
      operation: 'update',
      requestResourceData: data
    };
    const permissionError = new FirestorePermissionError(context);
    errorEmitter.emit('permission-error', permissionError);
  });
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
