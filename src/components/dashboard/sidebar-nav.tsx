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
    { href: '/dashboard/finance/plans', label: 'Planos', icon: Package },
];

const bottomLinks = [{ href: '/dashboard/settings', label: 'Configurações', icon: Settings }];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, isSubItem: boolean = false) => {
    if (isSubItem) {
        return pathname === href;
    }
    return pathname.startsWith(href) && (pathname === href || href !== '/dashboard');
  };

  const isFinanceActive = financeLinks.some(link => isActive(link.href, true));

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {mainLinks.map((link) => (
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
          
           <Collapsible asChild>
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
          {bottomLinks.map((link) => (
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
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
