
'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { I18nProvider } from '@/context/i18n-provider';
import { ClientProvider, useClient } from '@/context/client-provider';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser } = useClient();

  if (!currentUser) {
    return null; // Or a loading component
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
    <I18nProvider>
      <ClientProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </ClientProvider>
    </I18nProvider>
  );
}
