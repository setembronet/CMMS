
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { workOrders as initialWorkOrders, assets as allAssets, users as allUsers } from '@/lib/data';
import type { WorkOrder, Asset, User, OrderStatus, OrderPriority } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TEST_CLIENT_ID = 'client-01';

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
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>(initialWorkOrders.filter(wo => wo.clientId === TEST_CLIENT_ID));
  const [clientAssets, setClientAssets] = React.useState<Asset[]>([]);
  const [clientUsers, setClientUsers] = React.useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<WorkOrder | null>(null);
  const [formData, setFormData] = React.useState<WorkOrder>(emptyWorkOrder);

  React.useEffect(() => {
    setClientAssets(allAssets.filter(a => a.clientId === TEST_CLIENT_ID));
    setClientUsers(allUsers.filter(u => u.clientId === TEST_CLIENT_ID && u.cmmsRole === 'TECNICO'));
  }, []);

  const getAssetName = (id: string) => allAssets.find(a => a.id === id)?.name || 'N/A';
  const getResponsibleName = (id?: string) => id ? allUsers.find(u => u.id === id)?.name || 'N/A' : 'Não atribuído';

  const openDialog = (order: WorkOrder | null = null) => {
    setEditingOrder(order);
    setFormData(order || emptyWorkOrder);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newOrder: WorkOrder = {
      ...formData,
      clientId: TEST_CLIENT_ID,
      id: editingOrder?.id || `os-${Date.now()}`,
      creationDate: editingOrder?.creationDate || new Date().getTime(),
    };

    if (editingOrder) {
      setWorkOrders(workOrders.map(wo => (wo.id === newOrder.id ? newOrder : wo)));
    } else {
      setWorkOrders([newOrder, ...workOrders]);
    }
    closeDialog();
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
              <TableHead>Data</TableHead>
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
                <TableCell>{format(new Date(order.creationDate), 'dd/MM/yyyy')}</TableCell>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da ordem de serviço.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <form onSubmit={handleSaveOrder} id="order-form" className="space-y-4 py-4 px-1">
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsibleId">Técnico Responsável</Label>
                <Select name="responsibleId" value={formData.responsibleId || ''} onValueChange={(value) => handleSelectChange('responsibleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Atribuir a um técnico (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não atribuído</SelectItem>
                    {clientUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

            </form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="order-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
