
'use client';

import * as React from 'react';
import Link from 'next/link';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, MoreHorizontal, History } from 'lucide-react';
import { assets as initialAssets, companies, segments as allSegments, customerLocations as allLocations, workOrders, plans } from '@/lib/data';
import type { Asset, CompanySegment, CustomerLocation, WorkOrder, CustomField } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClient } from '@/context/client-provider';


type AssetStatus = 'Operacional' | 'Em Manutenção';

export default function AssetsPage() {
  const { selectedClient } = useClient();
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);
  const [formData, setFormData] = React.useState<Asset | null>(null);
  const [availableSegments, setAvailableSegments] = React.useState<CompanySegment[]>([]);
  const [availableLocations, setAvailableLocations] = React.useState<CustomerLocation[]>([]);
  const [customFields, setCustomFields] = React.useState<CustomField[]>([]);
  
  const clientPlan = React.useMemo(() => plans.find(p => p.id === selectedClient?.planId), [selectedClient]);
  const assetLimit = clientPlan?.assetLimit ?? 0;
  const hasReachedAssetLimit = assetLimit !== -1 && assets.length >= assetLimit;

  const emptyAsset: Asset = React.useMemo(() => ({
    id: '',
    name: '',
    clientId: selectedClient?.id || '',
    customerLocationId: '',
    activeSegment: '',
    serialNumber: '',
    brand: '',
    model: '',
    observation: '',
    location: { lat: 0, lng: 0 },
    customData: {},
  }), [selectedClient]);


  React.useEffect(() => {
    if (selectedClient) {
      setAssets(initialAssets.filter(a => a.clientId === selectedClient.id));
      
      const companySegments = allSegments.filter(s => selectedClient.activeSegments.includes(s.id));
      setAvailableSegments(companySegments);
      
      const clientLocations = allLocations.filter(l => l.clientId === selectedClient.id);
      setAvailableLocations(clientLocations);
    } else {
      setAssets([]);
      setAvailableSegments([]);
      setAvailableLocations([]);
    }
  }, [selectedClient]);
  
  React.useEffect(() => {
    if (formData && formData.activeSegment) {
        const segment = allSegments.find(s => s.id === formData.activeSegment);
        setCustomFields(segment?.customFields || []);
    } else {
        setCustomFields([]);
    }
  }, [formData]);

  React.useEffect(() => {
     if (formData && availableSegments.length === 1 && formData.activeSegment !== availableSegments[0].id) {
          handleSelectChange('activeSegment', availableSegments[0].id);
      }
  }, [formData, availableSegments])


  const getLocationName = (id: string) => allLocations.find(l => l.id === id)?.name || 'N/A';
  const getSegmentName = (id: string) => allSegments.find(s => s.id === id)?.name || 'N/A';

  const getAssetStatus = (assetId: string): AssetStatus => {
    const hasOpenWorkOrder = workOrders.some(
        wo => wo.assetId === assetId && (wo.status === 'ABERTO' || wo.status === 'EM ANDAMENTO')
    );
    return hasOpenWorkOrder ? 'Em Manutenção' : 'Operacional';
  };
  
  const getWorkOrderCount = (assetId: string) => {
      return workOrders.filter(wo => wo.assetId === assetId).length;
  }
  
  const getStatusBadgeVariant = (status: AssetStatus) => {
    switch (status) {
      case 'Operacional':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Em Manutenção':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'secondary';
    }
  };


  const openDialog = (asset: Asset | null = null) => {
    setEditingAsset(asset);
    const assetData = asset ? JSON.parse(JSON.stringify(asset)) : JSON.parse(JSON.stringify(emptyAsset));
    
    assetData.customData = assetData.customData || {};

    if (!asset && availableSegments.length === 1) {
        assetData.activeSegment = availableSegments[0].id;
    }
    
    setFormData(assetData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAsset(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };
  
  const handleCustomFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    if (type === 'number') {
        processedValue = value === '' ? '' : Number(value);
    }
    
    setFormData(prev => prev ? ({ 
        ...prev, 
        customData: {
            ...prev.customData,
            [name]: processedValue,
        }
    }) : null);
  };

  const handleSelectChange = (name: keyof Asset, value: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSaveAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    
    const newAsset: Asset = {
      ...formData,
      clientId: selectedClient?.id || '',
      id: editingAsset?.id || `asset-0${assets.length + 1}`,
    };

    if (editingAsset) {
      setAssets(assets.map(a => a.id === newAsset.id ? newAsset : a));
    } else {
      if(hasReachedAssetLimit) {
        console.error("Asset limit reached");
        return;
      }
      setAssets([newAsset, ...assets]);
    }
    closeDialog();
  };
  
  const NewAssetButton = () => (
     <Button onClick={() => openDialog()} disabled={hasReachedAssetLimit || !selectedClient}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Novo Ativo
      </Button>
  );

  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Selecione um cliente no menu superior para gerenciar os ativos.</p>
        </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Gestão de Ativos</h1>
           {hasReachedAssetLimit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <NewAssetButton />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limite de {assetLimit} ativos do plano {clientPlan?.name} atingido.</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <NewAssetButton />
          )}
        </div>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Ativo</TableHead>
                <TableHead>Cliente Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Nº de Série</TableHead>
                <TableHead>Histórico de OS</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map(asset => {
                const status = getAssetStatus(asset.id);
                const osCount = getWorkOrderCount(asset.id);
                return (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{getLocationName(asset.customerLocationId)}</TableCell>
                  <TableCell>
                      <Badge variant="outline" className={cn('border', getStatusBadgeVariant(status))}>
                          {status}
                      </Badge>
                  </TableCell>
                  <TableCell>{asset.serialNumber}</TableCell>
                  <TableCell>{osCount > 0 ? `${osCount} OS` : 'Nenhuma'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(asset)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/orders"> 
                              <History className="mr-2 h-4 w-4" />
                              Ver Histórico de OS
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAsset ? 'Editar Ativo' : 'Novo Ativo'}</DialogTitle>
              <DialogDescription>
                {editingAsset ? 'Atualize os detalhes do ativo.' : `Preencha os detalhes do novo ativo para ${selectedClient?.name || ''}.`}
              </DialogDescription>
            </DialogHeader>
            {formData && (
              <>
              <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                <form onSubmit={handleSaveAsset} id="asset-form" className="space-y-4 py-4 px-1">
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerLocationId">Cliente Final</Label>
                    <Select name="customerLocationId" value={formData.customerLocationId} onValueChange={(value) => handleSelectChange('customerLocationId', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente final" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {availableSegments.length > 0 && (
                    <>
                      {availableSegments.length > 1 ? (
                        <div className="space-y-2">
                          <Label htmlFor="activeSegment">Segmento do Ativo</Label>
                          <Select name="activeSegment" value={formData.activeSegment} onValueChange={(value) => handleSelectChange('activeSegment', value)} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o segmento" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSegments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                            <Label>Segmento do Ativo</Label>
                            <Input value={availableSegments[0]?.name || 'O cliente não possui segmentos ativos'} disabled />
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Ativo</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: Elevador Social Bloco B"/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input id="brand" name="brand" value={formData.brand || ''} onChange={handleInputChange} placeholder="Ex: Atlas Schindler"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input id="model" name="model" value={formData.model || ''} onChange={handleInputChange} placeholder="Ex: 5500 MRL"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Número de Série</Label>
                    <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required />
                  </div>

                  {customFields.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Dados Específicos do Segmento</h3>
                        {customFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.name}>{field.label}</Label>
                            <Input 
                              id={field.name}
                              name={field.name}
                              type={field.type === 'date' ? 'date' : field.type}
                              value={formData.customData?.[field.name] || ''}
                              onChange={handleCustomFieldChange}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="observation">Observação</Label>
                    <Textarea id="observation" name="observation" value={formData.observation || ''} onChange={handleInputChange} placeholder="Detalhes adicionais, histórico, etc."/>
                  </div>
                </form>
              </ScrollArea>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button type="submit" form="asset-form" disabled={!formData.activeSegment || !formData.customerLocationId}>Salvar Ativo</Button>
              </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

    