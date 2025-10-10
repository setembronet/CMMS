
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
import { PlusCircle, MoreHorizontal, RotateCcw, Calendar as CalendarIcon, Trash2, AlertTriangle, FileWarning, ShoppingCart, User, Play, Check, FilePlus, ChevronDown, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { workOrders as initialWorkOrders, assets as allAssets, users as allUsers, products as initialProducts, setProducts, contracts, setWorkOrders as setGlobalWorkOrders, rootCauses, recommendedActions, segments, customerLocations as allLocations, checklistTemplates } from '@/lib/data';
import type { WorkOrder, Asset, User, OrderStatus, OrderPriority, Product, WorkOrderPart, MaintenanceFrequency, ChecklistItem, ChecklistItemStatus, ChecklistGroup, RootCause, RecommendedAction, Checklist } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, addDays, addMonths, addWeeks, addQuarters, addYears, differenceInMilliseconds } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineTime, TimelineContent, TimelineDescription } from '@/components/ui/timeline';


const CURRENT_USER_ID = 'user-04'; // Assuming the logged in user is a manager for this client

const orderStatuses: OrderStatus[] = ['ABERTO', 'EM ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
const orderPriorities: OrderPriority[] = ['Baixa', 'Média', 'Alta', 'Urgente'];
const checklistStatuses: ChecklistItemStatus[] = ['OK', 'NÃO OK', 'N/A'];

const getNextDueDate = (last: number, frequency: MaintenanceFrequency): Date => {
    switch (frequency) {
        case 'DIARIA': return addDays(last, 1);
        case 'SEMANAL': return addWeeks(last, 1);
        case 'QUINZENAL': return addDays(last, 15);
        case 'MENSAL': return addMonths(last, 1);
        case 'TRIMESTRAL': return addQuarters(last, 1);
        case 'SEMESTRAL': return addMonths(last, 6);
        case 'ANUAL': return addYears(last, 1);
    }
};

export default function WorkOrdersPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([]);
  const [clientAssets, setClientAssets] = React.useState<Asset[]>([]);
  const [clientUsers, setClientUsers] = React.useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<WorkOrder | null>(null);
  const [formData, setFormData] = React.useState<WorkOrder | null>(null);
  const [products, setLocalProducts] = React.useState<Product[]>(initialProducts);
  const [availableChecklists, setAvailableChecklists] = React.useState<typeof checklistTemplates>([]);

  const emptyWorkOrder: WorkOrder = React.useMemo(() => ({
    id: '',
    title: '',
    description: '',
    clientId: selectedClient?.id || '',
    assetId: '',
    status: 'ABERTO',
    priority: 'Média',
    creationDate: new Date().getTime(),
    createdByUserId: CURRENT_USER_ID,
    internalObservation: '',
    squad: '',
    partsUsed: [],
  }), [selectedClient]);

  const generatePreventiveWorkOrders = React.useCallback((existingWorkOrders: WorkOrder[], clientId: string): WorkOrder[] => {
      const newWorkOrders: WorkOrder[] = [];
      const today = new Date();
      const lookaheadDate = addDays(today, 7);
      
      const clientContracts = contracts.filter(c => {
          const location = allAssets.find(a => a.id === c.coveredAssetIds[0])?.customerLocationId;
          const contractClient = allLocations.find(l => l.id === location)?.clientId;
          return contractClient === clientId;
      });

      clientContracts.forEach(contract => {
          contract.plans.forEach(plan => {
              let nextDueDate = getNextDueDate(plan.lastGenerated, plan.frequency);
              
              while (nextDueDate <= lookaheadDate) {
                  const alreadyExists = existingWorkOrders.some(wo => 
                      wo.isPreventive && 
                      wo.assetId === plan.assetId && 
                      wo.description === `Manutenção preventiva programada conforme plano: ${plan.description}` &&
                      format(new Date(wo.scheduledDate || 0), 'yyyy-MM-dd') === format(nextDueDate, 'yyyy-MM-dd')
                  );

                  if (!alreadyExists) {
                      const newWo: WorkOrder = {
                          ...emptyWorkOrder,
                          id: `os-prev-${plan.id}-${format(nextDueDate, 'yyyyMMdd')}`,
                          title: `Preventiva: ${plan.description}`,
                          description: `Manutenção preventiva programada conforme plano: ${plan.description}`,
                          assetId: plan.assetId,
                          priority: 'Média',
                          isPreventive: true,
                          scheduledDate: nextDueDate.getTime(),
                          creationDate: new Date().getTime(),
                          clientId: clientId,
                      };
                      newWorkOrders.push(newWo);
                  }
                  nextDueDate = getNextDueDate(nextDueDate.getTime(), plan.frequency);
              }
          });
      });

      return newWorkOrders;
  }, [emptyWorkOrder]);


  React.useEffect(() => {
    if (selectedClient) {
      const newPreventiveOrders = generatePreventiveWorkOrders(initialWorkOrders, selectedClient.id);
      let allClientOrders = initialWorkOrders.filter(wo => wo.clientId === selectedClient.id);

      if (newPreventiveOrders.length > 0) {
          const currentAndNew = [...allClientOrders, ...newPreventiveOrders];
          const allGlobalOrders = [...initialWorkOrders, ...newPreventiveOrders];
          // This is a mock update. In a real app, you'd have a more robust system.
          // setGlobalWorkOrders(allGlobalOrders); 
          setWorkOrders(currentAndNew);
      } else {
          setWorkOrders(allClientOrders);
      }

      setClientAssets(allAssets.filter(a => a.clientId === selectedClient.id));
      setClientUsers(allUsers.filter(u => u.clientId === selectedClient.id && u.cmmsRole === 'TECNICO'));
    } else {
      setWorkOrders([]);
      setClientAssets([]);
      setClientUsers([]);
    }
    setLocalProducts(initialProducts);
  }, [selectedClient, generatePreventiveWorkOrders]);


  React.useEffect(() => {
    if (formData?.responsibleId) {
        const selectedUser = clientUsers.find(u => u.id === formData.responsibleId);
        if (selectedUser?.squad && !formData.squad) { // only autofill if squad is empty
            setFormData(prev => prev ? ({...prev, squad: selectedUser.squad}) : null);
        }
    }
  }, [formData, clientUsers]);

  React.useEffect(() => {
    if (formData?.assetId) {
        const asset = clientAssets.find(a => a.id === formData.assetId);
        if (asset) {
            setAvailableChecklists(checklistTemplates.filter(t => t.segmentId === asset.activeSegment));
        } else {
            setAvailableChecklists([]);
        }
    } else {
        setAvailableChecklists([]);
    }
  }, [formData?.assetId, clientAssets]);


  const getAssetName = (id: string) => allAssets.find(a => a.id === id)?.name || 'N/A';
  const getTechnician = (id?: string) => id ? allUsers.find(u => u.id === id) : null;
  const getTechnicianName = (id?: string) => getTechnician(id)?.name || 'N/A';
  
  const getProduct = (id: string) => products.find(p => p.id === id);
  const getProductName = (id: string) => getProduct(id)?.name || 'N/A';
  const getProductPrice = (id: string) => getProduct(id)?.price || 0;
  const getProductStock = (id: string) => getProduct(id)?.stock || 0;


  const openDialog = (order: WorkOrder | null = null) => {
    setEditingOrder(order);
    let orderData: WorkOrder;

    if (order) {
        orderData = JSON.parse(JSON.stringify(order));
    } else {
        orderData = JSON.parse(JSON.stringify(emptyWorkOrder));
    }

    if (!orderData.checklist && orderData.checklistTemplateId) {
      const template = checklistTemplates.find(t => t.id === orderData.checklistTemplateId);
      if(template) {
        orderData.checklist = JSON.parse(JSON.stringify(template.checklistData));
      }
    }
    
    setFormData(orderData);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setEditingOrder(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSelectChange = (name: keyof WorkOrder, value: string) => {
    if (!formData) return;
    const oldStatus = formData.status;
    const newStatus = name === 'status' ? value as OrderStatus : oldStatus;
    
    setFormData(prev => {
        if (!prev) return null;
        let newStartDate = prev.startDate;
        let newEndDate = prev.endDate;
        let newChecklist = prev.checklist;
        let newChecklistTemplateId = prev.checklistTemplateId;

        if (name === 'assetId') {
            newChecklist = undefined;
            newChecklistTemplateId = undefined;
        }

        if (name === 'checklistTemplateId') {
            const template = checklistTemplates.find(t => t.id === value);
            if (template) {
                newChecklist = JSON.parse(JSON.stringify(template.checklistData));
                newChecklistTemplateId = value;
            }
        }

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
            checklist: newChecklist,
            checklistTemplateId: newChecklistTemplateId,
        };
    });
  };

  const handleDateChange = (name: keyof WorkOrder, date: Date | undefined) => {
    if (!formData) return;
    setFormData(prev => prev ? ({...prev, [name]: date?.getTime()}) : null);
  }

  const handleAddPart = () => {
    if (!formData) return;
    const newPart: WorkOrderPart = { productId: '', quantity: 1 };
    setFormData(prev => prev ? ({ ...prev, partsUsed: [...(prev.partsUsed || []), newPart] }) : null);
  };

  const handlePartChange = (index: number, field: keyof WorkOrderPart, value: string | number) => {
    if (!formData) return;
    const newParts = [...(formData.partsUsed || [])];
    // @ts-ignore
    newParts[index][field] = value;
    setFormData(prev => prev ? ({ ...prev, partsUsed: newParts }) : null);
  };

  const handleRemovePart = (index: number) => {
    if (!formData) return;
    setFormData(prev => prev ? ({ ...prev, partsUsed: (prev.partsUsed || []).filter((_, i) => i !== index) }) : null);
  };

  const handleChecklistItemChange = (groupIndex: number, itemIndex: number, field: keyof ChecklistItem, value: string) => {
    if (!formData || !formData.checklist) return;
    const newChecklist = JSON.parse(JSON.stringify(formData.checklist)) as Checklist;
    // @ts-ignore
    newChecklist[groupIndex].items[itemIndex][field] = value;
    setFormData(prev => prev ? ({...prev, checklist: newChecklist}) : null);
  };

  const calculatePartsCost = (order: WorkOrder | null) => {
    if (!order) return 0;
    return (order.partsUsed || []).reduce((total, part) => {
      const product = products.find(p => p.id === part.productId);
      return total + (product ? product.price * part.quantity : 0);
    }, 0);
  };

  const calculateLaborCost = (order: WorkOrder | null) => {
    if (!order || !order.startDate || !order.endDate || !order.responsibleId) return 0;
    const technician = getTechnician(order.responsibleId);
    if (!technician || !technician.costPerHour) return 0;

    const durationInMillis = differenceInMilliseconds(new Date(order.endDate), new Date(order.startDate));
    const durationInHours = durationInMillis / (1000 * 60 * 60);

    return durationInHours * technician.costPerHour;
  };


  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !selectedClient) return;

    const newOrder: WorkOrder = {
      ...formData,
      clientId: selectedClient.id,
      id: editingOrder?.id || `os-${Date.now()}`,
      creationDate: editingOrder?.creationDate || new Date().getTime(),
      createdByUserId: editingOrder?.createdByUserId || CURRENT_USER_ID,
    };

    // --- Stock Logic ---
    const originalParts = editingOrder?.partsUsed || [];
    const newParts = newOrder.partsUsed || [];
    const stockChanges = new Map<string, number>();

    originalParts.forEach(part => {
        stockChanges.set(part.productId, (stockChanges.get(part.productId) || 0) - part.quantity);
    });
    newParts.forEach(part => {
        stockChanges.set(part.productId, (stockChanges.get(part.productId) || 0) + part.quantity);
    });

    const updatedProducts = products.map(product => {
        if (stockChanges.has(product.id)) {
            const change = stockChanges.get(product.id) || 0;
            return { ...product, stock: product.stock - change };
        }
        return product;
    });

    setProducts(updatedProducts); // Update global data source
    setLocalProducts(updatedProducts); // Update local state for UI
    // --- End Stock Logic ---


    let allWorkOrders;
    if (editingOrder) {
      allWorkOrders = initialWorkOrders.map(wo => (wo.id === newOrder.id ? newOrder : wo));
    } else {
      allWorkOrders = [newOrder, ...initialWorkOrders];
    }
    setGlobalWorkOrders(allWorkOrders);
    setWorkOrders(allWorkOrders.filter(wo => wo.clientId === selectedClient.id));
    
    closeDialog();
  };

  const handleReopenOrder = () => {
    if (!formData) return;
    setFormData(prev => prev ? ({
        ...prev, 
        status: 'ABERTO',
        endDate: undefined, // Clear end date on reopen
    }) : null);
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

  const isFormDisabled = formData?.status === 'CONCLUIDO' || formData?.status === 'CANCELADO';
  
  const formatDate = (timestamp?: number) => timestamp ? format(new Date(timestamp), 'dd/MM/yyyy') : 'N/A';
  const formatDateTime = (timestamp?: number) => timestamp ? format(new Date(timestamp), 'dd/MM/yyyy HH:mm') : 'N/A';

  const generateTimelineEvents = (order: WorkOrder) => {
      if (!order) return [];
      const events = [];

      events.push({
          icon: FilePlus,
          color: "text-sky-500",
          title: "Ordem de Serviço Criada",
          description: `Criado por: ${getCreatorName(order.createdByUserId)}`,
          date: order.creationDate,
      });

      if (order.scheduledDate) {
          events.push({
              icon: CalendarIcon,
              color: "text-gray-500",
              title: "Agendamento",
              description: `Serviço agendado para ${format(new Date(order.scheduledDate), 'dd/MM/yyyy')}`,
              date: order.creationDate + 1, // just to order it
          });
      }

      if (order.responsibleId) {
          events.push({
              icon: User,
              color: "text-gray-500",
              title: "Técnico Atribuído",
              description: `Atribuído a: ${getTechnicianName(order.responsibleId)}`,
              date: order.creationDate + 2, // just to order it
          });
      }

      if (order.startDate) {
          events.push({
              icon: Play,
              color: "text-blue-500",
              title: "Início da Execução",
              description: `Serviço iniciado em ${formatDateTime(order.startDate)}`,
              date: order.startDate,
          });
      }
      
      if (order.partsUsed && order.partsUsed.length > 0) {
           events.push({
              icon: ShoppingCart,
              color: "text-orange-500",
              title: "Peças Utilizadas",
              description: `${order.partsUsed.map(p => `${p.quantity}x ${getProductName(p.productId)}`).join(', ')}`,
              date: order.endDate ? order.endDate - 1 : new Date().getTime(),
          });
      }

      if (order.endDate) {
          events.push({
              icon: Check,
              color: "text-green-500",
              title: "Serviço Concluído",
              description: `Finalizado em ${formatDateTime(order.endDate)}`,
              date: order.endDate,
          });
      }
      
      return events.sort((a,b) => b.date - a.date);
  }
  
  const laborCost = calculateLaborCost(formData);
  const partsCost = calculatePartsCost(formData);
  const totalCost = laborCost + partsCost;

  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('workOrders.selectClientPrompt')}</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('workOrders.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('workOrders.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('workOrders.table.title')}</TableHead>
              <TableHead>{t('workOrders.table.asset')}</TableHead>
              <TableHead>{t('workOrders.table.scheduledDate')}</TableHead>
              <TableHead>{t('workOrders.table.technician')}</TableHead>
              <TableHead>{t('workOrders.table.priority')}</TableHead>
              <TableHead>{t('workOrders.table.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {order.isPreventive && <FileWarning className="h-4 w-4 text-muted-foreground" />}
                    {order.title}
                  </div>
                </TableCell>
                <TableCell>
                    <Button variant="link" className="p-0 h-auto" onClick={() => {
                        const assetToEdit = allAssets.find(a => a.id === order.assetId);
                        if (assetToEdit) {
                           // This is a placeholder for a function that would open the asset dialog.
                           // In a real app, this might be a context function or a prop drill.
                           // For now, we will just log it.
                           console.log("Would open asset dossier for:", assetToEdit.name);
                        }
                    }}>
                        {getAssetName(order.assetId)}
                        <LinkIcon className="ml-2 h-3 w-3" />
                    </Button>
                </TableCell>
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
                        <span className="sr-only">{t('common.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(order)}>
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
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? t('workOrders.dialog.editTitle') : t('workOrders.dialog.newTitle')}</DialogTitle>
            <DialogDescription>
             {editingOrder ? t('workOrders.dialog.description', { id: editingOrder.id, user: getCreatorName(editingOrder.createdByUserId), date: formatDateTime(editingOrder.creationDate) }) : t('workOrders.dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>
          {formData && (
            <>
            <div className="grid md:grid-cols-2 gap-6 max-h-[65vh]">
              <ScrollArea className="pr-6 -mr-6">
                <form onSubmit={handleSaveOrder} id="order-form" className="space-y-6 py-4 px-1">
                  
                  <fieldset disabled={isFormDisabled} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="assetId">{t('workOrders.dialog.asset')}</Label>
                        <Select name="assetId" value={formData.assetId} onValueChange={(value) => handleSelectChange('assetId', value)} required>
                            <SelectTrigger>
                            <SelectValue placeholder={t('workOrders.dialog.assetPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                            {clientAssets.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="checklistTemplateId">Modelo de Checklist</Label>
                            <Select name="checklistTemplateId" value={formData.checklistTemplateId || ''} onValueChange={(value) => handleSelectChange('checklistTemplateId', value)} disabled={!formData.assetId}>
                                <SelectTrigger>
                                <SelectValue placeholder={availableChecklists.length > 0 ? "Selecione um modelo" : "Nenhum modelo para este segmento"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableChecklists.map(template => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="title">{t('workOrders.dialog.title')}</Label>
                      <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder={t('workOrders.dialog.titlePlaceholder')}/>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">{t('workOrders.dialog.descriptionLabel')}</Label>
                      <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} placeholder={t('workOrders.dialog.descriptionPlaceholder')}/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="status">{t('workOrders.dialog.status')}</Label>
                          <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value as OrderStatus)} required>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  {orderStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="priority">{t('workOrders.dialog.priority')}</Label>
                          <Select name="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value as OrderPriority)} required>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  {orderPriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledDate">{t('workOrders.dialog.scheduledDate')}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.scheduledDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.scheduledDate ? format(new Date(formData.scheduledDate), "PPP") : <span>{t('common.optional')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined} onSelect={(date) => handleDateChange('scheduledDate', date)} initialFocus />
                            </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <Separator />

                    <h3 className="text-base font-medium">{t('workOrders.dialog.assignmentSection')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="responsibleId">{t('workOrders.dialog.responsibleTechnician')}</Label>
                            <Select name="responsibleId" value={formData.responsibleId || ''} onValueChange={(value) => handleSelectChange('responsibleId', value)}>
                                <SelectTrigger>
                                <SelectValue placeholder={t('workOrders.dialog.responsibleTechnicianPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="squad">{t('workOrders.dialog.squad')}</Label>
                            <Input id="squad" name="squad" value={formData.squad || ''} onChange={handleInputChange} placeholder={t('workOrders.dialog.squadPlaceholder')}/>
                        </div>
                    </div>

                    {formData.checklist && (
                      <>
                        <Separator />
                        <Accordion type="single" collapsible defaultValue='item-0' className="w-full">
                          <h3 className="text-base font-medium mb-2">{t('workOrders.dialog.checklistSection')}</h3>
                            {formData.checklist.map((group, groupIndex) => (
                              <AccordionItem value={`item-${groupIndex}`} key={group.id}>
                                <AccordionTrigger>{group.title}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                    {group.items.map((item, itemIndex) => (
                                        <div key={item.id} className="grid grid-cols-1 gap-4 rounded-md border p-4">
                                            <Label className="font-medium">{item.text}</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`checklist-status-${groupIndex}-${itemIndex}`} className="text-xs">{t('workOrders.dialog.checklistStatus')}</Label>
                                                    <Select value={item.status} onValueChange={(value) => handleChecklistItemChange(groupIndex, itemIndex, 'status', value)}>
                                                        <SelectTrigger id={`checklist-status-${groupIndex}-${itemIndex}`}>
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {checklistStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`checklist-comment-${groupIndex}-${itemIndex}`} className="text-xs">{t('workOrders.dialog.checklistComment')}</Label>
                                                    <Input 
                                                        id={`checklist-comment-${groupIndex}-${itemIndex}`}
                                                        value={item.comment || ''}
                                                        onChange={(e) => handleChecklistItemChange(groupIndex, itemIndex, 'comment', e.target.value)}
                                                        placeholder={t('workOrders.dialog.checklistCommentPlaceholder')}
                                                        required={item.status === 'NÃO OK'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                        </Accordion>
                      </>
                    )}

                    <Separator />
                    
                    <h3 className="text-base font-medium">{t('workOrders.dialog.closingSection')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rootCause">{t('workOrders.dialog.failureCause')}</Label>
                            <Select name="rootCause" value={formData.rootCause || ''} onValueChange={(value) => handleSelectChange('rootCause', value as RootCause)}>
                                <SelectTrigger>
                                <SelectValue placeholder={t('workOrders.dialog.failureCausePlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {rootCauses.map(cause => <SelectItem key={cause.value} value={cause.value}>{cause.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recommendedAction">{t('workOrders.dialog.recommendedAction')}</Label>
                            <Select name="recommendedAction" value={formData.recommendedAction || ''} onValueChange={(value) => handleSelectChange('recommendedAction', value as RecommendedAction)}>
                                <SelectTrigger>
                                <SelectValue placeholder={t('workOrders.dialog.recommendedActionPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {recommendedActions.map(action => <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium">{t('workOrders.dialog.partsSection')}</h3>
                            <Button type="button" size="sm" variant="outline" onClick={handleAddPart}>
                                <PlusCircle className="mr-2 h-4 w-4" /> {t('workOrders.dialog.addPart')}
                            </Button>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%]">{t('workOrders.dialog.part')}</TableHead>
                                        <TableHead>{t('workOrders.dialog.quantity')}</TableHead>
                                        <TableHead>{t('workOrders.dialog.cost')}</TableHead>
                                        <TableHead>{t('workOrders.dialog.stock')}</TableHead>
                                        <TableHead className="text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(formData.partsUsed || []).map((part, index) => {
                                      const stock = getProductStock(part.productId);
                                      const insufficientStock = part.quantity > stock;
                                      return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Select value={part.productId} onValueChange={(value) => handlePartChange(index, 'productId', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('workOrders.dialog.partPlaceholder')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input type="number" value={part.quantity} onChange={(e) => handlePartChange(index, 'quantity', parseInt(e.target.value, 10) || 1)} min="1" className={cn(insufficientStock && "border-destructive")}/>
                                            </TableCell>
                                            <TableCell>
                                                R$ {(getProductPrice(part.productId) * part.quantity).toFixed(2)}
                                            </TableCell>
                                            <TableCell className={cn(insufficientStock && "text-destructive")}>
                                                {insufficientStock ? (
                                                    <div className="flex items-center gap-1">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        {stock}
                                                    </div>
                                                ) : stock }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePart(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                    {(formData.partsUsed || []).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">{t('workOrders.dialog.noParts')}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-end items-start gap-4">
                            <div className="space-y-1 text-right">
                                <p className="text-muted-foreground">{t('workOrders.dialog.partsCost')}: R$ {partsCost.toFixed(2)}</p>
                                <p className="text-muted-foreground">{t('workOrders.dialog.laborCost')}: R$ {laborCost.toFixed(2)}</p>
                                <p className="font-bold text-lg">{t('workOrders.dialog.totalCost')}: R$ {totalCost.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="internalObservation">{t('workOrders.dialog.internalObservation')}</Label>
                      <Textarea id="internalObservation" name="internalObservation" value={formData.internalObservation || ''} onChange={handleInputChange} placeholder={t('workOrders.dialog.internalObservationPlaceholder')}/>
                    </div>
                  </fieldset>
                </form>
              </ScrollArea>

              <ScrollArea className="border-l -ml-3 pl-3">
                  <div className="px-4 py-4 space-y-4">
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-base font-medium">
                            Linha do Tempo
                            <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:-rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <Timeline className="mt-4">
                                {generateTimelineEvents(formData).map((event, index) => (
                                    <TimelineItem key={index}>
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
                        </CollapsibleContent>
                      </Collapsible>
                  </div>
              </ScrollArea>
            </div>
            <DialogFooter className="flex-col-reverse gap-y-2 sm:flex-row sm:justify-between w-full pt-4 border-t">
              {isFormDisabled ? (
                  <Button variant="secondary" onClick={handleReopenOrder}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t('workOrders.dialog.reopen')}
                  </Button>
              ) : (
                  <div /> // Placeholder to keep justify-between working
              )}
              <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                      {isFormDisabled ? t('workOrders.dialog.close') : t('common.cancel')}
                  </Button>
                  {!isFormDisabled && (
                      <Button type="submit" form="order-form">{t('common.save')}</Button>
                  )}
              </div>
            </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

    