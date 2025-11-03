
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  Settings,
  Users,
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
  PackageSearch,
  Receipt,
  Truck,
  ShoppingCart,
  Lightbulb,
  DollarSign,
  Banknote,
  Library,
  Target,
  ArrowRightLeft,
  Landmark,
  CalendarDays,
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
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const isActive = (href: string, isSubItem: boolean = false) => {
    if (isSubItem) {
        return pathname === href;
    }
    return pathname.startsWith(href);
  };
  
  const isSaaSFinanceActive = pathname.startsWith('/dashboard/finance');
  const isCompaniesActive = pathname.startsWith('/dashboard/companies');
  const isSettingsActive = ['/dashboard/settings', '/dashboard/cmms-users', '/dashboard/settings/roles', '/dashboard/settings/checklists', '/dashboard/settings/backup'].some(p => pathname.startsWith(p));
  const isCmmsActive = pathname === '/dashboard' || ['/dashboard/clients', '/dashboard/assets', '/dashboard/orders', '/dashboard/users', '/dashboard/contracts', '/dashboard/products', '/dashboard/suppliers', '/dashboard/purchase-orders', '/dashboard/purchase-suggestion', '/dashboard/schedule', '/dashboard/cmms', '/dashboard/client-portal'].some(p => pathname.startsWith(p));
  const isCmmsBackofficeActive = pathname.startsWith('/dashboard/cmms');
  
  const settingsLinks = [
      { href: '/dashboard/settings', label: t('sidebar.general'), icon: Settings },
      { href: '/dashboard/cmms-users', label: t('sidebar.saasUsers'), icon: UserSquare },
      { href: '/dashboard/settings/roles', label: t('sidebar.roles'), icon: Briefcase },
      { href: '/dashboard/settings/checklists', label: t('sidebar.checklistTemplates'), icon: ClipboardList },
      { href: '/dashboard/settings/backup', label: t('sidebar.backupRestore'), icon: History },
  ];

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex flex-col p-2">
         <SidebarMenu>
          {/* Manager/Admin Menus */}
          <SidebarMenuItem>
            <Collapsible asChild defaultOpen={isSaaSFinanceActive}>
              <>
                <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isSaaSFinanceActive}
                        className="justify-between"
                        tooltip={{ children: t('sidebar.finance') }}
                      >
                        <div className="flex items-center gap-2">
                            <DollarSign />
                            <span>{t('sidebar.finance')}</span>
                        </div>
                        <ChevronDown className={cn("transition-transform duration-200", isSaaSFinanceActive && "rotate-180")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive('/dashboard/finance', true)}>
                                <Link href="/dashboard/finance">
                                    <LayoutGrid />
                                    <span>{t('sidebar.financeDashboard')}</span>
                                </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive('/dashboard/finance/subscriptions', true)}>
                                <Link href="/dashboard/finance/subscriptions">
                                    <Banknote />
                                    <span>{t('sidebar.subscriptions')}</span>
                                </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive('/dashboard/finance/plans', true)}>
                                <Link href="/dashboard/finance/plans">
                                    <Package />
                                    <span>{t('sidebar.plans')}</span>
                                </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive('/dashboard/finance/addons', true)}>
                                <Link href="/dashboard/finance/addons">
                                    <Puzzle />
                                    <span>{t('sidebar.addons')}</span>
                                </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                    </SidebarMenuSub>
                    <SidebarMenuSub>
                        <div className="text-xs font-medium text-sidebar-foreground/70 px-4 py-2">{t('sidebar.backoffice')} (SaaS)</div>
                          <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild isActive={isActive('/dashboard/finance/accounts-payable', true)}>
                                <Link href="/dashboard/finance/accounts-payable">
                                    <ArrowRightLeft />
                                    <span>{t('sidebar.accountsPayable')}</span>
                                </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </CollapsibleContent>
              </>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Collapsible asChild defaultOpen={isCompaniesActive}>
              <>
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
              </>
            </Collapsible>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <Collapsible asChild defaultOpen={isCmmsActive}>
                <>
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
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard', true)}>
                                    <Link href="/dashboard">
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
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard/client-portal', true)}>
                                    <Link href="/dashboard/client-portal">
                                        <Home />
                                        <span>{t('sidebar.clientPortal')}</span>
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
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard/contracts', true)}>
                                    <Link href="/dashboard/contracts">
                                        <FileText />
                                        <span>{t('sidebar.contracts')}</span>
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
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard/schedule', true)}>
                                    <Link href="/dashboard/schedule">
                                        <CalendarDays />
                                        <span>{t('sidebar.schedule')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard/products', true)}>
                                    <Link href="/dashboard/products">
                                        <PackageSearch />
                                        <span>{t('products.title')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard/suppliers', true)}>
                                    <Link href="/dashboard/suppliers">
                                        <Truck />
                                        <span>{t('sidebar.suppliers')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard/purchase-suggestion', true)}>
                                    <Link href="/dashboard/purchase-suggestion">
                                        <Lightbulb />
                                        <span>{t('sidebar.purchaseSuggestion')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isActive('/dashboard/purchase-orders', true)}>
                                    <Link href="/dashboard/purchase-orders">
                                        <ShoppingCart />
                                        <span>{t('sidebar.purchaseOrders')}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                        
                        <Collapsible asChild defaultOpen={isCmmsBackofficeActive}>
                            <>
                                <CollapsibleTrigger className="w-full">
                                    <div className="flex items-center justify-between text-xs font-medium text-sidebar-foreground/70 px-4 py-2 cursor-pointer hover:text-sidebar-foreground">
                                        <span>{t('sidebar.backoffice')} (CMMS)</span>
                                        <ChevronDown className={cn("transition-transform duration-200", isCmmsBackofficeActive && "rotate-180")} />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={isActive('/dashboard/cmms/finance', true)}>
                                                <Link href="/dashboard/cmms/finance">
                                                    <DollarSign />
                                                    <span>{t('cmms.finance.dashboardTitle')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={isActive('/dashboard/cmms/bank-accounts', true)}>
                                                <Link href="/dashboard/cmms/bank-accounts">
                                                    <Landmark />
                                                    <span>{t('sidebar.bankAccounts')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={isActive('/dashboard/cmms/chart-of-accounts', true)}>
                                                <Link href="/dashboard/cmms/chart-of-accounts">
                                                    <Library />
                                                    <span>{t('sidebar.chartOfAccounts')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={isActive('/dashboard/cmms/cost-centers', true)}>
                                                <Link href="/dashboard/cmms/cost-centers">
                                                    <Target />
                                                    <span>{t('sidebar.costCenters')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={isActive('/dashboard/cmms/accounts-payable', true)}>
                                                <Link href="/dashboard/cmms/accounts-payable">
                                                    <ArrowRightLeft />
                                                    <span>{t('sidebar.accountsPayable')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton asChild isActive={isActive('/dashboard/cmms/accounts-receivable', true)}>
                                                <Link href="/dashboard/cmms/accounts-receivable">
                                                    <Receipt />
                                                    <span>{t('sidebar.accountsReceivable')}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </>
                        </Collapsible>
                    </CollapsibleContent>
                </>
            </Collapsible>
           </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="mt-auto">
           <SidebarMenuItem>
                <Collapsible asChild defaultOpen={isSettingsActive}>
                    <>
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
                    </>
                </Collapsible>
           </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: t('sidebar.logout') }}>
                    <LogOut />
                    <span>{t('sidebar.logout')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
