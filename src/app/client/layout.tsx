import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ClientHeader } from '@/components/client/header';
import { ClientSidebarNav } from '@/components/client/sidebar-nav';
import { I18nProvider } from '@/context/i18n-provider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <SidebarProvider>
        <Sidebar variant="sidebar" collapsible="icon">
          <ClientSidebarNav />
        </Sidebar>
        <SidebarInset>
          <ClientHeader />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </I18nProvider>
  );
}
