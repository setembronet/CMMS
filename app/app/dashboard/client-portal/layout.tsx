
'use client';

import * as React from 'react';
import { useClient } from '@/context/client-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/dashboard/header';

const CLIENT_ROLES = ['SINDICO', 'ZELADOR', 'PORTEIRO', 'GERENTE_PREDIAL'];

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, authLoading } = useClient();
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.replace('/');
      } else if (!CLIENT_ROLES.includes(currentUser.cmmsRole || '')) {
        // Redirect non-client users away from the portal
        router.replace('/dashboard');
      }
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser || (currentUser && !CLIENT_ROLES.includes(currentUser.cmmsRole || ''))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
        <Header />
        <main className="flex-1">{children}</main>
    </div>
  );
}
