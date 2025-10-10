
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useI18n } from '@/hooks/use-i18n';
import { I18nProvider } from '@/context/i18n-provider';


function LoginPageContent() {
  const { t } = useI18n();

  return (
     <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl font-headline">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input id="email" type="email" placeholder="seu.email@exemplo.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t('settings.passwordTitle')}</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">{t('login.button')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


export default function LoginPage() {
  return (
    <I18nProvider>
      <LoginPageContent />
    </I18nProvider>
  )
}

    