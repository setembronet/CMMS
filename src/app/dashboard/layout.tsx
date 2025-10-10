
'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { TechnicianNav } from '@/components/dashboard/technician-nav';
import { I18nProvider } from '@/context/i18n-provider';
import { ClientProvider, useClient } from '@/context/client-provider';
import { usePathname } from 'next/navigation';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser } = useClient();
  const pathname = usePathname();

  // Render nothing or a loading spinner until the user profile is loaded
  if (!currentUser) {
    return null; // Or a loading component
  }

  const isTechnician = currentUser.cmmsRole === 'TECNICO';
  const isOrderDetailPage = pathname.startsWith('/dashboard/orders/');

  // Case 1: Technician on the specific order detail page gets a focused view
  if (isTechnician && isOrderDetailPage) {
      return (
        <div className="flex flex-col h-screen bg-background">
          {children}
        </div>
      );
  }
  
  // Case 2: Technician on any other page gets the mobile-first view with bottom nav
  if (isTechnician) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto pb-20">{children}</main>
        <TechnicianNav />
      </div>
    );
  }

  // Case 3 (Default): Any other user (Manager, Admin, etc.) gets the full sidebar layout
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
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
