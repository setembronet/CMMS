'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { workOrders as initialWorkOrders, assets as allAssets, users as allUsers, products as initialProducts } from '@/lib/data';
import type { WorkOrder, Asset, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, CheckSquare, Info, ListChecks, Wrench, ShieldAlert, BadgeInfo } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const [workOrder, setWorkOrder] = React.useState<WorkOrder | null>(null);
  const [asset, setAsset] = React.useState<Asset | null>(null);
  const [creator, setCreator] = React.useState<User | null>(null);

  const orderId = params.id as string;

  React.useEffect(() => {
    const order = initialWorkOrders.find(wo => wo.id === orderId);
    if (order) {
      setWorkOrder(order);
      const foundAsset = allAssets.find(a => a.id === order.assetId);
      setAsset(foundAsset || null);
      const foundCreator = allUsers.find(u => u.id === order.createdByUserId);
      setCreator(foundCreator || null);
    }
  }, [orderId]);

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


  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ordem de Serviço não encontrada.</p>
      </div>
    );
  }

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
        
        {/* Asset Info Card */}
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

        {/* Details Card */}
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
                    <p><strong>Data de Criação:</strong> {format(new Date(workOrder.creationDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                    {workOrder.scheduledDate && <p><strong>Data Agendada:</strong> {format(new Date(workOrder.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}</p>}
                </div>
            </CardContent>
        </Card>

        {/* Future sections will go here */}
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ListChecks /> Checklist de Execução</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">O checklist interativo será implementado aqui.</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Wrench /> Peças e Materiais</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">O gerenciador de peças utilizadas será implementado aqui.</p></CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldAlert /> Causa, Solução, Ação</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">O formulário de encerramento da OS será implementado aqui.</p></CardContent>
        </Card>

      </main>

      {/* Footer Actions */}
      <footer className="p-4 border-t bg-background sticky bottom-0 z-10">
        <div className="grid grid-cols-3 gap-2">
            <Button className="w-full" variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Pausar
            </Button>
            <Button className="w-full col-span-2" size="lg">
                <Play className="mr-2 h-4 w-4" />
                Iniciar Serviço
            </Button>
        </div>
      </footer>
    </div>
  );
}
