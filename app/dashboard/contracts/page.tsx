
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Trash2, FileText, ArrowUpDown } from 'lucide-react';
import { maintenanceFrequencies } from '@/lib/data';
import type { Contract, MaintenancePlan, ContractType, MaintenanceFrequency, CustomerLocation, Asset, ContractStatus, WorkOrder, Product, User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, differenceInMilliseconds, addDays } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument, updateDocument } from '@/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const emptyPlan: Omit<MaintenancePlan, 'id' | 'lastGenerated'> = {
  assetId: '',
  frequency: 'MENSAL',
  description: '',
};

type SortDescriptor = {
  column: keyof Contract | 'revenue' | 'costs' | 'margin';
  direction: 'ascending' | 'descending';
};


export default function ContractsPage() {
  const { selectedClient } = useClient();
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();

  const { data: allContracts, loading: contractsLoading } = useCollection<Contract>('contracts');
  const { data: allLocations, loading: locationsLoading } = useCollection<CustomerLocation>('customerLocations');
  const { data: allAssets, loading: assetsLoading } = useCollection<Asset>('assets');
  const { data: allWorkOrders, loading: workOrdersLoading } = useCollection<WorkOrder>('workOrders');
  const { data: allProducts, loading: productsLoading } = useCollection<Product>('products');
  const { data: allUsers, loading: usersLoading } = useCollection<User>('users');


  const [contracts, setLocalContracts] = React.useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingContract, setEditingContract] = React.useState<Contract | null>(null);
  const [formData, setFormData] = React.useState<Contract | null>(null);
  
  const [availableLocations, setAvailableLocations] = React.useState<CustomerLocation[]>([]);
  const [availableAssets, setAvailableAssets] = React.useState<Asset[]>([]);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor | null>(null);


  const dateLocale = React.useMemo(() => {
    switch (locale) {
      case 'en': return enUS;
      case 'es': return es;
      default: return ptBR;
    }
  }, [locale]);

  const emptyContract: Omit<Contract, 'id'> = React.useMemo(() => ({
    title: '',
    customerLocationId: '',
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
    monthlyValue: 0,
    contractType: 'Mão de Obra',
    coveredAssetIds: [],
    plans: [],
  }), []);


  const calculateContractCosts = React.useCallback((contract: Contract) => {
    const ninetyDaysAgo = addDays(new Date(), -90).getTime();
    const contractWorkOrders = allWorkOrders.filter(wo => 
      (contract.coveredAssetIds || []).includes(wo.assetId) &&
      wo.creationDate >= ninetyDaysAgo
    );

    let partsCost = 0;
    if (contract.contractType === 'Integral') {
        partsCost = contractWorkOrders.reduce((total, wo) => {
            const orderPartsCost = (wo.partsUsed || []).reduce((acc, part) => {
                const product = allProducts.find(p => p.id === part.productId);
                return acc + (product ? product.price * part.quantity : 0);
            }, 0);
            return total + orderPartsCost;
        }, 0);
    }
    
    const laborCost = contractWorkOrders.reduce((total, wo) => {
        if (!wo.startDate || !wo.endDate || !wo.responsibleId) return total;
        const technician = allUsers.find(u => u.id === wo.responsibleId);
        if (!technician || !technician.costPerHour) return total;
        
        const durationInHours = differenceInMilliseconds(new Date(wo.endDate), new Date(wo.startDate)) / (1000 * 60 * 60);
        return total + (durationInHours * technician.costPerHour);
    }, 0);

    return partsCost + laborCost;
  }, [allWorkOrders, allProducts, allUsers]);

  const isLoading = contractsLoading || locationsLoading || assetsLoading || workOrdersLoading || productsLoading || usersLoading;


  React.useEffect(() => {
    if (selectedClient && !isLoading) {
      const clientLocations = allLocations.filter(l => l.clientId === selectedClient.id);
      setAvailableLocations(clientLocations);
      const clientLocationIds = clientLocations.map(l => l.id);
      
      const enrichedContracts = allContracts
        .filter(c => clientLocationIds.includes(c.customerLocationId))
        .map(contract => {
            const revenue90d = contract.monthlyValue * 3;
            const costs90d = calculateContractCosts(contract);
            const margin = revenue90d > 0 ? (revenue90d - costs90d) / revenue90d : -1;
            return {
                ...contract,
                revenue90d,
                costs90d,
                margin,
            }
        });

      setLocalContracts(enrichedContracts);

    } else {
      setLocalContracts([]);
      setAvailableLocations([]);
    }
  }, [selectedClient, allContracts, allLocations, allAssets, allWorkOrders, allProducts, allUsers, isLoading, calculateContractCosts]);
  
  React.useEffect(() => {
    if (formData?.customerLocationId && !assetsLoading) {
        setAvailableAssets(allAssets.filter(a => a.customerLocationId === formData.customerLocationId));
    } else {
        setAvailableAssets([]);
    }
  }, [formData, allAssets, assetsLoading]);

  const sortedContracts = React.useMemo(() => {
    if (!sortDescriptor) return contracts;

    return [...contracts].sort((a, b) => {
        const first = a[sortDescriptor.column];
        const second = b[sortDescriptor.column];
        let cmp = (first < second) ? -1 : (first > second) ? 1 : 0;

        if (sortDescriptor.direction === 'descending') {
            cmp *= -1;
        }

        return cmp;
    });
  }, [contracts, sortDescriptor]);


  const requestSort = (column: keyof Contract | 'revenue' | 'costs' | 'margin') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortDescriptor && sortDescriptor.column === column && sortDescriptor.direction === 'ascending') {
        direction = 'descending';
    }
    setSortDescriptor({ column, direction });
  };


  const getLocationName = (id: string) => allLocations.find(l => l.id === id)?.name || 'N/A';
  const getAssetName = (id: string) => allAssets.find(a => a.id === id)?.name || 'N/A';

  const openDialog = (contract: Contract | null = null) => {
    setEditingContract(contract);
    const contractData = contract ? JSON.parse(JSON.stringify(contract)) : { ...emptyContract };
    setFormData(contractData as Contract);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingContract(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    // @ts-ignore
    setFormData(prev => prev ? ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }) : null);
  };

  const handleSelectChange = (name: keyof Contract, value: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };
  
  const handleDateChange = (name: keyof Contract, date: Date | undefined) => {
    if (date && formData) {
        setFormData(prev => prev ? ({...prev, [name]: date.getTime()}) : null);
    }
  }

  const handleAssetCoverageChange = (assetId: string, checked: boolean) => {
    if (!formData) return;
    setFormData(prev => {
        if (!prev) return null;
        const currentAssets = prev.coveredAssetIds || [];
        if (checked) {
            return {...prev, coveredAssetIds: [...currentAssets, assetId]};
        } else {
            return {...prev, coveredAssetIds: currentAssets.filter(id => id !== assetId)};
        }
    })
  };
  
  const addMaintenancePlan = () => {
    if (!formData) return;
    const newPlan = { ...emptyPlan, id: `plan-${Date.now()}`, lastGenerated: new Date().getTime() };
    setFormData(prev => prev ? ({
      ...prev,
      plans: [...(prev.plans || []), newPlan]
    }) : null);
  };

  const removeMaintenancePlan = (planId: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      plans: (prev.plans || []).filter(p => p.id !== planId)
    }) : null);
  };
  
  const handlePlanChange = (planId: string, field: keyof MaintenancePlan, value: string) => {
     if (!formData) return;
     setFormData(prev => prev ? ({
      ...prev,
      plans: (prev.plans || []).map(p => p.id === planId ? { ...p, [field]: value } : p)
    }) : null);
  };


  const handleSaveContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !firestore) return;
    
    const { id, ...contractData } = formData;

    try {
        if (editingContract) {
            await updateDocument(firestore, 'contracts', editingContract.id, contractData);
            toast({
                title: "Contrato Atualizado!",
                description: `O contrato "${contractData.title}" foi salvo com sucesso.`,
            });
        } else {
            await addDocument(firestore, 'contracts', contractData);
            toast({
                title: "Contrato Criado!",
                description: `O contrato "${contractData.title}" foi criado com sucesso.`,
            });
        }
        closeDialog();
    } catch (error) {
        console.error("Erro ao salvar contrato:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar o contrato. Tente novamente."
        });
    }
  };
  
  const getStatus = (contract: Contract): ContractStatus => {
    const today = new Date().getTime();
    const thirtyDaysFromNow = new Date().setDate(new Date().getDate() + 30);
    
    if (contract.endDate < today) return 'Vencido';
    if (contract.endDate < thirtyDaysFromNow) return 'Próximo a Vencer';
    return 'Vigente';
  }

  const getStatusBadgeVariant = (status: ContractStatus) => {
      switch (status) {
          case 'Vigente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
          case 'Próximo a Vencer': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'Vencido': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      }
  }

  const translatedContractStatus = (status: ContractStatus) => {
    switch (status) {
      case 'Vigente': return t('clients.status.current');
      case 'Próximo a Vencer': return t('clients.status.expiring');
      case 'Vencido': return t('clients.status.expired');
    }
  }

  const getMarginStyle = (margin: number) => {
      if (margin < 0) return "text-destructive";
      if (margin < 0.2) return "text-amber-600 dark:text-amber-500";
      return "text-green-600 dark:text-green-500";
  }


  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('contracts.selectClientPrompt')}</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('contracts.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('contracts.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('contracts.table.title')}</TableHead>
              <TableHead>{t('contracts.table.finalClient')}</TableHead>
              <TableHead>Receita (90d)</TableHead>
              <TableHead>Custos (90d)</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('margin')} className="px-1">
                    Margem % (90d)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>{t('contracts.table.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {isLoading ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">Carregando contratos...</TableCell>
                </TableRow>
            ) : sortedContracts.map(contract => {
                const status = getStatus(contract);
                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>{getLocationName(contract.customerLocationId)}</TableCell>
                    <TableCell>R$ {contract.revenue90d.toFixed(2)}</TableCell>
                    <TableCell>R$ {contract.costs90d.toFixed(2)}</TableCell>
                    <TableCell className={cn("font-semibold", getMarginStyle(contract.margin))}>
                      {contract.margin === -1 ? 'N/A' : `${(contract.margin * 100).toFixed(1)}%`}
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn('border', getStatusBadgeVariant(status))}>
                            {translatedContractStatus(status)}
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
                          <DropdownMenuItem onClick={() => openDialog(contract)}>
                            {t('common.edit')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl">
             <DialogHeader>
              <DialogTitle>{editingContract ? t('contracts.dialog.editTitle') : t('contracts.dialog.newTitle')}</DialogTitle>
              <DialogDescription>
                {t('contracts.dialog.description')}
              </DialogDescription>
            </DialogHeader>
            {formData && (
              <>
              <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                  <form id="contract-form" onSubmit={handleSaveContract} className="space-y-6 py-4 px-1">
                      <h3 className="text-lg font-medium">{t('contracts.dialog.generalData')}</h3>
                      <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="customerLocationId">{t('contracts.dialog.finalClient')}</Label>
                                  <Select name="customerLocationId" value={formData.customerLocationId} onValueChange={(value) => handleSelectChange('customerLocationId', value)} required>
                                      <SelectTrigger><SelectValue placeholder={t('contracts.dialog.finalClientPlaceholder')} /></SelectTrigger>
                                      <SelectContent>
                                          {availableLocations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="title">{t('contracts.dialog.title')}</Label>
                                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder={t('contracts.dialog.titlePlaceholder')}/>
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="startDate">{t('contracts.dialog.startDate')}</Label>
                                  <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}>
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {formData.startDate ? format(new Date(formData.startDate), "PPP", { locale: dateLocale }) : <span>{t('contracts.dialog.selectDate')}</span>}
                                          </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0"><Calendar mode="single" locale={dateLocale} selected={new Date(formData.startDate)} onSelect={(d) => handleDateChange('startDate', d)} initialFocus /></PopoverContent>
                                  </Popover>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="endDate">{t('contracts.dialog.endDate')}</Label>
                                  <Popover>
                                      <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.endDate && "text-muted-foreground")}>
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {formData.endDate ? format(new Date(formData.endDate), "PPP", { locale: dateLocale }) : <span>{t('contracts.dialog.selectDate')}</span>}
                                          </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0"><Calendar mode="single" locale={dateLocale} selected={new Date(formData.endDate)} onSelect={(d) => handleDateChange('endDate', d)} initialFocus /></PopoverContent>
                                  </Popover>
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
                                  <Input id="monthlyValue" name="monthlyValue" type="number" step="0.01" value={formData.monthlyValue} onChange={handleInputChange} required />
                                </div>
                          </div>
                           <div className="space-y-2">
                                <Label htmlFor="contractType">{t('contracts.dialog.coverageType')}</Label>
                                <Select name="contractType" value={formData.contractType} onValueChange={(v) => handleSelectChange('contractType', v as ContractType)} required>
                                    <SelectTrigger className="w-full md:w-1/3"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Integral">{t('contracts.dialog.coverageTypeIntegral')}</SelectItem>
                                        <SelectItem value="Mão de Obra">{t('contracts.dialog.coverageTypeLabor')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                      </div>

                      <Separator />

                      <div>
                          <h3 className="text-lg font-medium">{t('contracts.dialog.coveredAssets')}</h3>
                          <div className="rounded-lg border p-4 mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                              {assetsLoading ? <p>Carregando...</p> : availableAssets.length > 0 ? availableAssets.map(asset => (
                                  <div key={asset.id} className="flex items-center gap-2">
                                      <Checkbox 
                                          id={`asset-${asset.id}`}
                                          checked={formData.coveredAssetIds.includes(asset.id)}
                                          onCheckedChange={(checked) => handleAssetCoverageChange(asset.id, !!checked)}
                                      />
                                      <Label htmlFor={`asset-${asset.id}`} className="font-normal">{asset.name}</Label>
                                  </div>
                              )) : <p className="text-sm text-muted-foreground col-span-full">{t('contracts.dialog.assetsPlaceholder')}</p>}
                          </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                          <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-medium">{t('contracts.dialog.maintenancePlans')}</h3>
                              <Button type="button" variant="outline" size="sm" onClick={addMaintenancePlan} disabled={formData.coveredAssetIds.length === 0}>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  {t('contracts.dialog.addPlan')}
                              </Button>
                          </div>
                          <div className="space-y-4">
                              {(formData.plans || []).map(plan => (
                                  <div key={plan.id} className="p-4 border rounded-lg space-y-4 relative">
                                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeMaintenancePlan(plan.id)}>
                                          <Trash2 className="h-4 w-4 text-destructive"/>
                                          <span className="sr-only">{t('contracts.dialog.removePlan')}</span>
                                      </Button>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="space-y-2 md:col-span-2">
                                              <Label htmlFor={`plan-desc-${plan.id}`}>{t('contracts.dialog.serviceDescription')}</Label>
                                              <Input id={`plan-desc-${plan.id}`} value={plan.description} onChange={e => handlePlanChange(plan.id, 'description', e.target.value)} required placeholder={t('contracts.dialog.serviceDescriptionPlaceholder')} />
                                          </div>
                                          <div className="space-y-2">
                                              <Label htmlFor={`plan-freq-${plan.id}`}>{t('contracts.dialog.frequency')}</Label>
                                              <Select value={plan.frequency} onValueChange={v => handlePlanChange(plan.id, 'frequency', v as MaintenanceFrequency)}>
                                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                                  <SelectContent>
                                                      {maintenanceFrequencies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor={`plan-asset-${plan.id}`}>{t('contracts.dialog.asset')}</Label>
                                          <Select value={plan.assetId} onValueChange={v => handlePlanChange(plan.id, 'assetId', v)} required>
                                              <SelectTrigger><SelectValue placeholder={t('contracts.dialog.assetPlaceholder')} /></SelectTrigger>
                                              <SelectContent>
                                                  {formData.coveredAssetIds.map(assetId => (
                                                      <SelectItem key={assetId} value={assetId}>{getAssetName(assetId)}</SelectItem>
                                                  ))}
                                              </SelectContent>
                                          </Select>
                                      </div>
                                  </div>
                              ))}
                              {(formData.plans || []).length === 0 && (
                                  <div className="text-center py-8 px-4 border border-dashed rounded-lg">
                                      <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                                      <p className="mt-2 text-sm text-muted-foreground">{t('contracts.dialog.noPlans')}</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </form>
              </ScrollArea>
              <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
                  <Button type="submit" form="contract-form">{t('contracts.dialog.save')}</Button>
              </DialogFooter>
              </>
            )}
          </DialogContent>
      </Dialog>
    </div>
  );
}
