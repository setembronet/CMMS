
'use client';

import * as React from 'react';
import { add, format, nextDay } from 'date-fns';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react';
import { subscriptions as initialSubscriptions, companies, plans, addons, customerLocations as allCustomerLocations } from '@/lib/data';
import type { Subscription, Plan, Addon, Company, SubscriptionStatus, BillingPeriod, CustomerLocation } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


const emptySubscription: Subscription = {
  id: '',
  companyId: '',
  customerLocationId: '',
  planId: '',
  status: 'ATIVA',
  period: 'MONTHLY',
  startDate: new Date().getTime(),
  nextBillingDate: add(new Date(), { months: 1 }).getTime(),
  totalValue: 0,
  activeAddons: [],
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>(initialSubscriptions);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSubscription, setEditingSubscription] = React.useState<Subscription | null>(null);
  const [formData, setFormData] = React.useState<Subscription>(emptySubscription);
  const [totalValue, setTotalValue] = React.useState(0);
  const [availableLocations, setAvailableLocations] = React.useState<CustomerLocation[]>([]);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'N/A';
  const getPlanName = (id: string) => plans.find(p => p.id === id)?.name || 'N/A';
  const getPlan = (id: string) => plans.find(p => p.id === id);
  const getLocationName = (id: string) => allCustomerLocations.find(l => l.id === id)?.name || 'N/A';


  React.useEffect(() => {
    const plan = getPlan(formData.planId);
    if (!plan) {
      setTotalValue(0);
      return;
    }

    let planPrice = plan.price;
    const addonsPrice = formData.activeAddons.reduce((sum, addon) => sum + addon.price, 0);

    const periodMultipliers = {
      'MONTHLY': 1,
      'QUARTERLY': 3,
      'SEMIANNUALLY': 6,
      'ANNUALLY': 12,
    };
    const multiplier = periodMultipliers[formData.period];

    setTotalValue((planPrice + addonsPrice) * multiplier);

  }, [formData.planId, formData.activeAddons, formData.period]);

  React.useEffect(() => {
    if (formData.companyId) {
      setAvailableLocations(allCustomerLocations.filter(loc => loc.clientId === formData.companyId));
      // Reset customerLocationId if it's no longer valid for the selected company
      if (!allCustomerLocations.some(loc => loc.clientId === formData.companyId && loc.id === formData.customerLocationId)) {
        setFormData(prev => ({...prev, customerLocationId: ''}));
      }
    } else {
      setAvailableLocations([]);
    }
  }, [formData.companyId, formData.customerLocationId]);

  const openDialog = (subscription: Subscription | null = null) => {
    setEditingSubscription(subscription);
    setFormData(subscription ? JSON.parse(JSON.stringify(subscription)) : emptySubscription);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingSubscription(null);
    setIsDialogOpen(false);
    setFormData(emptySubscription);
  };

  const handleSelectChange = (name: keyof Subscription, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
        setFormData(prev => ({ ...prev, startDate: date.getTime() }));
    }
  };
  
  const handleAddonSwitchChange = (addon: Addon, checked: boolean) => {
    setFormData(prev => {
        const activeAddons = checked 
            ? [...prev.activeAddons, addon]
            : prev.activeAddons.filter(a => a.id !== addon.id);
        return { ...prev, activeAddons };
    });
  }

  const handleSaveSubscription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const plan = getPlan(formData.planId);
    if (!plan) return;

    const periodMap = {
        'MONTHLY': { months: 1 },
        'QUARTERLY': { months: 3 },
        'SEMIANNUALLY': { months: 6 },
        'ANNUALLY': { years: 1 },
    }
    
    const newSubscription: Subscription = {
      ...formData,
      id: editingSubscription?.id || `sub_${Date.now()}`,
      totalValue: totalValue,
      nextBillingDate: add(new Date(formData.startDate), periodMap[formData.period]).getTime()
    };

    if (editingSubscription) {
      setSubscriptions(subscriptions.map(s => s.id === newSubscription.id ? newSubscription : s));
    } else {
      setSubscriptions([newSubscription, ...subscriptions]);
    }
    closeDialog();
  };

  const periodLabels: Record<BillingPeriod, string> = {
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    SEMIANNUALLY: 'Semestral',
    ANNUALLY: 'Anual',
  };
  
  const statusLabels: Record<SubscriptionStatus, string> = {
    ATIVA: 'Ativa',
    CANCELADA: 'Cancelada',
    PAUSADA: 'Pausada',
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gerenciamento de Assinaturas</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Assinatura
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente Final</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Próxima Cobrança</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map(sub => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{getLocationName(sub.customerLocationId)}</TableCell>
                <TableCell>{getCompanyName(sub.companyId)}</TableCell>
                <TableCell>{getPlanName(sub.planId)}</TableCell>
                <TableCell>R$ {(sub.totalValue).toLocaleString('pt-BR')}</TableCell>
                <TableCell>{format(new Date(sub.nextBillingDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === 'ATIVA' ? 'secondary' : 'destructive'} className={cn(sub.status === 'ATIVA' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300')}>{statusLabels[sub.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(sub)}>
                        Editar
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingSubscription ? 'Editar Assinatura' : 'Nova Assinatura'}</DialogTitle>
            <DialogDescription>
              {editingSubscription ? 'Atualize os detalhes da assinatura.' : 'Crie um novo contrato de assinatura para um cliente final.'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto -mx-6 px-6" style={{ height: 'calc(80vh - 150px)' }}>
            <ScrollArea className="h-full pr-6">
              <form onSubmit={handleSaveSubscription} id="subscription-form" className="space-y-6 py-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyId">Empresa (Cliente SaaS)</Label>
                        <Select name="companyId" value={formData.companyId} onValueChange={(value) => handleSelectChange('companyId', value)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma empresa" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerLocationId">Cliente Final</Label>
                        <Select name="customerLocationId" value={formData.customerLocationId} onValueChange={(value) => handleSelectChange('customerLocationId', value)} required disabled={!formData.companyId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um cliente final" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} required>
                        <SelectTrigger className="w-full md:w-1/2">
                            <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(statusLabels) as SubscriptionStatus[]).map(s => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Detalhes do Plano e Faturamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planId">Plano</Label>
                    <Select name="planId" value={formData.planId} onValueChange={(value) => handleSelectChange('planId', value)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                        <SelectContent>
                            {plans.map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>{plan.name} - R$ {plan.price}/mês</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period">Período de Faturamento</Label>
                    <Select name="period" value={formData.period} onValueChange={(value) => handleSelectChange('period', value)} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(periodLabels) as BillingPeriod[]).map(p => <SelectItem key={p} value={p}>{periodLabels[p]}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Escolha uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={formData.startDate ? new Date(formData.startDate) : undefined} onSelect={handleDateChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-4">
                    <Label>Add-ons</Label>
                    <div className="space-y-2">
                        {addons.map(addon => (
                          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm" key={addon.id}>
                                <div className="space-y-0.5">
                                    <Label htmlFor={addon.id}>{addon.name}</Label>
                                    <p className="text-xs text-muted-foreground">R$ {addon.price}/mês</p>
                                </div>
                              <Switch 
                                  id={addon.id} 
                                  checked={formData.activeAddons.some(a => a.id === addon.id)}
                                  onCheckedChange={(checked) => handleAddonSwitchChange(addon, checked)} 
                              />
                          </div>
                        ))}
                    </div>
                </div>

                <Separator />
                
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <h3 className="text-lg font-medium">Resumo</h3>
                    <div className="flex justify-between">
                        <span>Plano Base ({getPlan(formData.planId)?.name || ''})</span>
                        <span>R$ {getPlan(formData.planId)?.price.toLocaleString('pt-BR') || '0,00'}</span>
                    </div>
                    {formData.activeAddons.map(addon => (
                        <div className="flex justify-between" key={addon.id}>
                            <span>Add-on: {addon.name}</span>
                            <span>R$ {addon.price.toLocaleString('pt-BR')}</span>
                        </div>
                    ))}
                    <div className="flex justify-between">
                        <span>Período:</span>
                        <span>{periodLabels[formData.period]}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Valor Total do Período</span>
                        <span>R$ {totalValue.toLocaleString('pt-BR')}</span>
                    </div>
                </div>
              </form>
            </ScrollArea>
          </div>
          <DialogFooter className="pt-4 mt-4 border-t bg-background">
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="subscription-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
