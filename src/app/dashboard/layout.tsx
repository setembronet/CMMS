
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

const CLIENT_ROLES = ['SINDICO', 'ZELADOR', 'PORTEIRO', 'GERENTE_PREDIAL'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useClient();
  const router = useRouter();
  
  React.useEffect(() => {
      if (currentUser && CLIENT_ROLES.includes(currentUser.cmmsRole || '')) {
          router.replace('/dashboard/client-portal');
      }
  }, [currentUser, router]);

  if (!currentUser) {
    // Or a loading spinner, or some other placeholder
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }
  
  const isTechnician = currentUser?.cmmsRole === 'TECNICO';
  const isClient = CLIENT_ROLES.includes(currentUser?.cmmsRole || '');

  if (isClient) {
      // The client portal page will handle its own layout
      return <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>;
  }

  if (isTechnician) {
      return (
         <div className="flex flex-col h-screen">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>
            {/* Simple footer navigation for technicians can be added here */}
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
