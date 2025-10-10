
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Settings,
  Users,
  TrendingUp,
  ChevronDown,
  LayoutGrid,
  Package,
  Puzzle,
  UserSquare,
  LogOut,
  FileText,
  History,
  Briefcase,
  Home,
  ClipboardList,
  Wrench,
  MapPin,
  Contact,
  PackageSearch,
  Receipt,
} from 'lucide-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import React from 'react';
import { useI18n } from '@/hooks/use-i18n';

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const financeLinks = [
      { href: '/dashboard/finance/plans', label: t('sidebar.plans'), icon: Package },
      { href: '/dashboard/finance/addons', label: t('sidebar.addons'), icon: Puzzle },
  ];

  const settingsLinks = [
      { href: '/dashboard/settings', label: t('sidebar.general'), icon: Settings },
      { href: '/dashboard/cmms-users', label: t('sidebar.saasUsers'), icon: UserSquare },
      { href: '/dashboard/settings/roles', label: t('sidebar.roles'), icon: Briefcase },
      { href: '/dashboard/settings/backup', label: t('sidebar.backupRestore'), icon: History },
  ];


  const isActive = (href: string, isSubItem: boolean = false) => {
    // For sub-items, we want an exact match
     if (isSubItem) {
        return pathname === href;
    }
    // For main sections, we check if the path starts with the href
    return pathname.startsWith(href);
  };
  
  // Custom check for the main SaaS dashboard
  const isSaaSMainDashboardActive = pathname === '/dashboard';

  const isCompaniesActive = pathname.startsWith('/dashboard/companies');
  const isFinanceActive = pathname.startsWith('/dashboard/finance');
  const isSettingsActive = ['/dashboard/settings', '/dashboard/cmms-users', '/dashboard/settings/roles', '/dashboard/settings/backup'].some(p => pathname.startsWith(p));
  const isCmmsActive = ['/dashboard/cmms', '/dashboard/clients', '/dashboard/assets', '/dashboard/orders', '/dashboard/users', '/dashboard/products'].some(p => pathname.startsWith(p));

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isSaaSMainDashboardActive}
                tooltip={{ children: t('sidebar.dashboard') }}
              >
                <Link href="/dashboard">
                  <TrendingUp />
                  <span>{t('sidebar.dashboard')}</span>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible asChild defaultOpen={isCompaniesActive}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isCompaniesActive}
                            className="justify-between"
                            tooltip={{ children: t('sidebar.companies') }}
                         >
                            <div className="flex items-center gap-2">
                                <Building2 />
                                <span>{t('sidebar.companies')}</span>
                            </div>
                            <ChevronDown className={cn("transition-transform duration-200", isCompaniesActive && "rotate-180")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/companies', true)}>
                                    <Link href="/dashboard/companies">
                                        <LayoutGrid />
                                        <span>{t('sidebar.overview')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/companies/segments', true)}>
                                    <Link href="/dashboard/companies/segments">
                                        <Puzzle />
                                        <span>{t('sidebar.segments')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
           </Collapsible>
          
           <Collapsible asChild defaultOpen={isFinanceActive}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isFinanceActive}
                            className="justify-between"
                            tooltip={{ children: t('sidebar.finance') }}
                         >
                            <div className="flex items-center gap-2">
                                <Receipt />
                                <span>{t('sidebar.finance')}</span>
                            </div>
                            <ChevronDown className={cn("transition-transform duration-200", isFinanceActive && "rotate-180")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {financeLinks.map(link => (
                                 <SidebarMenuSubItem key={link.href}>
                                     <SidebarMenuSubButton asChild isActive={isActive(link.href, true)}>
                                        <Link href={link.href}>
                                            <link.icon />
                                            <span>{link.label}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                 </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
           </Collapsible>
        </SidebarMenu>
      </SidebarContent>
      <SidebarContent className="p-2 mt-auto">
        <SidebarMenu>
            <Collapsible asChild defaultOpen={isCmmsActive}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isCmmsActive}
                            className="justify-between"
                            tooltip={{ children: t('sidebar.cmms') }}
                         >
                            <div className="flex items-center gap-2">
                                <Wrench />
                                <span>{t('sidebar.cmms')}</span>
                            </div>
                            <ChevronDown className={cn("transition-transform duration-200", isCmmsActive && "rotate-180")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/cmms', true)}>
                                    <Link href="/dashboard/cmms">
                                        <LayoutGrid />
                                        <span>{t('sidebar.cmmsDashboard')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/clients', true)}>
                                    <Link href="/dashboard/clients">
                                        <MapPin />
                                        <span>{t('sidebar.clients')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/assets', true)}>
                                    <Link href="/dashboard/assets">
                                        <Package />
                                        <span>{t('sidebar.assets')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/products', true)}>
                                    <Link href="/dashboard/products">
                                        <PackageSearch />
                                        <span>Peças</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/orders', true)}>
                                    <Link href="/dashboard/orders">
                                        <ClipboardList />
                                        <span>{t('sidebar.workOrders')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/users', true)}>
                                    <Link href="/dashboard/users">
                                        <Users />
                                        <span>{t('sidebar.users')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
           </Collapsible>

          <Collapsible asChild defaultOpen={isSettingsActive}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isSettingsActive}
                            className="justify-between"
                            tooltip={{ children: t('sidebar.settings') }}
                         >
                            <div className="flex items-center gap-2">
                                <Settings />
                                <span>{t('sidebar.settings')}</span>
                            </div>
                            <ChevronDown className={cn("transition-transform duration-200", isSettingsActive && "rotate-180")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {settingsLinks.map(link => (
                                 <SidebarMenuSubItem key={link.href}>
                                     <SidebarMenuSubButton asChild isActive={isActive(link.href, true)}>
                                        <Link href={link.href}>
                                            <link.icon />
                                            <span>{link.label}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                 </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
           </Collapsible>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: t('sidebar.logout') }}>
                    <Link href="/">
                        <LogOut />
                        <span>{t('sidebar.logout')}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}

    