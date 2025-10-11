
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { workOrders as initialWorkOrders, assets as allAssets, users as allUsers, products as initialProducts, setWorkOrders as setGlobalWorkOrders, checklistTemplates, rootCauses, recommendedActions } from '@/lib/data';
import type { WorkOrder, Asset, User, OrderStatus, OrderPriority, Checklist, ChecklistItem, ChecklistItemStatus, WorkOrderPart, Product, RootCause, RecommendedAction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, CheckSquare, Info, ListChecks, Wrench, ShieldAlert, BadgeInfo, Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, differenceInMilliseconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';

const checklistStatuses: ChecklistItemStatus[] = ['OK', 'NÃO OK', 'N/A'];

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  
  const orderId = params.id as string;
  
  const [workOrder, setWorkOrder] = React.useState<WorkOrder | null>(null);
  const [asset, setAsset] = React.useState<Asset | null>(null);
  const [creator, setCreator] = React.useState<User | null>(null);
  const [technician, setTechnician] = React.useState<User | null>(null);

  React.useEffect(() => {
    const order = initialWorkOrders.find(wo => wo.id === orderId);
    if (order) {
      const orderData = JSON.parse(JSON.stringify(order));
       if (!orderData.checklist && orderData.checklistTemplateId) {
        const template = checklistTemplates.find(t => t.id === orderData.checklistTemplateId);
        if (template) {
          orderData.checklist = JSON.parse(JSON.stringify(template.checklistData));
        }
      }
      setWorkOrder(orderData);
      
      const foundAsset = allAssets.find(a => a.id === order.assetId);
      setAsset(foundAsset || null);
      
      const foundCreator = allUsers.find(u => u.id === order.createdByUserId);
      setCreator(foundCreator || null);
      
      const foundTechnician = allUsers.find(u => u.id === order.responsibleId);
      setTechnician(foundTechnician || null);
    }
  }, [orderId]);
  
  const handleChecklistItemChange = (groupIndex: number, itemIndex: number, field: keyof ChecklistItem, value: string) => {
    if (!workOrder || !workOrder.checklist) return;
    const newChecklist = JSON.parse(JSON.stringify(workOrder.checklist)) as Checklist;
    // @ts-ignore
    newChecklist[groupIndex].items[itemIndex][field] = value;
    setWorkOrder(prev => prev ? ({...prev, checklist: newChecklist}) : null);
  };
  
  const handleAddPart = () => {
    if (!workOrder) return;
    const newPart: WorkOrderPart = { productId: '', quantity: 1 };
    setWorkOrder(prev => prev ? ({ ...prev, partsUsed: [...(prev.partsUsed || []), newPart] }) : null);
  };

  const handlePartChange = (index: number, field: keyof WorkOrderPart, value: string | number) => {
    if (!workOrder) return;
    const newParts = [...(workOrder.partsUsed || [])];
    // @ts-ignore
    newParts[index][field] = value;
    setWorkOrder(prev => prev ? ({ ...prev, partsUsed: newParts }) : null);
  };

  const handleRemovePart = (index: number) => {
    if (!workOrder) return;
    setWorkOrder(prev => prev ? ({ ...prev, partsUsed: (prev.partsUsed || []).filter((_, i) => i !== index) }) : null);
  };

  const handleFieldChange = (field: keyof WorkOrder, value: string) => {
    if (!workOrder) return;
    setWorkOrder(prev => prev ? { ...prev, [field]: value } : null);
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!workOrder) return;
    const updatedOrder = { ...workOrder, status: newStatus };
    if (newStatus === 'EM ANDAMENTO' && !workOrder.startDate) {
      updatedOrder.startDate = new Date().getTime();
    } else if (newStatus === 'CONCLUIDO' && !workOrder.endDate) {
      updatedOrder.endDate = new Date().getTime();
    }
    setWorkOrder(updatedOrder);
  };

  const handleSave = () => {
    if (!workOrder) return;
    const updatedWorkOrders = initialWorkOrders.map(wo => wo.id === workOrder.id ? workOrder : wo);
    setGlobalWorkOrders(updatedWorkOrders);
    // In a real app, you'd show a toast or confirmation
    router.push('/dashboard/orders');
  };

  const getPriorityBadgeClass = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'Baixa': return 'bg-blue-100 text-blue-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: WorkOrder['status']) => {
    switch (status) {
      case 'ABERTO': return 'bg-gray-200 text-gray-800';
      case 'EM ANDAMENTO': return 'bg-blue-500 text-white';
      case 'CONCLUIDO': return 'bg-green-500 text-white';
      case 'CANCELADO': return 'bg-red-500 text-white';
      default: return 'bg-gray-200';
    }
  };
  
  const getProduct = (id: string) => initialProducts.find(p => p.id === id);
  const getProductStock = (id: string) => getProduct(id)?.stock || 0;

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ordem de Serviço não encontrada.</p>
      </div>
    );
  }
  
  const isConcluded = workOrder.status === 'CONCLUIDO' || workOrder.status === 'CANCELADO';


  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className='flex-1'>
          <h1 className="font-semibold text-lg md:text-xl">{workOrder.title}</h1>
          <p className="text-xs text-muted-foreground">OS #{workOrder.id}</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge className={cn("hidden sm:flex", getPriorityBadgeClass(workOrder.priority))}>{workOrder.priority}</Badge>
            <Badge className={getStatusBadgeClass(workOrder.status)}>{workOrder.status}</Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{t('sidebar.assets')}</CardTitle>
                <Wrench className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <h2 className="text-xl font-bold">{asset?.name}</h2>
                <p className="text-sm text-muted-foreground">{asset?.brand} {asset?.model}</p>
                <p className="text-xs text-muted-foreground mt-1">S/N: {asset?.serialNumber}</p>
                <Button variant="link" className="p-0 h-auto mt-2">Ver dossiê completo do ativo</Button>
            </CardContent>
        </Card>

         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Detalhes do Chamado</CardTitle>
                 <Info className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
                <p className="text-sm">{workOrder.description || "Nenhuma descrição fornecida."}</p>
                <Separator />
                <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Criado por:</strong> {creator?.name || 'Desconhecido'}</p>
                    <p><strong>Técnico:</strong> {technician?.name || 'Não atribuído'}</p>
                    <p><strong>Data de Criação:</strong> {format(new Date(workOrder.creationDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                    {workOrder.scheduledDate && <p><strong>Data Agendada:</strong> {format(new Date(workOrder.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}</p>}
                </div>
            </CardContent>
        </Card>

        {workOrder.checklist && (
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ListChecks /> Checklist de Execução</CardTitle></CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible defaultValue='item-0' className="w-full">
                        {workOrder.checklist.map((group, groupIndex) => (
                            <AccordionItem value={`item-${groupIndex}`} key={group.id}>
                            <AccordionTrigger>{group.title}</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                {group.items.map((item, itemIndex) => (
                                    <div key={item.id} className="grid grid-cols-1 gap-4 rounded-md border p-4">
                                        <Label className="font-medium">{item.text}</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`checklist-status-${groupIndex}-${itemIndex}`} className="text-xs">{t('workOrders.dialog.checklistStatus')}</Label>
                                                <Select value={item.status} onValueChange={(value) => handleChecklistItemChange(groupIndex, itemIndex, 'status', value)} disabled={isConcluded}>
                                                    <SelectTrigger id={`checklist-status-${groupIndex}-${itemIndex}`}><SelectValue/></SelectTrigger>
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
                                                    disabled={isConcluded}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        )}
        
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg"><Wrench /> Peças e Materiais</CardTitle>
                    {!isConcluded && (
                        <Button size="sm" variant="outline" onClick={handleAddPart}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Peça</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Peça</TableHead>
                                <TableHead>Qtd.</TableHead>
                                <TableHead>Estoque</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(workOrder.partsUsed || []).map((part, index) => {
                                const stock = getProductStock(part.productId);
                                const insufficientStock = part.quantity > stock;
                                return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Select value={part.productId} onValueChange={(value) => handlePartChange(index, 'productId', value)} disabled={isConcluded}>
                                            <SelectTrigger><SelectValue placeholder="Selecione uma peça" /></SelectTrigger>
                                            <SelectContent>
                                                {initialProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" value={part.quantity} onChange={(e) => handlePartChange(index, 'quantity', parseInt(e.target.value, 10) || 1)} min="1" disabled={isConcluded} className={cn(insufficientStock && "border-destructive")}/>
                                    </TableCell>
                                    <TableCell className={cn(insufficientStock && "text-destructive font-bold")}>{stock}</TableCell>
                                    <TableCell className="text-right">
                                        {!isConcluded && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePart(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                            {(workOrder.partsUsed || []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">Nenhuma peça utilizada.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldAlert /> Causa, Solução, Ação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rootCause">{t('workOrders.dialog.failureCause')}</Label>
                        <Select name="rootCause" value={workOrder.rootCause || ''} onValueChange={(value) => handleFieldChange('rootCause', value as RootCause)} disabled={isConcluded}>
                            <SelectTrigger><SelectValue placeholder={t('workOrders.dialog.failureCausePlaceholder')} /></SelectTrigger>
                            <SelectContent>
                                {rootCauses.map(cause => <SelectItem key={cause.value} value={cause.value}>{cause.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recommendedAction">{t('workOrders.dialog.recommendedAction')}</Label>
                        <Select name="recommendedAction" value={workOrder.recommendedAction || ''} onValueChange={(value) => handleFieldChange('recommendedAction', value as RecommendedAction)} disabled={isConcluded}>
                            <SelectTrigger><SelectValue placeholder={t('workOrders.dialog.recommendedActionPlaceholder')} /></SelectTrigger>
                            <SelectContent>
                                {recommendedActions.map(action => <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internalObservation">{t('workOrders.dialog.internalObservation')}</Label>
                  <Textarea id="internalObservation" name="internalObservation" value={workOrder.internalObservation || ''} onChange={(e) => handleFieldChange('internalObservation', e.target.value)} placeholder={t('workOrders.dialog.internalObservationPlaceholder')} disabled={isConcluded} />
                </div>
            </CardContent>
        </Card>

      </main>

      {/* Footer Actions */}
      {!isConcluded && (
        <footer className="p-4 border-t bg-background sticky bottom-0 z-10">
            {workOrder.status === 'ABERTO' && (
                <Button className="w-full" size="lg" onClick={() => handleStatusChange('EM ANDAMENTO')}>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Serviço
                </Button>
            )}
            {workOrder.status === 'EM ANDAMENTO' && (
                 <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full" variant="outline" onClick={() => handleStatusChange('ABERTO')}>
                        <Pause className="mr-2 h-4 w-4" />
                        Pausar
                    </Button>
                    <Button className="w-full" onClick={() => handleStatusChange('CONCLUIDO')}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Finalizar Serviço
                    </Button>
                </div>
            )}
            {(workOrder.status === 'CONCLUIDO' || workOrder.status === 'CANCELADO') && (
                <Button className="w-full" onClick={handleSave}>Salvar Alterações</Button>
            )}
        </footer>
      )}
    </div>
  );
}
