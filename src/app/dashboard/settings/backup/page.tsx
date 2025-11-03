
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
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
import { useCollection } from '@/firebase/firestore';
import type { AccountsPayable, AccountsReceivable, Asset, BankAccount, CMMSRole, ChartOfAccount, ChecklistTemplate, Company, CompanySegment, Contract, CostCenter, CustomerLocation, Plan, Product, PurchaseOrder, Schedule, Supplier, User, Addon } from '@/lib/types';


export default function BackupPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [fileToRestore, setFileToRestore] = React.useState<File | null>(null);

  // Fetch all data from firestore
  const { data: companies } = useCollection<Company>('companies');
  const { data: segments } = useCollection<CompanySegment>('segments');
  const { data: cmmsRoles } = useCollection<CMMSRole>('cmmsRoles');
  const { data: customerLocations } = useCollection<CustomerLocation>('customerLocations');
  const { data: users } = useCollection<User>('users');
  const { data: assets } = useCollection<Asset>('assets');
  const { data: contracts } = useCollection<Contract>('contracts');
  const { data: products } = useCollection<Product>('products');
  const { data: suppliers } = useCollection<Supplier>('suppliers');
  const { data: workOrders } = useCollection<WorkOrder>('workOrders');
  const { data: costCenters } = useCollection<CostCenter>('costCenters');
  const { data: chartOfAccounts } = useCollection<ChartOfAccount>('chartOfAccounts');
  const { data: accountsPayable } = useCollection<AccountsPayable>('accountsPayable');
  const { data: accountsReceivable } = useCollection<AccountsReceivable>('accountsReceivable');
  const { data: bankAccounts } = useCollection<BankAccount>('bankAccounts');
  const { data: checklistTemplates } = useCollection<ChecklistTemplate>('checklistTemplates');
  const { data: schedules } = useCollection<Schedule>('schedules');
  const { data: plans } = useCollection<Plan>('plans');
  const { data: addons } = useCollection<Addon>('addons');

  const getBackupData = () => {
    return {
      companies,
      segments,
      cmmsRoles,
      customerLocations,
      users,
      assets,
      contracts,
      products,
      suppliers,
      workOrders,
      costCenters,
      chartOfAccounts,
      accountsPayable,
      accountsReceivable,
      bankAccounts,
      checklistTemplates,
      schedules,
      plans,
      addons,
    };
  };

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

    // This is a placeholder for a real restore logic which would require
    // writing to Firestore. For now, it just shows a success message.
    toast({
        variant: "destructive",
        title: "Função não implementada",
        description: "A restauração de dados a partir de um arquivo ainda não é suportada nesta versão.",
    });

    // We clear the input value manually
    const fileInput = document.getElementById('restore-file') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
    setFileToRestore(null);

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
