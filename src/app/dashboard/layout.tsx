import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/dashboard/header';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { I18nProvider } from '@/context/i18n-provider';
import { ClientProvider } from '@/context/client-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <ClientProvider>
        <SidebarProvider>
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarNav />
          </Sidebar>
          <SidebarInset>
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ClientProvider>
    </I18nProvider>
  );
}

    