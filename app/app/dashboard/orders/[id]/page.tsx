
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';
import { assets as allAssets, users as allUsers, products as initialProducts, checklistTemplates, rootCauses, recommendedActions } from '@/lib/data';
import type { WorkOrder, Asset, User, OrderStatus, OrderPriority, Checklist, ChecklistItem, ChecklistItemStatus, WorkOrderPart, Product, RootCause, RecommendedAction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, CheckSquare, Info, ListChecks, Wrench, ShieldAlert, BadgeInfo, Trash2, PlusCircle, AlertTriangle, Camera, Edit } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore } from '@/firebase';
import { useDocument } from '@/firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const checklistStatuses: ChecklistItemStatus[] = ['OK', 'NÃO OK', 'N/A'];

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const orderId = params.id as string;
  
  const { data: workOrder, setData: setWorkOrder, loading, error } = useDocument<WorkOrder>('workOrders', orderId);
  const [asset, setAsset] = React.useState<Asset | null>(null);
  const [creator, setCreator] = React.useState<User | null>(null);
  const [technician, setTechnician] = React.useState<User | null>(null);
  
  const techSigCanvas = React.useRef<SignatureCanvas>(null);
  const clientSigCanvas = React.useRef<SignatureCanvas>(null);

  React.useEffect(() => {
    if (workOrder) {
      const orderData = JSON.parse(JSON.stringify(workOrder));
       if (!orderData.checklist && orderData.checklistTemplateId) {
        const template = checklistTemplates.find(t => t.id === orderData.checklistTemplateId);
        if (template) {
          orderData.checklist = JSON.parse(JSON.stringify(template.checklistData));
        }
      }
      if(JSON.stringify(orderData) !== JSON.stringify(workOrder)) {
        setWorkOrder(orderData);
      }
      
      const foundAsset = allAssets.find(a => a.id === workOrder.assetId);
      setAsset(foundAsset || null);
      
      const foundCreator = allUsers.find(u => u.id === workOrder.createdByUserId);
      setCreator(foundCreator || null);
      
      const foundTechnician = allUsers.find(u => u.id === workOrder.responsibleId);
      setTechnician(foundTechnician || null);
    }
  }, [workOrder, setWorkOrder]);
  
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

  const handleFieldChange = (field: keyof WorkOrder, value: any) => {
    if (!workOrder) return;
    setWorkOrder(prev => prev ? { ...prev, [field]: value } : null);
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!workOrder) return;
    
    if (newStatus === 'CONCLUIDO' && isCompletionBlocked) {
        return; // Block completion if conditions are not met
    }

    const updatedOrder = { ...workOrder, status: newStatus };
    if (newStatus === 'EM ANDAMENTO' && !workOrder.startDate) {
      updatedOrder.startDate = new Date().getTime();
    } else if (newStatus === 'CONCLUIDO' && !workOrder.endDate) {
      updatedOrder.endDate = new Date().getTime();
    }
    setWorkOrder(updatedOrder);
  };

  const handleSave = async () => {
    if (!workOrder || !firestore) return;
    try {
        const { id, ...orderData } = workOrder;
        await updateDoc(doc(firestore, 'workOrders', id), orderData);
        toast({ title: "Sucesso!", description: "Ordem de serviço atualizada." });
        router.push('/dashboard/orders');
    } catch(error) {
        console.error("Error saving work order:", error);
        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível salvar a ordem de serviço." });
    }
  };
  
  const handleSaveSignature = (type: 'tecnico' | 'cliente') => {
      const canvas = type === 'tecnico' ? techSigCanvas.current : clientSigCanvas.current;
      if (!canvas || !workOrder) return;

      const signature = canvas.toDataURL(); // In a real app, upload this to Firebase Storage
      const urlField = type === 'tecnico' ? 'assinaturaTecnicoUrl' : 'assinaturaClienteUrl';
      const dateField = type === 'tecnico' ? 'dataAssinaturaTecnico' : 'dataAssinaturaCliente';
      
      setWorkOrder({
          ...workOrder,
          [urlField]: signature,
          [dateField]: new Date().getTime(),
      });
  };

  const clearSignature = (type: 'tecnico' | 'cliente') => {
      const canvas = type === 'tecnico' ? techSigCanvas.current : clientSigCanvas.current;
      if (canvas) canvas.clear();
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
      case 'EM_ESPERA_PECAS': return 'bg-amber-500 text-white';
      case 'AGUARDANDO_APROVACAO': return 'bg-cyan-500 text-white';
      case 'PENDENTE_RETORNO': return 'bg-purple-500 text-white';
      default: return 'bg-gray-200';
    }
  };
  
  const getProduct = (id: string) => initialProducts.find(p => p.id === id);
  const getProductStock = (id: string) => getProduct(id)?.stock || 0;

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Carregando Ordem de Serviço...</p></div>;
  }
  
  if (error || !workOrder) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ordem de Serviço não encontrada.</p>
      </div>
    );
  }
  
  const isConcluded = workOrder.status === 'CONCLUIDO' || workOrder.status === 'CANCELADO';
  const isCompletionBlocked = workOrder.mediaObrigatoria && 
                              (!workOrder.fotosAntesDepois?.antes || !workOrder.fotosAntesDepois?.depois);


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
            <Badge className={getStatusBadgeClass(workOrder.status)}>{workOrder.status.replace(/_/g, ' ')}</Badge>
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

        {workOrder.mediaObrigatoria && (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <CardTitle className="flex items-center gap-2 text-lg"><Camera /> Anexo de Mídia Obrigatório</CardTitle>
                         <Badge variant="destructive">Requerido</Badge>
                    </div>
                    <CardDescription>Para concluir esta OS, é obrigatório anexar as fotos de "Antes" e "Depois" do serviço.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="foto-antes">Foto "Antes"</Label>
                        <Input 
                            id="foto-antes" 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFieldChange('fotosAntesDepois', {...workOrder.fotosAntesDepois, antes: e.target.value})}
                            disabled={isConcluded}
                        />
                         {workOrder.fotosAntesDepois?.antes && <p className="text-xs text-muted-foreground">Arquivo selecionado.</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="foto-depois">Foto "Depois"</Label>
                        <Input 
                            id="foto-depois" 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFieldChange('fotosAntesDepois', {...workOrder.fotosAntesDepois, depois: e.target.value})}
                             disabled={isConcluded}
                        />
                        {workOrder.fotosAntesDepois?.depois && <p className="text-xs text-muted-foreground">Arquivo selecionado.</p>}
                    </div>
                </CardContent>
            </Card>
        )}


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
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Edit /> Assinaturas</CardTitle>
                <CardDescription>Coleta de assinaturas para validação do serviço.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Assinatura do Técnico: {technician?.name}</Label>
                    {workOrder.assinaturaTecnicoUrl ? (
                        <img src={workOrder.assinaturaTecnicoUrl} alt="Assinatura do Técnico" className="border rounded-md bg-white"/>
                    ) : (
                        <>
                         <div className="border rounded-md bg-white">
                           <SignatureCanvas ref={techSigCanvas} canvasProps={{ className: 'w-full h-40' }} />
                         </div>
                         <div className="flex gap-2">
                           <Button size="sm" onClick={() => handleSaveSignature('tecnico')} disabled={isConcluded}>Salvar Assinatura</Button>
                           <Button size="sm" variant="outline" onClick={() => clearSignature('tecnico')}>Limpar</Button>
                         </div>
                        </>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label>Assinatura do Cliente/Responsável</Label>
                     {workOrder.assinaturaClienteUrl ? (
                        <img src={workOrder.assinaturaClienteUrl} alt="Assinatura do Cliente" className="border rounded-md bg-white"/>
                    ) : (
                        <>
                         <div className="border rounded-md bg-white">
                           <SignatureCanvas ref={clientSigCanvas} canvasProps={{ className: 'w-full h-40' }} />
                         </div>
                         <div className="flex gap-2">
                           <Button size="sm" onClick={() => handleSaveSignature('cliente')} disabled={isConcluded}>Salvar Assinatura</Button>
                           <Button size="sm" variant="outline" onClick={() => clearSignature('cliente')}>Limpar</Button>
                         </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>

      </main>

      {/* Footer Actions */}
      <footer className="p-4 border-t bg-background sticky bottom-0 z-10 space-y-2">
          {isCompletionBlocked && workOrder.status === 'EM ANDAMENTO' && (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Finalização Bloqueada</AlertTitle>
                  <AlertDescription>
                      É necessário anexar as fotos de "Antes" e "Depois" para concluir esta Ordem de Serviço.
                  </AlertDescription>
              </Alert>
          )}
           {!isConcluded && (
            <>
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
                      <Button className="w-full" onClick={() => handleStatusChange('CONCLUIDO')} disabled={isCompletionBlocked || !workOrder.assinaturaTecnicoUrl || !workOrder.assinaturaClienteUrl}>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Finalizar Serviço
                      </Button>
                  </div>
              )}
            </>
           )}
            <Button className="w-full" onClick={handleSave}>Salvar e Fechar</Button>
      </footer>
    </div>
  );
}
