
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
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, FileUp } from 'lucide-react';
import { accountsPayable as initialData, costCenters, chartOfAccounts, setAccountsPayable, bankAccounts } from '@/lib/data';
import type { AccountsPayable, AccountsPayableStatus, CostCenter, ChartOfAccount, BankAccount } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const emptyAP: AccountsPayable = {
  id: '',
  description: '',
  supplierOrCreditor: '',
  dueDate: new Date().getTime(),
  value: 0,
  status: 'Pendente',
  costCenterId: '',
  chartOfAccountId: '',
  isRecurring: false,
  recurrenceFrequency: 'MENSAL',
  recurrenceInstallments: 1,
  bankAccountId: '',
};

export default function AccountsPayablePage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = React.useState<AccountsPayable[]>(initialData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<AccountsPayable | null>(null);
  const [formData, setFormData] = React.useState<AccountsPayable | null>(null);

  const [selectableAccounts, setSelectableAccounts] = React.useState<ChartOfAccount[]>([]);
  const [availableBankAccounts, setAvailableBankAccounts] = React.useState<BankAccount[]>([]);

  React.useEffect(() => {
    setSelectableAccounts(chartOfAccounts.filter(acc => !acc.isGroup));
    setAccounts(initialData.sort((a,b) => b.dueDate - a.dueDate));
    setAvailableBankAccounts(bankAccounts);
  }, []);

  const openDialog = (account: AccountsPayable | null = null) => {
    setEditingAccount(account);
    const data = account ? { ...account } : { ...emptyAP, id: `ap-${Date.now()}` };
    if(account?.isRecurring) {
        data.isRecurring = false; // Don't allow editing recurrence after creation
    }
    setFormData(data);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAccount(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    let finalValue: string | number = value;
    if (type === 'number') {
      finalValue = name === 'value' ? parseFloat(value) || 0 : parseInt(value, 10) || 1;
    }
    setFormData(prev => (prev ? { ...prev, [name]: finalValue } : null));
  };
  
  const handleSelectChange = (name: keyof AccountsPayable, value: string) => {
    if (!formData) return;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };
  
  const handleSwitchChange = (name: keyof AccountsPayable, checked: boolean) => {
    if (!formData) return;
    setFormData(prev => (prev ? ({...prev, [name]: checked }) : null));
  }

  const handleDateChange = (name: keyof AccountsPayable, date: Date | undefined) => {
    if (date && formData) {
      setFormData(prev => (prev ? { ...prev, [name]: date.getTime() } : null));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    if (editingAccount) {
        // Editing a single account
        const updatedAccounts = accounts.map(acc => (acc.id === formData.id ? formData : acc));
        setAccountsPayable(updatedAccounts);
        setAccounts(updatedAccounts.sort((a,b) => b.dueDate - a.dueDate));
    } else if (formData.isRecurring && formData.recurrenceInstallments > 1) {
        // Creating new recurring accounts
        const newAccounts: AccountsPayable[] = [];
        const baseDescription = formData.description;
        const firstDueDate = new Date(formData.dueDate);

        for(let i = 0; i < formData.recurrenceInstallments; i++) {
            const newAccount: AccountsPayable = {
                ...formData,
                id: `ap-${Date.now()}-${i}`,
                isRecurring: false, // Only the parent "idea" is recurring
                description: `${baseDescription} (Parcela ${i + 1}/${formData.recurrenceInstallments})`,
                dueDate: addMonths(firstDueDate, i).getTime(),
            };
            newAccounts.push(newAccount);
        }
        const updatedAccounts = [...newAccounts, ...accounts];
        setAccountsPayable(updatedAccounts);
        setAccounts(updatedAccounts.sort((a,b) => b.dueDate - a.dueDate));
    } else {
        // Creating a single new account
        const updatedAccounts = [formData, ...accounts];
        setAccountsPayable(updatedAccounts);
        setAccounts(updatedAccounts.sort((a,b) => b.dueDate - a.dueDate));
    }

    closeDialog();
  };

  const getCostCenterName = (id: string) => costCenters.find(c => c.id === id)?.name || 'N/A';
  const getChartOfAccountName = (id: string) => chartOfAccounts.find(c => c.id === id)?.name || 'N/A';
  
  const getStatusBadgeVariant = (status: AccountsPayableStatus) => {
      switch (status) {
          case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'Paga': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
          case 'Vencida': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.accountsPayable')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Lançar Despesa
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Fornecedor/Credor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Centro de Custo</TableHead>
              <TableHead>Conta Contábil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map(account => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.description}</TableCell>
                <TableCell>{account.supplierOrCreditor}</TableCell>
                <TableCell>{format(new Date(account.dueDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell>R$ {account.value.toFixed(2)}</TableCell>
                <TableCell>{getCostCenterName(account.costCenterId)}</TableCell>
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

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Editar Lançamento' : 'Novo Lançamento a Pagar'}</DialogTitle>
              <DialogDescription>
                Registre uma despesa ou custo da empresa.
              </DialogDescription>
            </DialogHeader>
            {formData && (
            <form id="ap-form" onSubmit={handleSave}>
              <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                <div className="space-y-4 py-4 px-1">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required placeholder="Ex: Aluguel do Escritório" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="supplierOrCreditor">Fornecedor / Credor</Label>
                    <Input id="supplierOrCreditor" name="supplierOrCreditor" value={formData.supplierOrCreditor} onChange={handleInputChange} required placeholder="Ex: Imobiliária Central" />
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
                          <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v as AccountsPayableStatus)} required>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Pendente">Pendente</SelectItem>
                                  <SelectItem value="Paga">Paga</SelectItem>
                                  <SelectItem value="Vencida">Vencida</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="costCenterId">Centro de Custo</Label>
                            <Select name="costCenterId" value={formData.costCenterId} onValueChange={(v) => handleSelectChange('costCenterId', v)} required>
                                <SelectTrigger><SelectValue placeholder="Selecione o centro de custo" /></SelectTrigger>
                                <SelectContent>
                                    {costCenters.map(cc => <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chartOfAccountId">Conta Contábil</Label>
                            <Select name="chartOfAccountId" value={formData.chartOfAccountId} onValueChange={(v) => handleSelectChange('chartOfAccountId', v)} required>
                                <SelectTrigger><SelectValue placeholder="Selecione a conta contábil" /></SelectTrigger>
                                <SelectContent>
                                   {selectableAccounts.map(ca => <SelectItem key={ca.id} value={ca.id}>{ca.code} - {ca.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {formData.status === 'Paga' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="paymentDate">Data do Pagamento</Label>
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
                                <Label htmlFor="bankAccountId">Conta de Pagamento</Label>
                                <Select name="bankAccountId" value={formData.bankAccountId} onValueChange={(v) => handleSelectChange('bankAccountId', v)}>
                                    <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                                    <SelectContent>
                                        {availableBankAccounts.map(ba => <SelectItem key={ba.id} value={ba.id}>{ba.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}


                    {!editingAccount && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                 <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="isRecurring">Lançamento Recorrente</Label>
                                        <p className="text-xs text-muted-foreground">Gerar automaticamente as próximas parcelas desta despesa.</p>
                                    </div>
                                    <Switch id="isRecurring" name="isRecurring" checked={formData.isRecurring} onCheckedChange={(checked) => handleSwitchChange('isRecurring', checked)} />
                                </div>
                                {formData.isRecurring && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="recurrenceFrequency">Frequência</Label>
                                            <Select name="recurrenceFrequency" value={formData.recurrenceFrequency} onValueChange={(v) => handleSelectChange('recurrenceFrequency', v as 'MENSAL')}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MENSAL">Mensal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="recurrenceInstallments">Nº de Parcelas</Label>
                                            <Input id="recurrenceInstallments" name="recurrenceInstallments" type="number" min="2" value={formData.recurrenceInstallments} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleInputChange} placeholder="Detalhes adicionais, número da nota fiscal, etc."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="documentUrl">Anexar Documento</Label>
                         <div className="flex items-center gap-2">
                            <Input id="documentUrl" name="documentUrl" type="file" className="flex-1" />
                            <Button variant="outline" size="icon" type="button"><FileUp className="h-4 w-4" /></Button>
                        </div>
                        {formData.documentUrl && <p className="text-xs text-muted-foreground">Arquivo atual: {formData.documentUrl}</p>}
                    </div>

                </div>
              </ScrollArea>
            </form>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
              <Button type="submit" form="ap-form">{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}

    
