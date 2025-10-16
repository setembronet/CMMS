'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function ThemeToggle() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('light');

  React.useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme;
    setTheme(initialTheme);
  }, []);
  
  React.useEffect(() => {
    if(isMounted) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    }
  }, [theme, isMounted]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!isMounted) {
    return <Skeleton className="h-10 w-10" />;
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
