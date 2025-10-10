'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { workOrders as initialWorkOrders, assets as allAssets, users as allUsers, products as initialProducts } from '@/lib/data';
import type { WorkOrder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const [workOrder, setWorkOrder] = React.useState<WorkOrder | null>(null);

  const orderId = params.id;

  React.useEffect(() => {
    const order = initialWorkOrders.find(wo => wo.id === orderId);
    if (order) {
      setWorkOrder(order);
    }
  }, [orderId]);

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Ordem de Serviço não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className='flex-1'>
            <h1 className="font-semibold text-lg">{workOrder.title}</h1>
            <p className="text-xs text-muted-foreground">OS #{workOrder.id}</p>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Conteúdo da Ordem de Serviço virá aqui */}
        <p>Detalhes da Ordem de Serviço serão implementados aqui.</p>
      </main>
      <footer className="p-4 border-t bg-background">
        <Button className="w-full">
            Iniciar Serviço
        </Button>
      </footer>
    </div>
  );
}
