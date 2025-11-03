
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
import { PlusCircle, MoreHorizontal, Trash2, UserPlus, AlertTriangle, FileText, BrainCircuit, MessageSquarePlus, Clock, Receipt } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CustomerLocation, Contact, WorkOrder, ContractStatus, Interaction, InteractionType, Asset, Product, User } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument, updateDocument } from '@/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const CURRENT_USER_ID = 'user-04'; // Mock logged-in user

const contractStatuses: ContractStatus[] = ['Vigente', 'Próximo a Vencer', 'Vencido'];
const interactionTypes: {value: InteractionType, label: string}[] = [
    { value: 'LIGAÇÃO', label: 'Ligação' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'REUNIÃO', label: 'Reunião' },
    { value: 'VISITA', label: 'Visita' },
    { value: 'OUTRO', label: 'Outro' },
];

const emptyContact: Contact = {
  id: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  observation: ''
}

export default function ClientsPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();

  const { data: allLocations, loading: locationsLoading } = useCollection<CustomerLocation>('customerLocations');
  const { data: allAssets, loading: assetsLoading } = useCollection<Asset>('assets');
  const { data: allWorkOrders, loading: workOrdersLoading } = useCollection<WorkOrder>('workOrders');
  const { data: allUsers, loading: usersLoading } = useCollection<User>('users');
  const { data: allProducts, loading: productsLoading } = useCollection<Product>('products');

  const [locations, setLocations] = React.useState<CustomerLocation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<CustomerLocation | null>(null);
  const [formData, setFormData] = React.useState<CustomerLocation | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = React.useState(false);
  const [invoicingLocation, setInvoicingLocation] = React.useState<CustomerLocation | null>(null);

  const emptyLocation: CustomerLocation = React.useMemo(() => ({
    id: '',
    name: '',
    clientId: selectedClient?.id || '',
    contractStatus: 'Vigente',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    contacts: [],
    interactions: [],
  }), [selectedClient]);
  
  React.useEffect(() => {
    if (selectedClient) {
      setLocations(allLocations.filter(l => l.clientId === selectedClient.id));
    } else {
      setLocations([]);
    }
  }, [selectedClient, allLocations]);

  const openDialog = (location: CustomerLocation | null = null) => {
    setEditingLocation(location);
    const locationData = location 
      ? JSON.parse(JSON.stringify(location)) 
      : JSON.parse(JSON.stringify(emptyLocation));

    setFormData(locationData);
    setIsDialogOpen(true);
  };
  
  const openInvoiceDialog = (location: CustomerLocation) => {
    setInvoicingLocation(location);
    setIsInvoiceDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingLocation(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => prev ? ({
        ...prev,
        [parent]: {
          // @ts-ignore
          ...prev[parent],
          [child]: value
        }
      }) : null);
    } else {
      setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    }
  };

  const handleSelectChange = (name: keyof CustomerLocation, value: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleContactChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const newContacts = [...(formData.contacts || [])];
    // @ts-ignore
    newContacts[index][name] = value;
    setFormData(prev => prev ? ({ ...prev, contacts: newContacts }) : null);
  };

  const addContact = () => {
    if (!formData) return;
    const newContact: Contact = { ...emptyContact, id: `contact-${Date.now()}` };
    setFormData(prev => prev ? ({
        ...prev,
        contacts: [...(prev.contacts || []), newContact],
    }) : null);
  };

  const removeContact = (index: number) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
        ...prev,
        contacts: (prev.contacts || []).filter((_, i) => i !== index),
    }) : null);
  }

  const addInteraction = () => {
      if (!formData) return;
      const newInteraction: Interaction = {
          id: `int-${Date.now()}`,
          date: new Date().getTime(),
          type: 'LIGAÇÃO',
          description: '',
          userId: CURRENT_USER_ID,
      };
      setFormData(prev => prev ? ({
          ...prev,
          interactions: [newInteraction, ...(prev.interactions || [])],
      }) : null);
  };

  const removeInteraction = (index: number) => {
      if (!formData) return;
      setFormData(prev => prev ? ({
          ...prev,
          interactions: (prev.interactions || []).filter((_, i) => i !== index),
      }) : null);
  };
  
  const handleInteractionChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!formData) return;
      const { name, value } = e.target;
      const newInteractions = [...(formData.interactions || [])];
      // @ts-ignore
      newInteractions[index][name] = value;
      setFormData(prev => prev ? ({...prev, interactions: newInteractions}) : null);
  };
  
  const handleInteractionTypeChange = (index: number, value: InteractionType) => {
      if (!formData) return;
      const newInteractions = [...(formData.interactions || [])];
      newInteractions[index].type = value;
      setFormData(prev => prev ? ({...prev, interactions: newInteractions}) : null);
  }


  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (!formData) return;
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => prev ? ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          },
        }) : null);
      }
    } catch (error) {
      console.error("Falha ao buscar CEP:", error);
    }
  };
  
  const handleSaveLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !firestore) return;
    
    try {
        const { id, ...locationData } = formData;
        if (editingLocation) {
            await updateDocument(firestore, 'customerLocations', id, locationData);
             toast({
                title: "Cliente Final Atualizado!",
                description: `O cliente "${formData.name}" foi atualizado com sucesso.`,
            });
        } else {
            await addDocument(firestore, 'customerLocations', locationData);
            toast({
                title: "Cliente Final Criado!",
                description: `O cliente "${formData.name}" foi criado com sucesso.`,
            });
        }
        closeDialog();
    } catch (error) {
        console.error("Erro ao salvar cliente final:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar os dados do cliente final. Tente novamente."
        });
    }
  };

  // --- KPI Calculation Functions ---
  const getAssetCount = (locationId: string) => allAssets.filter(a => a.customerLocationId === locationId).length;
  const getOpenWorkOrders = (locationId: string) => allWorkOrders.filter(wo => {
    const asset = allAssets.find(a => a.id === wo.assetId);
    return asset?.customerLocationId === locationId && wo.status === 'ABERTO';
  }).length;
  
  const getCorrectiveRatio = (locationId: string) => {
    const locationWorkOrders = allWorkOrders.filter(wo => {
        const asset = allAssets.find(a => a.id === wo.assetId);
        return asset?.customerLocationId === locationId;
    });
    if (locationWorkOrders.length === 0) return 0;
    const correctiveOrders = locationWorkOrders.filter(wo => ['Alta', 'Urgente'].includes(wo.priority)).length;
    return (correctiveOrders / locationWorkOrders.length) * 100;
  }

  const getPartsCostLast90Days = (locationId: string) => {
    const ninetyDaysAgo = new Date().setDate(new Date().getDate() - 90);
    const locationAssets = allAssets.filter(a => a.customerLocationId === locationId).map(a => a.id);
    const recentWorkOrders = allWorkOrders.filter(wo => 
        locationAssets.includes(wo.assetId) && 
        wo.creationDate >= ninetyDaysAgo &&
        wo.partsUsed && wo.partsUsed.length > 0
    );

    return recentWorkOrders.reduce((totalCost, wo) => {
        const orderCost = (wo.partsUsed || []).reduce((cost, part) => {
            const product = allProducts.find(p => p.id === part.productId);
            return cost + (product ? product.price * part.quantity : 0);
        }, 0);
        return totalCost + orderCost;
    }, 0);
  };
  
  const getStatusBadgeVariant = (status: ContractStatus) => {
      switch (status) {
          case 'Vigente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
          case 'Próximo a Vencer': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'Vencido': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      }
  }

  const getUserName = (id: string) => allUsers.find(u => u.id === id)?.name || 'Usuário';

  const getWorkOrdersForInvoice = (locationId: string | null) => {
    if (!locationId) return [];
    const locationAssets = allAssets.filter(a => a.customerLocationId === locationId).map(a => a.id);
    return allWorkOrders.filter(wo => locationAssets.includes(wo.assetId) && wo.partsUsed && wo.partsUsed.length > 0)
        .sort((a,b) => b.creationDate - a.creationDate)
        .slice(0, 10); // get last 10 for simplicity
  };

  const translatedContractStatus = (status: ContractStatus) => {
    switch (status) {
      case 'Vigente': return t('clients.status.current');
      case 'Próximo a Vencer': return t('clients.status.expiring');
      case 'Vencido': return t('clients.status.expired');
    }
  }
  
  const isLoading = locationsLoading || assetsLoading || workOrdersLoading || usersLoading || productsLoading;

  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('clients.selectClientPrompt')}</p>
        </div>
    )
  }


  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">{t('clients.title', { clientName: selectedClient?.name || '...' })}</h1>
          <Button onClick={() => openDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('clients.new')}
          </Button>
        </div>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('clients.table.finalClient')}</TableHead>
                <TableHead>{t('clients.table.assets')}</TableHead>
                <TableHead>{t('clients.table.openWos')}</TableHead>
                <TableHead>{t('clients.table.contractStatus')}</TableHead>
                <TableHead>{t('clients.table.partsCost')}</TableHead>
                <TableHead>{t('clients.table.criticality')}</TableHead>
                <TableHead>{t('clients.table.addons')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">Carregando clientes...</TableCell>
                </TableRow>
              ) : locations.map(location => {
                const assetCount = getAssetCount(location.id);
                const openWOs = getOpenWorkOrders(location.id);
                const correctiveRatio = getCorrectiveRatio(location.id);
                const partsCost = getPartsCostLast90Days(location.id);

                return (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">
                    <div>{location.name}</div>
                    <div className="text-xs text-muted-foreground">{location.address?.city || 'N/A'} / {location.address?.state || 'N/A'}</div>
                  </TableCell>
                  <TableCell>{assetCount}</TableCell>
                  <TableCell>{openWOs > 0 ? <Badge variant="destructive">{openWOs}</Badge> : 0}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border', getStatusBadgeVariant(location.contractStatus))}>
                      <FileText className="mr-1.5 h-3 w-3" />
                      {translatedContractStatus(location.contractStatus)}
                    </Badge>
                  </TableCell>
                   <TableCell>
                      {partsCost > 0 ? `R$ ${partsCost.toFixed(2)}` : 'R$ 0,00'}
                  </TableCell>
                  <TableCell>
                      {correctiveRatio > 50 && (
                          <Tooltip>
                              <TooltipTrigger>
                                  <Badge variant="destructive">
                                      <AlertTriangle className="mr-1.5 h-3 w-3" />
                                      {t('clients.criticalityMessage')}
                                  </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>{t('clients.criticalityTooltip', { ratio: correctiveRatio.toFixed(0) })}</p>
                              </TooltipContent>
                          </Tooltip>
                      )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        {/* Mocked addon usage */}
                        {location.id === 'loc-01' && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <BrainCircuit className="h-5 w-5 text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t('clients.addonIaTooltip')}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
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
                        <DropdownMenuItem onClick={() => openDialog(location)}>
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openInvoiceDialog(location)}>
                           <Receipt className="mr-2 h-4 w-4" />
                           {t('clients.actions.generateInvoice')}
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
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingLocation ? t('clients.dialog.editTitle') : t('clients.dialog.newTitle')}</DialogTitle>
              <DialogDescription>
                {editingLocation ? t('clients.dialog.editDescription') : t('clients.dialog.newDescription', { clientName: selectedClient?.name || '' })}
              </DialogDescription>
            </DialogHeader>
            {formData && (
              <>
              <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                <form onSubmit={handleSaveLocation} id="location-form" className="space-y-6 py-4 px-1">
                  <h3 className="text-lg font-medium">{t('clients.dialog.registrationData')}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('clients.table.finalClient')}</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder={t('clients.dialog.namePlaceholder')}/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="contractStatus">{t('clients.dialog.contractStatus')}</Label>
                          <Select name="contractStatus" value={formData.contractStatus} onValueChange={(value) => handleSelectChange('contractStatus', value as ContractStatus)} required>
                              <SelectTrigger>
                                  <SelectValue placeholder={t('clients.dialog.contractStatusPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                  {contractStatuses.map(status => (
                                      <SelectItem key={status} value={status}>{translatedContractStatus(status)}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="zipCode">{t('address.zipCode')}</Label>
                            <Input id="zipCode" name="address.zipCode" value={formData.address?.zipCode || ''} onChange={handleInputChange} onBlur={handleCepBlur} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="street">{t('address.street')}</Label>
                            <Input id="street" name="address.street" value={formData.address?.street || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="number">{t('address.number')}</Label>
                              <Input id="number" name="address.number" value={formData.address?.number || ''} onChange={handleInputChange} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="complement">{t('address.complement')}</Label>
                              <Input id="complement" name="address.complement" value={formData.address?.complement || ''} onChange={handleInputChange} />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="neighborhood">{t('address.neighborhood')}</Label>
                            <Input id="neighborhood" name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">{t('address.city')}</Label>
                            <Input id="city" name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="state">{t('address.state')}</Label>
                          <Input id="state" name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} />
                      </div>
                  </div>
                  
                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">{t('clients.dialog.contactsSection')}</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addContact}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t('clients.dialog.addContact')}
                        </Button>
                    </div>
                    <div className="space-y-4">
                      {(formData.contacts || []).map((contact, index) => (
                        <div key={contact.id} className="p-4 border rounded-lg space-y-4 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeContact(index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                                <span className="sr-only">{t('clients.dialog.removeContact')}</span>
                            </Button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`contact-name-${index}`}>{t('clients.dialog.fullName')}</Label>
                                <Input id={`contact-name-${index}`} name="name" value={contact.name} onChange={e => handleContactChange(index, e)} required/>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`contact-role-${index}`}>{t('clients.dialog.role')}</Label>
                                <Input id={`contact-role-${index}`} name="role" value={contact.role} onChange={e => handleContactChange(index, e)} required placeholder={t('clients.dialog.rolePlaceholder')}/>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`contact-phone-${index}`}>{t('common.phone')}</Label>
                                  <Input id={`contact-phone-${index}`} name="phone" value={contact.phone || ''} onChange={e => handleContactChange(index, e)} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`contact-email-${index}`}>{t('common.email')}</Label>
                                  <Input id={`contact-email-${index}`} name="email" type="email" value={contact.email || ''} onChange={e => handleContactChange(index, e)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`contact-observation-${index}`}>{t('clients.dialog.internalObservation')}</Label>
                                <Textarea id={`contact-observation-${index}`} name="observation" value={contact.observation || ''} onChange={e => handleContactChange(index, e)} />
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />
                  
                  <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">{t('clients.dialog.interactionsSection')}</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addInteraction}>
                            <MessageSquarePlus className="mr-2 h-4 w-4" />
                            {t('clients.dialog.addInteraction')}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {(formData.interactions || []).map((interaction, index) => (
                            <div key={interaction.id} className="p-4 border rounded-lg space-y-3 relative">
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeInteraction(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                    <span className="sr-only">{t('clients.dialog.removeInteraction')}</span>
                                </Button>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3"/>
                                      <span>{t('clients.dialog.interactionDate', { date: format(new Date(interaction.date), "dd/MM/yyyy HH:mm", { locale: ptBR }), user: getUserName(interaction.userId) })}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor={`interaction-type-${index}`}>{t('clients.dialog.interactionType')}</Label>
                                    <Select value={interaction.type} onValueChange={(value) => handleInteractionTypeChange(index, value as InteractionType)}>
                                        <SelectTrigger id={`interaction-type-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {interactionTypes.map(type => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2 sm:col-span-4">
                                    <Label htmlFor={`interaction-desc-${index}`}>{t('clients.dialog.interactionDescription')}</Label>
                                    <Textarea 
                                        id={`interaction-desc-${index}`} 
                                        name="description" 
                                        value={interaction.description}
                                        onChange={(e) => handleInteractionChange(index, e)}
                                        placeholder={t('clients.dialog.interactionDescriptionPlaceholder')}
                                    />
                                  </div>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>

                </form>
              </ScrollArea>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
                <Button type="submit" form="location-form">{t('common.save')}</Button>
              </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('clients.invoiceDialog.title', { clientName: invoicingLocation?.name })}</DialogTitle>
                    <DialogDescription>
                        {t('clients.invoiceDialog.description')}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    <div className="py-4 px-1 space-y-4">
                        {getWorkOrdersForInvoice(invoicingLocation?.id || null).map(wo => {
                            const totalCost = (wo.partsUsed || []).reduce((acc, part) => {
                                const product = allProducts.find(p => p.id === part.productId);
                                return acc + (product ? product.price * part.quantity : 0);
                            }, 0);

                            return (
                                <div key={wo.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold">{t('clients.invoiceDialog.woTitle', { title: wo.title, id: wo.id })}</h4>
                                        <span className="font-bold">R$ {totalCost.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t('clients.invoiceDialog.date')}: {format(new Date(wo.creationDate), "dd/MM/yyyy")}</p>
                                    <Separator className="my-2" />
                                    <ul className="text-sm space-y-1">
                                        {(wo.partsUsed || []).map(part => {
                                            const product = allProducts.find(p => p.id === part.productId);
                                            return (
                                                <li key={part.productId} className="flex justify-between">
                                                    <span>{product?.name || t('clients.invoiceDialog.unknownPart')} (x{part.quantity})</span>
                                                    <span>R$ {( (product?.price || 0) * part.quantity).toFixed(2)}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )
                        })}
                         {getWorkOrdersForInvoice(invoicingLocation?.id || null).length === 0 && (
                            <p className="text-muted-foreground text-center py-8">{t('clients.invoiceDialog.noPartsToBill')}</p>
                         )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <div className="w-full flex justify-between items-center">
                        <span className="font-bold text-lg">
                            {t('clients.invoiceDialog.totalToBill')}: R$ {
                                getWorkOrdersForInvoice(invoicingLocation?.id || null).reduce((total, wo) => {
                                    return total + (wo.partsUsed || []).reduce((acc, part) => {
                                        const product = allProducts.find(p => p.id === part.productId);
                                        return acc + (product ? product.price * part.quantity : 0);
                                    }, 0);
                                }, 0).toFixed(2)
                            }
                        </span>
                        <div>
                            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>{t('clients.invoiceDialog.close')}</Button>
                            <Button className="ml-2">{t('clients.invoiceDialog.sendInvoice')}</Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

    