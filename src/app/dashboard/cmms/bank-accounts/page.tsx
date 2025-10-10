
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { bankAccounts as initialData, setBankAccounts } from '@/lib/data';
import type { BankAccount } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';

const emptyAccount: BankAccount = {
  id: '',
  name: '',
  bank: '',
  agency: '',
  accountNumber: '',
  balance: 0,
};

export default function BankAccountsPage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = React.useState<BankAccount[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<BankAccount | null>(null);
  const [formData, setFormData] = React.useState<BankAccount | null>(null);
  
  React.useEffect(() => {
    setAccounts(initialData);
  }, []);

  const openDialog = (account: BankAccount | null = null) => {
    setEditingAccount(account);
    const data = account ? { ...account } : { ...emptyAccount, id: `ba-${Date.now()}`};
    setFormData(data);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAccount(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => (prev ? { ...prev, [name]: finalValue } : null));
  };
  
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    let updatedAccounts;
    if (editingAccount) {
      updatedAccounts = accounts.map(acc => (acc.id === formData.id ? formData : acc));
    } else {
      updatedAccounts = [formData, ...accounts];
    }
    setBankAccounts(updatedAccounts);
    setAccounts(updatedAccounts);
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.bankAccounts')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('bankAccounts.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('bankAccounts.table.name')}</TableHead>
              <TableHead>{t('bankAccounts.table.bank')}</TableHead>
              <TableHead>{t('bankAccounts.table.agency')}</TableHead>
              <TableHead>{t('bankAccounts.table.account')}</TableHead>
              <TableHead>{t('bankAccounts.table.balance')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(account => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.bank || 'N/A'}</TableCell>
                <TableCell>{account.agency || 'N/A'}</TableCell>
                <TableCell>{account.accountNumber || 'N/A'}</TableCell>
                <TableCell>R$ {account.balance.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(account)}>
                        {t('common.edit')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAccount ? t('bankAccounts.dialog.editTitle') : t('bankAccounts.dialog.newTitle')}</DialogTitle>
              <DialogDescription>{t('bankAccounts.dialog.description')}</DialogDescription>
            </DialogHeader>
            {formData && (
              <form id="ba-form" onSubmit={handleSave} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('bankAccounts.dialog.name')}</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder={t('bankAccounts.dialog.namePlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank">{t('bankAccounts.dialog.bank')}</Label>
                  <Input id="bank" name="bank" value={formData.bank || ''} onChange={handleInputChange} placeholder={t('bankAccounts.dialog.bankPlaceholder')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agency">{t('bankAccounts.dialog.agency')}</Label>
                    <Input id="agency" name="agency" value={formData.agency || ''} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">{t('bankAccounts.dialog.account')}</Label>
                    <Input id="accountNumber" name="accountNumber" value={formData.accountNumber || ''} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">{t('bankAccounts.dialog.balance')}</Label>
                  <Input id="balance" name="balance" type="number" step="0.01" value={formData.balance} onChange={handleInputChange} required />
                </div>
              </form>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
              <Button type="submit" form="ba-form">{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
