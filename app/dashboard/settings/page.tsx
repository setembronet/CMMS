
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ThemeToggle } from "../../../components/theme-toggle";
import { useI18n } from "../../../hooks/use-i18n";

export default function SettingsPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">{t('sidebar.settings')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profileTitle')}</CardTitle>
          <CardDescription>{t('settings.profileDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('common.name')}</Label>
            <Input id="name" defaultValue="Admin Master" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('common.email')}</Label>
            <Input id="email" type="email" defaultValue="admin@tenantcare.com" />
          </div>
          <Button>{t('common.saveChanges')}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearanceTitle')}</CardTitle>
          <CardDescription>{t('settings.appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.themeLabel')}</Label>
              <p className="text-sm text-muted-foreground">{t('settings.themeDescription')}</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.passwordTitle')}</CardTitle>
          <CardDescription>{t('settings.passwordDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
            <Input id="new-password" type="password" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('settings.confirmPassword')}</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>{t('settings.updatePassword')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
