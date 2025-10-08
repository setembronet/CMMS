

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ClipboardList,
  Home,
  Settings,
  Users,
  Wrench,
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

const mainLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/companies', label: 'Empresas', icon: Building2 },
  { href: '/dashboard/users', label: 'Usuários', icon: Users },
  { href: '/dashboard/assets', label: 'Ativos', icon: Wrench },
  { href: '/dashboard/orders', label: 'Ordens de Serviço', icon: ClipboardList },
];

const financeLinks = [
    { href: '/dashboard/finance', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/finance/subscriptions', label: 'Assinaturas', icon: FileText },
    { href: '/dashboard/finance/plans', label: 'Planos', icon: Package },
    { href: '/dashboard/finance/addons', label: 'Add-ons', icon: Puzzle },
];

const settingsLinks = [
    { href: '/dashboard/settings', label: 'Geral', icon: Settings },
    { href: '/dashboard/cmms-users', label: 'Usuários do SaaS', icon: UserSquare },
    { href: '/dashboard/settings/roles', label: 'Funções', icon: Briefcase },
    { href: '/dashboard/settings/backup', label: 'Backup e Restore', icon: History },
];


export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, isSubItem: boolean = false) => {
    // Exact match for sub-items or dashboard, startsWith for others
    if (isSubItem || href === '/dashboard') {
        return pathname === href;
    }
    // Make company links active only on their specific page
    if (href.startsWith('/dashboard/companies')) {
        return pathname === href || pathname.startsWith('/dashboard/companies/segments');
    }
    return pathname.startsWith(href);
  };

  const isCompaniesActive = mainLinks.some(link => link.href.startsWith('/dashboard/companies') && isActive(link.href));
  const isFinanceActive = financeLinks.some(link => isActive(link.href, true));
  const isSettingsActive = settingsLinks.some(link => isActive(link.href, true));

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
                isActive={isActive('/dashboard')}
                tooltip={{ children: 'Dashboard' }}
              >
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible asChild defaultOpen={isCompaniesActive}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isCompaniesActive}
                            className="justify-between"
                            tooltip={{ children: 'Empresas' }}
                         >
                            <div className="flex items-center gap-2">
                                <Building2 />
                                <span>Empresas</span>
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
                                        <span>Visão Geral</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild isActive={isActive('/dashboard/companies/segments', true)}>
                                    <Link href="/dashboard/companies/segments">
                                        <Puzzle />
                                        <span>Segmentos</span>
                                    </Link>
                                </SidebarMenuSubButton>
                             </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
           </Collapsible>
          
          {mainLinks.filter(link => !link.href.includes('/dashboard/companies') && link.href !== '/dashboard').map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(link.href)}
                tooltip={{ children: link.label }}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
           <Collapsible asChild defaultOpen={isFinanceActive}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isFinanceActive}
                            className="justify-between"
                            tooltip={{ children: 'Financeiro' }}
                         >
                            <div className="flex items-center gap-2">
                                <TrendingUp />
                                <span>Financeiro</span>
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
          <Collapsible asChild defaultOpen={isSettingsActive}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isSettingsActive}
                            className="justify-between"
                            tooltip={{ children: 'Configurações' }}
                         >
                            <div className="flex items-center gap-2">
                                <Settings />
                                <span>Configurações</span>
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
                <SidebarMenuButton asChild tooltip={{ children: 'Sair' }}>
                    <Link href="/login">
                        <LogOut />
                        <span>Sair</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
