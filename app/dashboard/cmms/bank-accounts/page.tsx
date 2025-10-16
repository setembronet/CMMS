
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { PlusCircle, Landmark, ArrowUpCircle, ArrowDownCircle, FileText } from 'lucide-react';
import { bankAccounts as initialData, setBankAccounts, accountsPayable, accountsReceivable } from '@/lib/data';
import type { BankAccount, AccountsPayable, AccountsReceivable } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type StatementEntry = {
    date: number;
    description: string;
    value: number;
    type: 'credit' | 'debit';
};

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
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<BankAccount | null>(null);
  const [formData, setFormData] = React.useState<BankAccount | null>(null);
  
  const [isStatementOpen, setIsStatementOpen] = React.useState(false);
  const [viewingAccount, setViewingAccount] = React.useState<BankAccount | null>(null);
  const [statement, setStatement] = React.useState<StatementEntry[]>([]);

  React.useEffect(() => {
    setAccounts(initialData);
  }, []);

  const openFormDialog = (account: BankAccount | null = null) => {
    setEditingAccount(account);
    const data = account ? { ...account } : { ...emptyAccount, id: `ba-${Date.now()}`};
    setFormData(data);
    setIsFormOpen(true);
  };
  
  const openStatementDialog = (account: BankAccount) => {
    setViewingAccount(account);

    const debits = accountsPayable
      .filter(ap => ap.status === 'Paga' && ap.bankAccountId === account.id && ap.paymentDate)
      .map(ap => ({
        date: ap.paymentDate!,
        description: ap.description,
        value: -ap.value,
        type: 'debit' as const,
      }));

    const credits = accountsReceivable
      .filter(ar => ar.status === 'Paga' && ar.bankAccountId === account.id && ar.paymentDate)
      .map(ar => ({
        date: ar.paymentDate!,
        description: ar.description,
        value: ar.value,
        type: 'credit' as const,
      }));

    const fullStatement = [...debits, ...credits].sort((a, b) => b.date - a.date);
    setStatement(fullStatement);
    setIsStatementOpen(true);
  };

  const closeFormDialog = () => {
    setEditingAccount(null);
    setIsFormOpen(false);
    setFormData(null);
  };
  
  const closeStatementDialog = () => {
    setIsStatementOpen(false);
    setViewingAccount(null);
    setStatement([]);
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
    closeFormDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.bankAccounts')}</h1>
        <Button onClick={() => openFormDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('bankAccounts.new')}
        </Button>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <Card key={account.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg">{account.name}</CardTitle>
                <Landmark className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                {account.bank ? `${account.bank} | Ag: ${account.agency || 'N/A'} | CC: ${account.accountNumber || 'N/A'}` : 'Conta Interna (Caixa)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-xs text-muted-foreground">Saldo Atual</p>
              <p className={cn("text-2xl font-bold", account.balance < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-500')}>
                R$ {account.balance.toFixed(2)}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={() => openStatementDialog(account)} className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Ver Extrato
              </Button>
              <Button onClick={() => openFormDialog(account)} variant="outline">
                {t('common.edit')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
              <Button type="button" variant="outline" onClick={closeFormDialog}>{t('common.cancel')}</Button>
              <Button type="submit" form="ba-form">{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isStatementOpen} onOpenChange={closeStatementDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Extrato da Conta: {viewingAccount?.name}</DialogTitle>
              <DialogDescription>
                Histórico de movimentações realizadas nesta conta.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.length > 0 ? statement.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className={cn(
                        "text-right font-medium flex items-center justify-end gap-2",
                        entry.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {entry.type === 'credit' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                        R$ {Math.abs(entry.value).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">Nenhuma movimentação registrada.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
             <DialogFooter>
              <Button type="button" variant="outline" onClick={closeStatementDialog}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

    </div>
  );
}

    