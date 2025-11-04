
'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { useClient } from '@/context/client-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const CLIENT_ROLES = ['SINDICO', 'ZELADOR', 'PORTEIRO', 'GERENTE_PREDIAL'];

function DashboardUI({ children }: { children: React.ReactNode }) {
    const { currentUser } = useClient();
    const isTechnician = currentUser?.cmmsRole === 'TECNICO';

    if (isTechnician) {
      return (
         <div className="flex flex-col h-screen">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>
         </div>
      )
    }
  
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarNav />
            </Sidebar>
            <SidebarInset>
                <Header />
                <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const { currentUser, authLoading } = useClient();
  const router = useRouter();
  
  React.useEffect(() => {
      if (!authLoading) {
          if (!currentUser) {
              router.replace('/');
          } else if (CLIENT_ROLES.includes(currentUser.cmmsRole || '')) {
              router.replace('/dashboard/client-portal');
          }
      }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser || (currentUser && CLIENT_ROLES.includes(currentUser.cmmsRole || ''))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <DashboardUI>{children}</DashboardUI>;
}
