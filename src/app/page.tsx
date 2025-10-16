'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center mb-6">
        <Logo />
      </div>
      <h1 className="text-4xl font-bold font-headline mb-2">Build Successful!</h1>
      <p className="text-muted-foreground mb-6">The application is now in a minimal functional state.</p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}