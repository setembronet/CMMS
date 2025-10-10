
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
import { PlusCircle, MoreHorizontal, Calendar as CalendarIcon, Trash2, FileText } from 'lucide-react';
import { contracts as initialContracts, setContracts, customerLocations as allLocations, assets as allAssets, maintenanceFrequencies } from '@/lib/data';
import type { Contract, MaintenancePlan, ContractType, MaintenanceFrequency, CustomerLocation, Asset } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TEST_CLIENT_ID = 'client-01';

const emptyContract: Contract = {
  id: '',
  title: '',
  customerLocationId: '',
  startDate: new Date().getTime(),
  endDate: new Date().getTime(),
  contractType: 'Mão de Obra',
  coveredAssetIds: [],
  plans: [],
};

const emptyPlan: Omit<MaintenancePlan, 'id' | 'lastGenerated'> = {
  assetId: '',
  frequency: 'MENSAL',
  description: '',
};

export default function ContractsPage() {
  const [contracts, setLocalContracts] = React.useState<Contract[]>(initialContracts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingContract, setEditingContract] = React.useState<Contract | null>(null);
  const [formData, setFormData] = React.useState<Contract>(emptyContract);
  
  const [availableLocations, setAvailableLocations] = React.useState<CustomerLocation[]>([]);
  const [availableAssets, setAvailableAssets] = React.useState<Asset[]>([]);

  React.useEffect(() => {
    // Filter locations by the current test client
    setAvailableLocations(allLocations.filter(l => l.clientId === TEST_CLIENT_ID));
  }, []);
  
  React.useEffect(() => {
    if (formData.customerLocationId) {
        setAvailableAssets(allAssets.filter(a => a.customerLocationId === formData.customerLocationId));
    } else {
        setAvailableAssets([]);
    }
  }, [formData.customerLocationId]);

  const getLocationName = (id: string) => allLocations.find(l => l.id === id)?.name || 'N/A';
  const getAssetName = (id: string) => allAssets.find(a => a.id === id)?.name || 'N/A';

  const openDialog = (contract: Contract | null = null) => {
    setEditingContract(contract);
    const contractData = contract ? JSON.parse(JSON.stringify(contract)) : JSON.parse(JSON.stringify(emptyContract));
    setFormData(contractData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingContract(null);
    setIsDialogOpen(false);
    setFormData(emptyContract);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Contract, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (name: keyof Contract, date: Date | undefined) => {
    if (date) {
        setFormData(prev => ({...prev, [name]: date.getTime()}));
    }
  }

  const handleAssetCoverageChange = (assetId: string, checked: boolean) => {
    setFormData(prev => {
        const currentAssets = prev.coveredAssetIds || [];
        if (checked) {
            return {...prev, coveredAssetIds: [...currentAssets, assetId]};
        } else {
            return {...prev, coveredAssetIds: currentAssets.filter(id => id !== assetId)};
        }
    })
  };
  
  const addMaintenancePlan = () => {
    const newPlan = { ...emptyPlan, id: `plan-${Date.now()}`, lastGenerated: new Date().getTime() };
    setFormData(prev => ({
      ...prev,
      plans: [...(prev.plans || []), newPlan]
    }));
  };

  const removeMaintenancePlan = (planId: string) => {
    setFormData(prev => ({
      ...prev,
      plans: (prev.plans || []).filter(p => p.id !== planId)
    }));
  };
  
  const handlePlanChange = (planId: string, field: keyof MaintenancePlan, value: string) => {
     setFormData(prev => ({
      ...prev,
      plans: (prev.plans || []).map(p => p.id === planId ? { ...p, [field]: value } : p)
    }));
  };


  const handleSaveContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newContract: Contract = {
      ...formData,
      id: editingContract?.id || `contract-${Date.now()}`,
    };

    let updatedContracts;
    if (editingContract) {
      updatedContracts = initialContracts.map(c => (c.id === newContract.id ? newContract : c));
    } else {
      updatedContracts = [newContract, ...initialContracts];
    }
    
    setContracts(updatedContracts);
    setLocalContracts(updatedContracts);
    closeDialog();
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


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gestão de Contratos</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Contrato
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título do Contrato</TableHead>
              <TableHead>Cliente Final</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead>Ativos Cobertos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map(contract => {
                const status = getStatus(contract);
                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>{getLocationName(contract.customerLocationId)}</TableCell>
                    <TableCell>
                      {format(new Date(contract.startDate), 'dd/MM/yy')} - {format(new Date(contract.endDate), 'dd/MM/yy')}
                    </TableCell>
                    <TableCell>{contract.coveredAssetIds.length}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn('border', getStatusBadgeVariant(status))}>
                            {status}
                        </Badge>
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
                          <DropdownMenuItem onClick={() => openDialog(contract)}>
                            Editar
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
              <DialogTitle>{editingContract ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
              <DialogDescription>
                Gerencie os detalhes do contrato, ativos cobertos e planos de manutenção preventiva.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                <form id="contract-form" onSubmit={handleSaveContract} className="space-y-6 py-4 px-1">
                    <h3 className="text-lg font-medium">Dados Gerais do Contrato</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerLocationId">Cliente Final</Label>
                                <Select name="customerLocationId" value={formData.customerLocationId} onValueChange={(value) => handleSelectChange('customerLocationId', value)} required>
                                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                                    <SelectContent>
                                        {availableLocations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Título do Contrato</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Ex: Contrato de Manutenção 2024"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                 <Label htmlFor="startDate">Data de Início</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.startDate ? format(new Date(formData.startDate), "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(formData.startDate)} onSelect={(d) => handleDateChange('startDate', d)} initialFocus /></PopoverContent>
                                </Popover>
                             </div>
                             <div className="space-y-2">
                                 <Label htmlFor="endDate">Data de Fim</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.endDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.endDate ? format(new Date(formData.endDate), "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(formData.endDate)} onSelect={(d) => handleDateChange('endDate', d)} initialFocus /></PopoverContent>
                                </Popover>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="contractType">Tipo de Cobertura</Label>
                                <Select name="contractType" value={formData.contractType} onValueChange={(v) => handleSelectChange('contractType', v as ContractType)} required>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Integral">Integral (Peças inclusas)</SelectItem>
                                        <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium">Ativos Cobertos pelo Contrato</h3>
                        <div className="rounded-lg border p-4 mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableAssets.length > 0 ? availableAssets.map(asset => (
                                <div key={asset.id} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={`asset-${asset.id}`}
                                        checked={formData.coveredAssetIds.includes(asset.id)}
                                        onCheckedChange={(checked) => handleAssetCoverageChange(asset.id, !!checked)}
                                    />
                                    <Label htmlFor={`asset-${asset.id}`} className="font-normal">{asset.name}</Label>
                                </div>
                            )) : <p className="text-sm text-muted-foreground col-span-full">Selecione um cliente final para ver os ativos.</p>}
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Planos de Manutenção Preventiva</h3>
                             <Button type="button" variant="outline" size="sm" onClick={addMaintenancePlan} disabled={formData.coveredAssetIds.length === 0}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar Plano
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {(formData.plans || []).map(plan => (
                                <div key={plan.id} className="p-4 border rounded-lg space-y-4 relative">
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeMaintenancePlan(plan.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                        <span className="sr-only">Remover Plano</span>
                                    </Button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor={`plan-desc-${plan.id}`}>Descrição do Serviço</Label>
                                            <Input id={`plan-desc-${plan.id}`} value={plan.description} onChange={e => handlePlanChange(plan.id, 'description', e.target.value)} required placeholder="Ex: Inspeção e lubrificação geral" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor={`plan-freq-${plan.id}`}>Frequência</Label>
                                            <Select value={plan.frequency} onValueChange={v => handlePlanChange(plan.id, 'frequency', v as MaintenanceFrequency)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {maintenanceFrequencies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`plan-asset-${plan.id}`}>Ativo</Label>
                                        <Select value={plan.assetId} onValueChange={v => handlePlanChange(plan.id, 'assetId', v)} required>
                                            <SelectTrigger><SelectValue placeholder="Selecione o ativo para este plano" /></SelectTrigger>
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
                                    <p className="mt-2 text-sm text-muted-foreground">Nenhum plano de manutenção preventiva adicionado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </ScrollArea>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button type="submit" form="contract-form">Salvar Contrato</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
