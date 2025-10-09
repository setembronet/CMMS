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
  LogOut,
  Warehouse,
  Truck,
} from 'lucide-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

export function ClientSidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/client/dashboard', label: 'Dashboard', icon: Home },
    { href: '/client/assets', label: 'Ativos', icon: Wrench },
    { href: '/client/orders', label: 'Ordens de Serviço', icon: ClipboardList },
    { href: '/client/products', label: 'Produtos', icon: Warehouse },
    { href: '/client/suppliers', label: 'Fornecedores', icon: Truck },
    { href: '/client/customers', label: 'Clientes', icon: Building2 },
    { href: '/client/users', label: 'Usuários', icon: Users },
  ];

  const isActive = (href: string) => {
    return pathname === href || (href !== '/client/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map((link) => (
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
      <SidebarContent className="p-2 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: 'Configurações' }}>
                  <Link href="/client/settings">
                      <Settings />
                      <span>Configurações</span>
                  </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: 'Sair' }}>
                  <Link href="/">
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
