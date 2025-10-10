
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/use-i18n';

export function TechnicianNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/dashboard', label: t('sidebar.dashboard'), icon: Home },
    { href: '/dashboard/orders', label: t('sidebar.workOrders'), icon: ListChecks },
    { href: '/dashboard/assets', label: t('sidebar.assets'), icon: Wrench },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background shadow-t-lg md:hidden">
      <div className="grid h-16 grid-cols-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-xs font-medium',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
