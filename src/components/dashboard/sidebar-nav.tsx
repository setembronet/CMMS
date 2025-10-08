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
} from 'lucide-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/companies', label: 'Companies', icon: Building2 },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/assets', label: 'Assets', icon: Wrench },
  { href: '/dashboard/orders', label: 'Work Orders', icon: ClipboardList },
];

const bottomLinks = [{ href: '/dashboard/settings', label: 'Settings', icon: Settings }];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
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
