
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
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { PackageSearch, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import type { WorkOrder, Product } from '@/lib/types';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { useCollection } from '@/firebase/firestore';
import { subMonths, differenceInMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ConsumedPartData = {
  product: Product;
  totalValue: number;
  totalQuantity: number;
  avgMonthlyConsumption: number;
  atRisk: boolean;
};

export default function StockConsumptionReportPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();

  const { data: workOrders, loading: workOrdersLoading } = useCollection<WorkOrder>('workOrders');
  const { data: products, loading: productsLoading } = useCollection<Product>('products');
  
  const [reportData, setReportData] = React.useState<ConsumedPartData[]>([]);

  const isLoading = workOrdersLoading || productsLoading;

  React.useEffect(() => {
    if (isLoading || !selectedClient) return;

    const sixMonthsAgo = subMonths(new Date(), 6).getTime();

    const clientWorkOrders = workOrders.filter(
      (wo) =>
        wo.clientId === selectedClient.id &&
        wo.status === 'CONCLUIDO' &&
        wo.endDate &&
        wo.endDate >= sixMonthsAgo
    );

    const consumption: { [productId: string]: { quantity: number; value: number } } = {};

    clientWorkOrders.forEach((wo) => {
        (wo.partsUsed || []).forEach(part => {
            const product = products.find(p => p.id === part.productId);
            if(product) {
                if (!consumption[part.productId]) {
                    consumption[part.productId] = { quantity: 0, value: 0 };
                }
                consumption[part.productId].quantity += part.quantity;
                consumption[part.productId].value += part.quantity * product.price;
            }
        });
    });

    const topFiveConsumed = Object.entries(consumption)
      .sort(([, a], [, b]) => b.value - a.value)
      .slice(0, 5)
      .map(([productId, data]) => {
          const product = products.find(p => p.id === productId);
          if(!product) return null;

          const avgMonthlyConsumption = data.quantity / 6;
          const atRisk = product.stock < avgMonthlyConsumption * 1.5;

          return {
              product,
              totalValue: data.value,
              totalQuantity: data.quantity,
              avgMonthlyConsumption,
              atRisk
          };
      })
      .filter((item): item is ConsumedPartData => item !== null);
      
    setReportData(topFiveConsumed);

  }, [isLoading, selectedClient, workOrders, products]);
  
  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('users.selectClientPrompt')}</p>
        </div>
    )
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Relatório de Consumo de Estoque</h1>
         <Badge>Últimos 6 Meses</Badge>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Top 5 Peças Mais Consumidas por Valor</CardTitle>
          <CardDescription>
            Análise das peças de maior impacto financeiro no consumo para otimização de compras e estoque.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {reportData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                         <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Peça</TableHead>
                                <TableHead>Custo Total</TableHead>
                                <TableHead>Estoque</TableHead>
                                <TableHead>Consumo Médio</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {reportData.map((item) => (
                                <TableRow key={item.product.id}>
                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                <TableCell className="font-mono">R$ {item.totalValue.toFixed(2)}</TableCell>
                                <TableCell>{item.product.stock}</TableCell>
                                <TableCell>{item.avgMonthlyConsumption.toFixed(1)}/mês</TableCell>
                                <TableCell>
                                    {item.atRisk ? (
                                        <Badge variant="destructive" className="gap-1.5">
                                            <AlertTriangle className="h-3 w-3" />
                                            Risco de Falta
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="gap-1.5 text-green-600 border-green-600">
                                            <CheckCircle className="h-3 w-3" />
                                            OK
                                        </Badge>
                                    )}
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reportData.map(d => ({ name: d.product.name, 'Consumo Médio Mensal': d.avgMonthlyConsumption, 'Estoque Atual': d.product.stock }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={false} />
                                <YAxis />
                                <Tooltip formatter={(value) => (value as number).toFixed(1)} />
                                <Legend />
                                <Bar dataKey="Consumo Médio Mensal" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Estoque Atual" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
                    <PackageSearch className="h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">Sem dados de consumo</h2>
                    <p className="mt-2 text-muted-foreground">Não há ordens de serviço concluídas com uso de peças nos últimos 6 meses.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
