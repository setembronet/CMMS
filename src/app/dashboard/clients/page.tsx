
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
import { PlusCircle, MoreHorizontal, Trash2, UserPlus, AlertTriangle, FileText, BrainCircuit, MessageSquarePlus, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { companies, customerLocations as initialLocations, setCustomerLocations, cmmsRoles as allRoles, assets, workOrders, segments, users } from '@/lib/data';
import type { CustomerLocation, Contact, CMMSRole, WorkOrder, ContractStatus, Interaction, InteractionType } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Development Fix: Use a single client for easier debugging ---
const TEST_CLIENT_ID = 'client-01';
const CURRENT_USER_ID = 'user-04'; // Mock logged-in user
const testClient = companies.find(c => c.id === TEST_CLIENT_ID);

const contractStatuses: ContractStatus[] = ['Vigente', 'Próximo a Vencer', 'Vencido'];
const interactionTypes: {value: InteractionType, label: string}[] = [
    { value: 'LIGAÇÃO', label: 'Ligação' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'REUNIÃO', label: 'Reunião' },
    { value: 'VISITA', label: 'Visita' },
    { value: 'OUTRO', label: 'Outro' },
];

const emptyLocation: CustomerLocation = {
  id: '',
  name: '',
  clientId: TEST_CLIENT_ID,
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
};

const emptyContact: Contact = {
  id: '',
  name: '',
  cmmsRoleId: '',
  email: '',
  phone: '',
  observation: ''
}
// ----------------------------------------------------------------

export default function ClientsPage() {
  const [locations, setLocations] = React.useState<CustomerLocation[]>(initialLocations.filter(l => l.clientId === TEST_CLIENT_ID));
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<CustomerLocation | null>(null);
  const [formData, setFormData] = React.useState<CustomerLocation>(emptyLocation);
  const [availableRoles, setAvailableRoles] = React.useState<CMMSRole[]>([]);
  
  React.useEffect(() => {
    // This will keep the local state in sync if the global data changes.
    const currentLocations = initialLocations.filter(l => l.clientId === TEST_CLIENT_ID)
    setLocations(currentLocations);

    // Determine available roles for the contacts based on the main client's segments
    if (testClient) {
      const company = testClient;
      if (company.activeSegments.length > 0) {
        const applicableRoleIds = new Set<string>();
        company.activeSegments.forEach(segmentId => {
          const segment = segments.find(s => s.id === segmentId);
          (segment?.applicableRoles || []).forEach(roleId => applicableRoleIds.add(roleId));
        });
        const filteredRoles = allRoles.filter(role => applicableRoleIds.has(role.id));
        setAvailableRoles(filteredRoles);
      } else {
        setAvailableRoles([]);
      }
    }
  }, []);

  const openDialog = (location: CustomerLocation | null = null) => {
    setEditingLocation(location);
    // Deep copy to avoid modifying the original object
    const locationData = location 
      ? JSON.parse(JSON.stringify(location)) 
      : JSON.parse(JSON.stringify(emptyLocation));

    setFormData(locationData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingLocation(null);
    setIsDialogOpen(false);
    setFormData(emptyLocation);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          // @ts-ignore
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: keyof CustomerLocation, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newContacts = [...(formData.contacts || [])];
    // @ts-ignore
    newContacts[index][name] = value;
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  const handleContactSelectChange = (index: number, value: string) => {
    const newContacts = [...(formData.contacts || [])];
    newContacts[index].cmmsRoleId = value;
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  const addContact = () => {
    const newContact: Contact = { ...emptyContact, id: `contact-${Date.now()}` };
    setFormData(prev => ({
        ...prev,
        contacts: [...(prev.contacts || []), newContact],
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
        ...prev,
        contacts: (prev.contacts || []).filter((_, i) => i !== index),
    }));
  }

  const addInteraction = () => {
      const newInteraction: Interaction = {
          id: `int-${Date.now()}`,
          date: new Date().getTime(),
          type: 'LIGAÇÃO',
          description: '',
          userId: CURRENT_USER_ID,
      };
      setFormData(prev => ({
          ...prev,
          interactions: [newInteraction, ...(prev.interactions || [])],
      }));
  };

  const removeInteraction = (index: number) => {
      setFormData(prev => ({
          ...prev,
          interactions: (prev.interactions || []).filter((_, i) => i !== index),
      }));
  };
  
  const handleInteractionChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const newInteractions = [...(formData.interactions || [])];
      // @ts-ignore
      newInteractions[index][name] = value;
      setFormData(prev => ({...prev, interactions: newInteractions}));
  };
  
  const handleInteractionTypeChange = (index: number, value: InteractionType) => {
      const newInteractions = [...(formData.interactions || [])];
      newInteractions[index].type = value;
      setFormData(prev => ({...prev, interactions: newInteractions}));
  }


  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          },
        }));
      }
    } catch (error) {
      console.error("Falha ao buscar CEP:", error);
    }
  };
  
  const handleSaveLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let updatedLocations;
    
    if (editingLocation) {
      updatedLocations = initialLocations.map(l => (l.id === editingLocation.id ? formData : l));
    } else {
      const newLocation: CustomerLocation = {
        ...formData,
        clientId: TEST_CLIENT_ID,
        id: `loc-0${initialLocations.length + 1}`,
      };
      updatedLocations = [newLocation, ...initialLocations];
    }
    
    setCustomerLocations(updatedLocations);
    setLocations(updatedLocations.filter(l => l.clientId === TEST_CLIENT_ID));
    closeDialog();
  };

  // --- KPI Calculation Functions ---
  const getAssetCount = (locationId: string) => assets.filter(a => a.customerLocationId === locationId).length;
  const getOpenWorkOrders = (locationId: string) => workOrders.filter(wo => {
    const asset = assets.find(a => a.id === wo.assetId);
    return asset?.customerLocationId === locationId && wo.status === 'ABERTO';
  }).length;
  
  const getCorrectiveRatio = (locationId: string) => {
    const locationWorkOrders = workOrders.filter(wo => {
        const asset = assets.find(a => a.id === wo.assetId);
        return asset?.customerLocationId === locationId;
    });
    if (locationWorkOrders.length === 0) return 0;
    const correctiveOrders = locationWorkOrders.filter(wo => ['Alta', 'Urgente'].includes(wo.priority)).length;
    return (correctiveOrders / locationWorkOrders.length) * 100;
  }
  
  const getStatusBadgeVariant = (status: ContractStatus) => {
      switch (status) {
          case 'Vigente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
          case 'Próximo a Vencer': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
          case 'Vencido': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      }
  }

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Usuário';


  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">Clientes Finais de {testClient?.name || '...'}</h1>
          <Button onClick={() => openDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente Final</TableHead>
                <TableHead>Ativos</TableHead>
                <TableHead>OS Abertas</TableHead>
                <TableHead>Status Contrato</TableHead>
                <TableHead>Criticidade</TableHead>
                <TableHead>Add-ons</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map(location => {
                const assetCount = getAssetCount(location.id);
                const openWOs = getOpenWorkOrders(location.id);
                const correctiveRatio = getCorrectiveRatio(location.id);

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
                      {location.contractStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      {correctiveRatio > 50 && (
                          <Tooltip>
                              <TooltipTrigger>
                                  <Badge variant="destructive">
                                      <AlertTriangle className="mr-1.5 h-3 w-3" />
                                      Alta Taxa Corretiva
                                  </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>{correctiveRatio.toFixed(0)}% das OS são corretivas.</p>
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
                                    <p>Módulo IA Ativo</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
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
                        <DropdownMenuItem onClick={() => openDialog(location)}>
                          Editar
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
              <DialogTitle>{editingLocation ? 'Editar Cliente Final' : 'Novo Cliente Final'}</DialogTitle>
              <DialogDescription>
                {editingLocation ? 'Atualize os detalhes do cliente e seus contatos.' : `Cadastre um novo cliente final para ${testClient?.name || ''}.`}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] -mx-6 px-6">
              <form onSubmit={handleSaveLocation} id="location-form" className="space-y-6 py-4 px-1">
                <h3 className="text-lg font-medium">Dados Cadastrais</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Cliente Final</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: Condomínio Edifício Central"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contractStatus">Status do Contrato</Label>
                        <Select name="contractStatus" value={formData.contractStatus} onValueChange={(value) => handleSelectChange('contractStatus', value as ContractStatus)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                {contractStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input id="zipCode" name="address.zipCode" value={formData.address?.zipCode || ''} onChange={handleInputChange} onBlur={handleCepBlur} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="street">Rua</Label>
                          <Input id="street" name="address.street" value={formData.address?.street || ''} onChange={handleInputChange} />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="number">Número</Label>
                            <Input id="number" name="address.number" value={formData.address?.number || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="complement">Complemento</Label>
                            <Input id="complement" name="address.complement" value={formData.address?.complement || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input id="neighborhood" name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input id="city" name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input id="state" name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} />
                    </div>
                </div>
                
                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Contatos</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addContact}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Adicionar Contato
                      </Button>
                  </div>
                  <div className="space-y-4">
                    {(formData.contacts || []).map((contact, index) => (
                      <div key={contact.id} className="p-4 border rounded-lg space-y-4 relative">
                          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeContact(index)}>
                              <Trash2 className="h-4 w-4 text-destructive"/>
                              <span className="sr-only">Remover Contato</span>
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`contact-name-${index}`}>Nome Completo</Label>
                              <Input id={`contact-name-${index}`} name="name" value={contact.name} onChange={e => handleContactChange(index, e)} required/>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`contact-role-${index}`}>Função</Label>
                               <Select name="cmmsRoleId" value={contact.cmmsRoleId} onValueChange={(value) => handleContactSelectChange(index, value)} required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma função" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableRoles.map(role => (
                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`contact-phone-${index}`}>Telefone</Label>
                                <Input id={`contact-phone-${index}`} name="phone" value={contact.phone || ''} onChange={e => handleContactChange(index, e)} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`contact-email-${index}`}>Email</Label>
                                <Input id={`contact-email-${index}`} name="email" type="email" value={contact.email || ''} onChange={e => handleContactChange(index, e)} />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor={`contact-observation-${index}`}>Observação (Uso Interno)</Label>
                              <Textarea id={`contact-observation-${index}`} name="observation" value={contact.observation || ''} onChange={e => handleContactChange(index, e)} />
                          </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                
                <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Histórico de Interações (CRM)</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addInteraction}>
                          <MessageSquarePlus className="mr-2 h-4 w-4" />
                          Registrar Interação
                      </Button>
                  </div>
                   <div className="space-y-4">
                      {(formData.interactions || []).map((interaction, index) => (
                          <div key={interaction.id} className="p-4 border rounded-lg space-y-3 relative">
                              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeInteraction(index)}>
                                  <Trash2 className="h-4 w-4 text-destructive"/>
                                  <span className="sr-only">Remover Interação</span>
                              </Button>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3"/>
                                    <span>{format(new Date(interaction.date), "dd/MM/yyyy HH:mm", { locale: ptBR })} por {getUserName(interaction.userId)}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                <div className="space-y-2 sm:col-span-2">
                                  <Label htmlFor={`interaction-type-${index}`}>Tipo</Label>
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
                                  <Label htmlFor={`interaction-desc-${index}`}>Descrição</Label>
                                  <Textarea 
                                      id={`interaction-desc-${index}`} 
                                      name="description" 
                                      value={interaction.description}
                                      onChange={(e) => handleInteractionChange(index, e)}
                                      placeholder="Descreva a interação..."
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
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" form="location-form">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
