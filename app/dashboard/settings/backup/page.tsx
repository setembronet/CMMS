
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { getBackupData, restoreData } from '@/lib/data';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useI18n } from '@/hooks/use-i18n';

export default function BackupPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [fileToRestore, setFileToRestore] = React.useState<File | null>(null);

  const handleBackup = () => {
    try {
      const backupData = getBackupData();
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `tenantcare_backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t('backup.backupSuccessTitle'),
        description: t('backup.backupSuccessDescription'),
      });
    } catch (error) {
      console.error(t('backup.backupErrorLog'), error);
      toast({
        variant: 'destructive',
        title: t('backup.backupErrorTitle'),
        description: t('backup.backupErrorDescription'),
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setFileToRestore(file);
    } else {
      setFileToRestore(null);
      toast({
        variant: 'destructive',
        title: t('backup.invalidFileTitle'),
        description: t('backup.invalidFileDescription'),
      });
    }
  };

  const handleRestore = () => {
    if (!fileToRestore) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error(t('backup.fileReadError'));
        }
        const data = JSON.parse(text);
        restoreData(data);
        toast({
          title: t('backup.restoreSuccessTitle'),
          description: t('backup.restoreSuccessDescription'),
        });
        setFileToRestore(null);
        // We clear the input value manually
        const fileInput = document.getElementById('restore-file') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
      } catch (error) {
        console.error(t('backup.restoreErrorLog'), error);
        toast({
          variant: 'destructive',
          title: t('backup.restoreErrorTitle'),
          description: t('backup.restoreErrorDescription'),
        });
      }
    };
    reader.readAsText(fileToRestore);
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">{t('backup.title')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('backup.doBackupTitle')}</CardTitle>
          <CardDescription>{t('backup.doBackupDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackup}>
            <Download className="mr-2 h-4 w-4" />
            {t('backup.doBackupButton')}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t('backup.restoreBackupTitle')}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>{t('backup.restoreWarning')}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restore-file">{t('backup.backupFileLabel')}</Label>
            <Input id="restore-file" type="file" accept=".json" onChange={handleFileChange} />
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!fileToRestore}>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('backup.restoreDataButton')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('backup.confirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('backup.confirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleRestore}>{t('backup.confirmAction')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
