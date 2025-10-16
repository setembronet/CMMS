'use client';

import { I18nProvider } from '@/context/i18n-provider';
import { ClientProvider } from '@/context/client-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <I18nProvider>
        <ClientProvider>{children}</ClientProvider>
      </I18nProvider>
    </FirebaseClientProvider>
  );
}
