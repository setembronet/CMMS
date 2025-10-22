

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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { 
    customerLocations, 
    chartOfAccounts, 
    generateReceivablesFromContracts
} from '@/lib/data';
import type { AccountsReceivable, AccountsReceivableStatus, CustomerLocation, ChartOfAccount, BankAccount } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { useClient } from '@/context/client-provider';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument, updateDocument } from '@/firebase/firestore';


const emptyAR: Omit<AccountsReceivable, 'id'> = {
  description: '',
  customerLocationId: '',
  dueDate: new Date().getTime(),
  value: 0,
  status: 'Pendente',
  chartOfAccountId: '',
  bankAccountId: '',
};

export default function AccountsReceivablePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { selectedClient } = useClient();
  const firestore = useFirestore();

  const { data: accounts, loading: accountsLoading, setData: setAccounts } = useCollection<AccountsReceivable>('accountsReceivable');
  const { data: allLocations, loading: locationsLoading } = useCollection<CustomerLocation>('customerLocations');
  const { data: availableBankAccounts, loading: bankAccountsLoading } = useCollection<BankAccount>('bankAccounts');

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<AccountsReceivable | null>(null);
  const [formData, setFormData] = React.useState<Omit<AccountsReceivable, 'id'>>(emptyAR);

  const [clientLocations, setClientLocations] = React.useState<CustomerLocation[]>([]);
  const [revenueAccounts, setRevenueAccounts] = React.useState<ChartOfAccount[]>([]);
  
  const clientAccounts = React.useMemo(() => {
    if (!selectedClient || locationsLoading) return [];
    const locationIds = allLocations.filter(loc => loc.clientId === selectedClient.id).map(l => l.id);
    return accounts.filter(ar => locationIds.includes(ar.customerLocationId)).sort((a,b) => b.dueDate - a.dueDate);
  }, [accounts, selectedClient, allLocations, locationsLoading]);


  React.useEffect(() => {
    if (selectedClient && !locationsLoading) {
      setClientLocations(allLocations.filter(loc => loc.clientId === selectedClient.id));
    } else {
      setClientLocations([]);
    }
    setRevenueAccounts(chartOfAccounts.filter(acc => acc.type === 'RECEITA' && !acc.isGroup));
  }, [selectedClient, allLocations, locationsLoading]);

  const openDialog = (account: AccountsReceivable | null = null) => {
    setEditingAccount(account);
    const { id, ...data } = account ? { ...account } : { ...emptyAR, id: '' };
    setFormData(data);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAccount(null);
    setIsDialogOpen(false);
    setFormData(emptyAR);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number = value;
    if (type === 'number') {
      finalValue = parseFloat(value) || 0;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleSelectChange = (name: keyof Omit<AccountsReceivable, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: keyof Omit<AccountsReceivable, 'id'>, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date.getTime() }));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !firestore) return;

    try {
        const originalAccount = editingAccount;
        const wasPaid = originalAccount?.status === 'Paga';
        const isNowPaid = formData.status === 'Paga';

        // --- Bank Balance Logic ---
        if (isNowPaid && !wasPaid && formData.bankAccountId && formData.value > 0) {
            const bankAccount = availableBankAccounts.find(ba => ba.id === formData.bankAccountId);
            if(bankAccount) {
                await updateDocument(firestore, 'bankAccounts', bankAccount.id, { balance: bankAccount.balance + formData.value });
                toast({ title: "Saldo Bancário Atualizado", description: "O saldo da conta foi ajustado." });
            }
        } else if (!isNowPaid && wasPaid && originalAccount?.bankAccountId && originalAccount.value > 0) {
            const bankAccount = availableBankAccounts.find(ba => ba.id === originalAccount.bankAccountId);
             if(bankAccount) {
                await updateDocument(firestore, 'bankAccounts', bankAccount.id, { balance: bankAccount.balance - originalAccount.value });
                toast({ title: "Saldo Bancário Revertido", description: "O saldo da conta foi ajustado." });
            }
        }
        
        if (editingAccount) {
            await updateDocument(firestore, 'accountsReceivable', editingAccount.id, formData);
        } else {
            await addDocument(firestore, 'accountsReceivable', formData);
        }
        
        toast({ title: "Sucesso!", description: "Lançamento salvo com sucesso."});
        closeDialog();
    } catch(err) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar o lançamento.' });
    }
  };

  const handleGenerateInvoices = async () => {
      if (!selectedClient || !firestore) return;
      const { newReceivables, generatedCount } = generateReceivablesFromContracts(selectedClient.id);
      
      if (generatedCount > 0) {
        // This is not efficient for batch writes in a real app, but works for this mock.
        for (const receivable of newReceivables) {
          const {id, ...receivableData} = receivable; // We don't need the mock ID
          const alreadyExists = accounts.some(ar => ar.description === receivable.description);
          if (!alreadyExists) {
            await addDocument(firestore, 'accountsReceivable', receivableData);
          }
        }
        
        toast({
            title: t('receivables.generationSuccessTitle'),
            description: t('receivables.generationSuccessDescription', { count: generatedCount }),
        });
      } else {
          toast({
              title: t('receivables.generationNoNewTitle'),
              description: t('receivables.generationNoNewDescription'),
          });
      }
  }


  const getLocationName = (id: string) => allLocations.find(c => c.id === id)?.name || 'N/A';
  const getChartOfAccountName = (id: string) => chartOfAccounts.find(c => c.id === id)?.name || 'N/A';
  
  const getStatusBadgeVariant = (status: AccountsReceivableStatus) => {
      switch (status) {
          case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'Paga': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
          case 'Vencida': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      }
  };
  
  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('clients.selectClientPrompt')}</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.accountsReceivable')}</h1>
        <div className="flex gap-2">
            <Button onClick={handleGenerateInvoices} variant="secondary">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('receivables.generateInvoicesButton')}
            </Button>
            <Button onClick={() => openDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Lançar Receita
            </Button>
        </div>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Cliente Final</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Conta Contábil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountsLoading || locationsLoading ? (
                 <TableRow><TableCell colSpan={7} className="h-24 text-center">Carregando...</TableCell></TableRow>
            ) : clientAccounts.map(account => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.description}</TableCell>
                <TableCell>{getLocationName(account.customerLocationId)}</TableCell>
                <TableCell>{format(new Date(account.dueDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell>R$ {account.value.toFixed(2)}</TableCell>
                <TableCell>{getChartOfAccountName(account.chartOfAccountId)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('border', getStatusBadgeVariant(account.status))}>
                    {account.status}
                  </Badge>
                </TableCell>
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

       <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Editar Lançamento' : 'Novo Lançamento a Receber'}</DialogTitle>
              <DialogDescription>
                Registre uma receita da sua operação.
              </DialogDescription>
            </DialogHeader>
            <form id="ar-form" onSubmit={handleSave}>
              <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                <div className="space-y-4 py-4 px-1">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Ex: Mensalidade Contrato Jan/24" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="customerLocationId">Cliente Final</Label>
                     <Select name="customerLocationId" value={formData.customerLocationId} onValueChange={(v) => handleSelectChange('customerLocationId', v)} required>
                        <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                        <SelectContent>
                            {clientLocations.map(cc => <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="dueDate">Data de Vencimento</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(new Date(formData.dueDate), "PPP", { locale: ptBR })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" locale={ptBR} selected={new Date(formData.dueDate)} onSelect={(d) => handleDateChange('dueDate', d)} initialFocus /></PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">Valor (R$)</Label>
                        <Input id="value" name="value" type="number" step="0.01" value={formData.value} onChange={handleInputChange} required />
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v as AccountsReceivableStatus)} required>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Pendente">Pendente</SelectItem>
                                  <SelectItem value="Paga">Paga</SelectItem>
                                  <SelectItem value="Vencida">Vencida</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  
                    {formData.status === 'Paga' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="paymentDate">Data do Recebimento</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.paymentDate ? format(new Date(formData.paymentDate), "PPP", { locale: ptBR }) : 'Selecione a data'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" locale={ptBR} selected={formData.paymentDate ? new Date(formData.paymentDate) : undefined} onSelect={(d) => handleDateChange('paymentDate', d)} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankAccountId">Conta de Destino</Label>
                                <Select name="bankAccountId" value={formData.bankAccountId} onValueChange={(v) => handleSelectChange('bankAccountId', v)} required>
                                    <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                                    <SelectContent>
                                        {bankAccountsLoading ? <SelectItem value="loading" disabled>Carregando...</SelectItem> : availableBankAccounts.map(ba => <SelectItem key={ba.id} value={ba.id}>{ba.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}


                    <div className="space-y-2">
                        <Label htmlFor="chartOfAccountId">Conta Contábil</Label>
                        <Select name="chartOfAccountId" value={formData.chartOfAccountId} onValueChange={(v) => handleSelectChange('chartOfAccountId', v)} required>
                            <SelectTrigger><SelectValue placeholder="Selecione a conta de receita" /></SelectTrigger>
                            <SelectContent>
                               {revenueAccounts.map(ca => <SelectItem key={ca.id} value={ca.id}>{ca.code} - {ca.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleInputChange} placeholder="Detalhes adicionais, número da fatura, etc."/>
                    </div>
                </div>
              </ScrollArea>
            </form>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
              <Button type="submit" form="ar-form">{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
