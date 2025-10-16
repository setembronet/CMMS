
'use client';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from './user-nav';
import { ThemeToggle } from '../theme-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Languages, ChevronsUpDown } from 'lucide-react';
import { useI18n } from '../../hooks/use-i18n';
import { useClient } from '../../context/client-provider';
import { companies } from '../../lib/data';

export function Header() {
  const { setLocale, t } = useI18n();
  const { selectedClient, setSelectedClientId, currentUser } = useClient();

  const isTechnician = currentUser?.cmmsRole === 'TECNICO';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      {!isTechnician && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[220px] justify-between">
              {selectedClient ? selectedClient.name : t('header.selectClient')}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[220px]">
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => setSelectedClientId(company.id)}
              >
                {company.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}


      <div className="flex w-full items-center justify-end gap-4">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">{t('header.changeLanguage')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale('pt')}>Português</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('es')}>Español</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
