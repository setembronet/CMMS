
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <Logo />
      <Loader2 className="mt-4 h-6 w-6 animate-spin" />
      <p className="mt-2 text-muted-foreground">Redirecionando para o painel...</p>
    </div>
  );
}
