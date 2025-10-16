
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

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser } = useClient();

  if (!currentUser) {
    // Or a loading spinner, or some other placeholder
    return null;
  }
  
  const isTechnician = currentUser?.cmmsRole === 'TECNICO';

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


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}

    