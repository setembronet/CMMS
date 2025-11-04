
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, authLoading } = useClient();
  const router = useRouter();
  
  React.useEffect(() => {
      if (!authLoading && !currentUser) {
          router.replace('/');
      } else if (!authLoading && currentUser && CLIENT_ROLES.includes(currentUser.cmmsRole || '')) {
        // Allow client users to access their portal, which has its own layout
        if (!router.pathname?.startsWith('/dashboard/client-portal')) {
           router.replace('/dashboard/client-portal');
        }
      }
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If it's a client user, their specific layout will handle the UI
  if (CLIENT_ROLES.includes(currentUser.cmmsRole || '')) {
      if (router.pathname?.startsWith('/dashboard/client-portal')) {
        return <>{children}</>;
      }
      // Render loading while redirecting
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  // Layout for Admins, Technicians, etc.
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
