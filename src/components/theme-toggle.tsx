'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function ThemeToggle() {
  const [isMounted, setIsMounted] = React.useState(false);
  // We'll read the theme from the document inside useEffect
  const [theme, setTheme] = React.useState<'dark' | 'light'>('light');

  React.useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    setIsMounted(true);
    const storedTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // While not mounted on the client, render a placeholder.
  if (!isMounted) {
    return <Skeleton className="h-10 w-10" />;
  }

  // Once mounted, render the actual button.
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
