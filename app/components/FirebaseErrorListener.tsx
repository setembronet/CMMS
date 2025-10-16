'use client';

import { useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { errorEmitter } from '../firebase/error-emitter';
import type { FirestorePermissionError } from '../firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.message, error.context);
      
      const readableMessage = `
        Acesso negado ao tentar '${error.context.operation}' no caminho '${error.context.path}'. 
        Verifique as regras de segurança do Firestore.
      `;

      toast({
        variant: 'destructive',
        title: 'Erro de Permissão do Firestore',
        description: readableMessage,
        duration: 20000, 
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
