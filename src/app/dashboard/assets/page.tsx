
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MoreHorizontal, History, Trash2, Camera, QrCode, HardHat, Package, Check, AlertTriangle, FilePlus } from 'lucide-react';
import { assets as initialAssets, companies, segments as allSegments, customerLocations as allLocations, workOrders, plans, products, users } from '@/lib/data';
import type { Asset, CompanySegment, CustomerLocation, WorkOrder, CustomField } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineTime, TimelineContent, TimelineDescription } from '@/components/ui/timeline';

type AssetStatus = 'Operacional' | 'Em Manutenção';

export default function AssetsPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();

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
    gallery: [],
    location: { lat: 0, lng: 0 },
    customData: {},
    creationDate: new Date().getTime(),
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
    assetData.gallery = assetData.gallery || [];

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

  const handleGalleryChange = (index: number, value: string) => {
    if (!formData) return;
    const newGallery = [...(formData.gallery || [])];
    newGallery[index] = value;
    setFormData(prev => prev ? { ...prev, gallery: newGallery } : null);
  };

  const addGalleryItem = () => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, gallery: [...(prev.gallery || []), ''] } : null);
  };

  const removeGalleryItem = (index: number) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, gallery: (prev.gallery || []).filter((_, i) => i !== index) } : null);
  };

  const handleSaveAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    
    const newAsset: Asset = {
      ...formData,
      clientId: selectedClient?.id || '',
      id: editingAsset?.id || `asset-0${assets.length + 1}`,
      gallery: (formData.gallery || []).filter(url => url.trim() !== ''),
      creationDate: editingAsset?.creationDate || new Date().getTime(),
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

  const getAssetTimeline = (asset: Asset | null) => {
    if (!asset) return [];
    
    const assetWorkOrders = workOrders.filter(wo => wo.assetId === asset.id);
    const events = [];

    // Asset Creation
    events.push({
      id: `evt-creation-${asset.id}`,
      date: asset.creationDate,
      icon: Package,
      color: "text-blue-500",
      title: "Ativo Criado",
      description: `O ativo '${asset.name}' foi cadastrado no sistema.`
    });

    // Work Orders
    assetWorkOrders.forEach(wo => {
      events.push({
        id: `evt-wo-open-${wo.id}`,
        date: wo.creationDate,
        icon: FilePlus,
        color: "text-gray-500",
        title: `OS Aberta: ${wo.title}`,
        description: `Criada por ${users.find(u=>u.id === wo.createdByUserId)?.name || 'Sistema'}`
      });

      if (wo.partsUsed && wo.partsUsed.length > 0) {
        events.push({
          id: `evt-wo-parts-${wo.id}`,
          date: wo.endDate ? wo.endDate - 1000 : new Date().getTime(), // just before closing
          icon: HardHat,
          color: "text-orange-500",
          title: 'Troca de Peças',
          description: `Peças: ${wo.partsUsed.map(p => `${p.quantity}x ${products.find(prod => prod.id === p.productId)?.name || '?'}`).join(', ')}`
        });
      }
      
      if(wo.checklist) {
          wo.checklist.forEach(group => {
              group.items.forEach(item => {
                  if (item.status === 'NÃO OK') {
                      events.push({
                          id: `evt-chk-nok-${wo.id}-${item.id}`,
                          date: wo.endDate ? wo.endDate - 2000 : new Date().getTime(),
                          icon: AlertTriangle,
                          color: 'text-destructive',
                          title: 'Falha no Checklist',
                          description: `Item: "${item.text}". Comentário: ${item.comment}`
                      });
                  }
              });
          });
      }

      if (wo.status === 'CONCLUIDO' && wo.endDate) {
        events.push({
          id: `evt-wo-close-${wo.id}`,
          date: wo.endDate,
          icon: Check,
          color: "text-green-500",
          title: `OS Concluída: ${wo.title}`,
          description: `Finalizada por ${users.find(u=>u.id === wo.responsibleId)?.name || 'Não atribuído'}`
        });
      }
    });

    return events.sort((a,b) => b.date - a.date);
  }
  
  const NewAssetButton = () => (
     <Button onClick={() => openDialog()} disabled={hasReachedAssetLimit || !selectedClient}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('assets.new')}
      </Button>
  );

  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('assets.selectClientPrompt')}</p>
        </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">{t('assets.title')}</h1>
           {hasReachedAssetLimit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <NewAssetButton />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('assets.limitReached', { limit: assetLimit, planName: clientPlan?.name })}</p>
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
                <TableHead>{t('assets.table.name')}</TableHead>
                <TableHead>{t('assets.table.finalClient')}</TableHead>
                <TableHead>{t('assets.table.status')}</TableHead>
                <TableHead>{t('assets.table.serialNumber')}</TableHead>
                <TableHead>{t('assets.table.woHistory')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                          {t(`assets.status.${status === 'Operacional' ? 'operational' : 'maintenance'}`)}
                      </Badge>
                  </TableCell>
                  <TableCell>{asset.serialNumber}</TableCell>
                  <TableCell>{osCount > 0 ? t('assets.history.count', { count: osCount }) : t('assets.history.none')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('common.openMenu')}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(asset)}>
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/orders"> 
                              <History className="mr-2 h-4 w-4" />
                              {t('assets.actions.viewHistory')}
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
          <DialogContent className="sm:max-w-4xl h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingAsset ? `Dossiê do Ativo: ${editingAsset.name}` : t('assets.dialog.newTitle')}</DialogTitle>
              <DialogDescription>
                {editingAsset ? `Informações completas e histórico do ativo.` : t('assets.dialog.newDescription', { clientName: selectedClient?.name || ''})}
              </DialogDescription>
            </DialogHeader>
            {formData && (
              <Tabs defaultValue="data" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="data">Dados Cadastrais</TabsTrigger>
                  <TabsTrigger value="history">Histórico de OS</TabsTrigger>
                  <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-hidden">
                    <TabsContent value="data" className="h-full">
                      <ScrollArea className="h-full -mx-6 px-6">
                        <form onSubmit={handleSaveAsset} id="asset-form" className="space-y-4 py-4 px-1">
                          
                          <div className="space-y-2">
                            <Label htmlFor="customerLocationId">{t('assets.dialog.finalClient')}</Label>
                            <Select name="customerLocationId" value={formData.customerLocationId} onValueChange={(value) => handleSelectChange('customerLocationId', value)} required>
                              <SelectTrigger>
                                <SelectValue placeholder={t('assets.dialog.finalClientPlaceholder')} />
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
                                  <Label htmlFor="activeSegment">{t('assets.dialog.segment')}</Label>
                                  <Select name="activeSegment" value={formData.activeSegment} onValueChange={(value) => handleSelectChange('activeSegment', value)} required>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('assets.dialog.segmentPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableSegments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                    <Label>{t('assets.dialog.segment')}</Label>
                                    <Input value={availableSegments[0]?.name || t('assets.dialog.noSegment')} disabled />
                                </div>
                              )}
                            </>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="name">{t('assets.dialog.assetName')}</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder={t('assets.dialog.assetNamePlaceholder')}/>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">{t('assets.dialog.brand')}</Label>
                                <Input id="brand" name="brand" value={formData.brand || ''} onChange={handleInputChange} placeholder={t('assets.dialog.brandPlaceholder')}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">{t('assets.dialog.model')}</Label>
                                <Input id="model" name="model" value={formData.model || ''} onChange={handleInputChange} placeholder={t('assets.dialog.modelPlaceholder')}/>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="serialNumber">{t('assets.dialog.serialNumber')}</Label>
                            <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required />
                          </div>

                          {customFields.length > 0 && (
                            <>
                              <Separator />
                              <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground">{t('assets.dialog.segmentSpecificData')}</h3>
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
                            <Label htmlFor="observation">{t('common.observation')}</Label>
                            <Textarea id="observation" name="observation" value={formData.observation || ''} onChange={handleInputChange} placeholder={t('assets.dialog.observationPlaceholder')}/>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                  <h3 className="text-base font-medium flex items-center gap-2"><Camera /> Galeria de Fotos</h3>
                                  <Button type="button" size="sm" variant="outline" onClick={addGalleryItem}>
                                      <PlusCircle className="mr-2 h-4 w-4" />
                                      Adicionar Foto
                                  </Button>
                              </div>
                              <div className="space-y-2">
                                  {(formData.gallery || []).map((url, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                          <Input 
                                              type="url"
                                              value={url}
                                              onChange={(e) => handleGalleryChange(index, e.target.value)}
                                              placeholder="https://exemplo.com/imagem.png"
                                          />
                                          <Button type="button" variant="ghost" size="icon" onClick={() => removeGalleryItem(index)}>
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                      </div>
                                  ))}
                                  {(formData.gallery || []).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">Nenhuma foto adicionada.</p>
                                  )}
                              </div>
                          </div>

                          {editingAsset && (
                            <>
                              <Separator />
                              <div className="space-y-4">
                                <h3 className="text-base font-medium flex items-center gap-2"><QrCode /> QR Code do Ativo</h3>
                                <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
                                  <Image 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(editingAsset.id)}`}
                                    alt={`QR Code para ${editingAsset.name}`}
                                    width={150}
                                    height={150}
                                  />
                                  <p className="mt-2 text-xs text-muted-foreground">Aponte a câmera para identificar o ativo.</p>
                                </div>
                              </div>
                            </>
                          )}
                        </form>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="history" className="h-full">
                       <ScrollArea className="h-full -mx-6 px-6 py-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Data de Criação</TableHead>
                                        <TableHead>Responsável</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workOrders.filter(wo => wo.assetId === editingAsset?.id).map(wo => (
                                        <TableRow key={wo.id}>
                                            <TableCell>{wo.title}</TableCell>
                                            <TableCell><Badge variant="outline">{wo.status}</Badge></TableCell>
                                            <TableCell>{format(new Date(wo.creationDate), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>{users.find(u => u.id === wo.responsibleId)?.name || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                       </ScrollArea>
                    </TabsContent>
                    <TabsContent value="timeline" className="h-full">
                        <ScrollArea className="h-full -mx-6 px-6 py-4">
                             <Timeline>
                                {getAssetTimeline(editingAsset).map((event) => (
                                    <TimelineItem key={event.id}>
                                        <TimelineConnector />
                                        <TimelineHeader>
                                            <TimelineTime>{format(new Date(event.date), 'dd/MM/yy')}</TimelineTime>
                                            <TimelineIcon>
                                                <event.icon className={cn("h-4 w-4", event.color)} />
                                            </TimelineIcon>
                                            <TimelineTitle>{event.title}</TimelineTitle>
                                        </TimelineHeader>
                                        <TimelineContent>
                                            <TimelineDescription>{event.description}</TimelineDescription>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        </ScrollArea>
                    </TabsContent>
                </div>
              </Tabs>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
              <Button type="submit" form="asset-form" disabled={!formData?.activeSegment || !formData?.customerLocationId}>{t('assets.dialog.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

    