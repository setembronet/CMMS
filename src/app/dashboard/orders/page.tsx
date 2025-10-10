
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal, RotateCcw, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { workOrders as initialWorkOrders, assets as allAssets, users as allUsers, products as allProducts } from '@/lib/data';
import type { WorkOrder, Asset, User, OrderStatus, OrderPriority, Product, WorkOrderPart } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

const TEST_CLIENT_ID = 'client-01';
const CURRENT_USER_ID = 'user-04'; // Assuming the logged in user is a manager for this client

const orderStatuses: OrderStatus[] = ['ABERTO', 'EM ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
const orderPriorities: OrderPriority[] = ['Baixa', 'Média', 'Alta', 'Urgente'];

const emptyWorkOrder: WorkOrder = {
  id: '',
  title: '',
  description: '',
  clientId: TEST_CLIENT_ID,
  assetId: '',
  status: 'ABERTO',
  priority: 'Média',
  creationDate: new Date().getTime(),
  createdByUserId: CURRENT_USER_ID,
  internalObservation: '',
  squad: '',
  partsUsed: [],
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>(initialWorkOrders.filter(wo => wo.clientId === TEST_CLIENT_ID));
  const [clientAssets, setClientAssets] = React.useState<Asset[]>([]);
  const [clientUsers, setClientUsers] = React.useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<WorkOrder | null>(null);
  const [formData, setFormData] = React.useState<WorkOrder>(emptyWorkOrder);
  const [products] = React.useState<Product[]>(allProducts);

  React.useEffect(() => {
    setClientAssets(allAssets.filter(a => a.clientId === TEST_CLIENT_ID));
    // Only show users that belong to the client and are technicians
    setClientUsers(allUsers.filter(u => u.clientId === TEST_CLIENT_ID && u.cmmsRole === 'TECNICO'));
  }, []);

  React.useEffect(() => {
    if (formData.responsibleId) {
        const selectedUser = clientUsers.find(u => u.id === formData.responsibleId);
        if (selectedUser?.squad && !formData.squad) { // only autofill if squad is empty
            setFormData(prev => ({...prev, squad: selectedUser.squad}));
        }
    }
  }, [formData.responsibleId, clientUsers, formData.squad]);


  const getAssetName = (id: string) => allAssets.find(a => a.id === id)?.name || 'N/A';
  const getTechnicianName = (id?: string) => id ? allUsers.find(u => u.id === id)?.name : 'N/A';
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';
  const getProductPrice = (id: string) => products.find(p => p.id === id)?.price || 0;


  const openDialog = (order: WorkOrder | null = null) => {
    setEditingOrder(order);
    if (order) {
        setFormData(JSON.parse(JSON.stringify(order))); // Deep copy
    } else {
        // When creating new, ensure it has the current user ID and client ID
        setFormData(JSON.parse(JSON.stringify({...emptyWorkOrder, createdByUserId: CURRENT_USER_ID, clientId: TEST_CLIENT_ID})));
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingOrder(null);
    setIsDialogOpen(false);
    setFormData(emptyWorkOrder);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof WorkOrder, value: string) => {
    const oldStatus = formData.status;
    const newStatus = name === 'status' ? value as OrderStatus : oldStatus;
    
    setFormData(prev => {
        let newStartDate = prev.startDate;
        let newEndDate = prev.endDate;

        if (name === 'status') {
            if (newStatus === 'EM ANDAMENTO' && oldStatus !== 'EM ANDAMENTO') {
                newStartDate = prev.startDate || new Date().getTime();
            }
            if (newStatus === 'CONCLUIDO' && oldStatus !== 'CONCLUIDO') {
                newEndDate = prev.endDate || new Date().getTime();
            }
             if (newStatus === 'ABERTO') {
                newEndDate = undefined;
            }
        }
        
        return { 
            ...prev, 
            [name]: value,
            startDate: newStartDate,
            endDate: newEndDate,
        };
    });
  };

  const handleDateChange = (name: keyof WorkOrder, date: Date | undefined) => {
    setFormData(prev => ({...prev, [name]: date?.getTime()}));
  }

  const handleAddPart = () => {
    const newPart: WorkOrderPart = { productId: '', quantity: 1 };
    setFormData(prev => ({ ...prev, partsUsed: [...(prev.partsUsed || []), newPart] }));
  };

  const handlePartChange = (index: number, field: keyof WorkOrderPart, value: string | number) => {
    const newParts = [...(formData.partsUsed || [])];
    // @ts-ignore
    newParts[index][field] = value;
    setFormData(prev => ({ ...prev, partsUsed: newParts }));
  };

  const handleRemovePart = (index: number) => {
    setFormData(prev => ({ ...prev, partsUsed: (prev.partsUsed || []).filter((_, i) => i !== index) }));
  };

  const calculateTotalCost = () => {
    return (formData.partsUsed || []).reduce((total, part) => {
      const product = products.find(p => p.id === part.productId);
      return total + (product ? product.price * part.quantity : 0);
    }, 0);
  };


  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newOrder: WorkOrder = {
      ...formData,
      clientId: TEST_CLIENT_ID,
      id: editingOrder?.id || `os-${Date.now()}`,
      creationDate: editingOrder?.creationDate || new Date().getTime(),
      createdByUserId: editingOrder?.createdByUserId || CURRENT_USER_ID,
    };

    if (editingOrder) {
      setWorkOrders(workOrders.map(wo => (wo.id === newOrder.id ? newOrder : wo)));
    } else {
      setWorkOrders([newOrder, ...workOrders]);
    }
    closeDialog();
  };

  const handleReopenOrder = () => {
    if (!formData) return;
    setFormData(prev => ({
        ...prev, 
        status: 'ABERTO',
        endDate: undefined, // Clear end date on reopen
    }));
  };
  
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'ABERTO': return 'secondary';
      case 'EM ANDAMENTO': return 'default';
      case 'CONCLUIDO': return 'outline';
      case 'CANCELADO': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeClass = (priority: OrderPriority) => {
    switch (priority) {
      case 'Baixa': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Média': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Urgente': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return '';
    }
  };
  
  const getCreatorName = (userId?: string) => {
    if (!userId) return 'N/A';
    return allUsers.find(u => u.id === userId)?.name || 'Desconhecido';
  };

  const isFormDisabled = formData.status === 'CONCLUIDO' || formData.status === 'CANCELADO';
  
  const formatDate = (timestamp?: number) => timestamp ? format(new Date(timestamp), 'dd/MM/yyyy') : 'N/A';
  const formatDateTime = (timestamp?: number) => timestamp ? format(new Date(timestamp), 'dd/MM/yyyy HH:mm') : 'N/A';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Ordens de Serviço</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Ordem de Serviço
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título da OS</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Agendamento</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.title}</TableCell>
                <TableCell>{getAssetName(order.assetId)}</TableCell>
                <TableCell>{formatDate(order.scheduledDate)}</TableCell>
                <TableCell>{getTechnicianName(order.responsibleId)}</TableCell>
                <TableCell>
                    <Badge variant="outline" className={cn('border', getPriorityBadgeClass(order.priority))}>
                        {order.priority}
                    </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
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
                      <DropdownMenuItem onClick={() => openDialog(order)}>
                        Ver / Editar
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Detalhes da Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
            <DialogDescription>
             {editingOrder ? `OS #${editingOrder.id} - Criada por ${getCreatorName(editingOrder.createdByUserId)} em: ${formatDateTime(editingOrder.creationDate)}` : 'Preencha os detalhes da ordem de serviço.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <form onSubmit={handleSaveOrder} id="order-form" className="space-y-4 py-4 px-1">
              
              <fieldset disabled={isFormDisabled} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assetId">Ativo</Label>
                  <Select name="assetId" value={formData.assetId} onValueChange={(value) => handleSelectChange('assetId', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ativo" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientAssets.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Ex: Manutenção Corretiva Urgente"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder="Detalhe o problema ou o serviço a ser realizado."/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value as OrderStatus)} required>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              {orderStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                       <Select name="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value as OrderPriority)} required>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              {orderPriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="scheduledDate">Data de Agendamento</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.scheduledDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.scheduledDate ? format(new Date(formData.scheduledDate), "PPP") : <span>Opcional</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined} onSelect={(date) => handleDateChange('scheduledDate', date)} initialFocus />
                        </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <Separator />

                <h3 className="text-base font-medium">Atribuição e Execução</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="responsibleId">Técnico Responsável</Label>
                        <Select name="responsibleId" value={formData.responsibleId || ''} onValueChange={(value) => handleSelectChange('responsibleId', value)}>
                            <SelectTrigger>
                            <SelectValue placeholder="Atribuir a um técnico (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                                {clientUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="squad">Equipe</Label>
                        <Input id="squad" name="squad" value={formData.squad || ''} onChange={handleInputChange} placeholder="Ex: Equipe Alpha"/>
                    </div>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
                    <div className="space-y-1">
                        <Label className="text-sm">Início da Execução</Label>
                        <p className="text-sm text-muted-foreground">{formatDateTime(formData.startDate)}</p>
                    </div>
                     <div className="space-y-1">
                        <Label className="text-sm">Fim da Execução</Label>
                        <p className="text-sm text-muted-foreground">{formatDateTime(formData.endDate)}</p>
                    </div>
                </div>


                <Separator />
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">Peças Utilizadas</h3>
                        <Button type="button" size="sm" variant="outline" onClick={handleAddPart}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Peça
                        </Button>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60%]">Peça</TableHead>
                                    <TableHead>Qtd</TableHead>
                                    <TableHead>Custo</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(formData.partsUsed || []).map((part, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Select value={part.productId} onValueChange={(value) => handlePartChange(index, 'productId', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma peça" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={part.quantity} onChange={(e) => handlePartChange(index, 'quantity', parseInt(e.target.value, 10) || 1)} min="1"/>
                                        </TableCell>
                                        <TableCell>
                                            R$ {(getProductPrice(part.productId) * part.quantity).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePart(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(formData.partsUsed || []).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma peça adicionada.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="flex justify-end font-medium">
                        Custo Total das Peças: R$ {calculateTotalCost().toFixed(2)}
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="internalObservation">Observação Interna (visível apenas para a equipe)</Label>
                  <Textarea id="internalObservation" name="internalObservation" value={formData.internalObservation || ''} onChange={handleInputChange} placeholder="Detalhes técnicos, histórico relevante, etc."/>
                </div>
              </fieldset>
            </form>
          </ScrollArea>
          <DialogFooter className="flex-col-reverse gap-y-2 sm:flex-row sm:justify-between w-full">
            {isFormDisabled ? (
                <Button variant="secondary" onClick={handleReopenOrder}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reabrir OS
                </Button>
            ) : (
                <div /> // Placeholder to keep justify-between working
            )}
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                    {isFormDisabled ? 'Fechar' : 'Cancelar'}
                </Button>
                {!isFormDisabled && (
                    <Button type="submit" form="order-form">Salvar</Button>
                )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
