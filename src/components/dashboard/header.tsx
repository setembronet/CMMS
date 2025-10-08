import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
