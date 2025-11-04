

'use client';

import * as React from 'react';
import { useClient } from '@/context/client-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ClientLayout from '@/app/dashboard/client-layout';
import ClientPortalLayout from '@/app/dashboard/client-portal/layout';

const CLIENT_ROLES = ['SINDICO', 'ZELADOR', 'PORTEIRO', 'GERENTE_PREDIAL'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, authLoading } = useClient();
  const router = useRouter();

  if (authLoading || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isClientUser = CLIENT_ROLES.includes(currentUser.cmmsRole || '');

  if (isClientUser) {
    return <ClientPortalLayout>{children}</ClientPortalLayout>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}
