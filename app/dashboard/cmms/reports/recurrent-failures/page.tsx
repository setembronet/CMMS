
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
import { TrendingDown, Wrench, Loader2 } from 'lucide-react';
import type { WorkOrder, Asset, User, Product } from '@/lib/types';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { useCollection } from '@/firebase/firestore';
import { subDays, differenceInHours } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type AssetFailureData = {
  asset: Asset;
  failureCount: number;
  totalCost: number;
};

export default function RecurrentFailuresReportPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();

  const { data: workOrders, loading: workOrdersLoading } = useCollection<WorkOrder>('workOrders');
  const { data: assets, loading: assetsLoading } = useCollection<Asset>('assets');
  const { data: users, loading: usersLoading } = useCollection<User>('users');
  const { data: products, loading: productsLoading } = useCollection<Product>('products');
  
  const [topTenFailures, setTopTenFailures] = React.useState<AssetFailureData[]>([]);

  const isLoading = workOrdersLoading || assetsLoading || usersLoading || productsLoading;

  React.useEffect(() => {
    if (isLoading || !selectedClient) return;

    const ninetyDaysAgo = subDays(new Date(), 90).getTime();

    const clientAssets = assets.filter(a => a.clientId === selectedClient.id);
    const clientAssetIds = clientAssets.map(a => a.id);

    const correctiveWos = workOrders.filter(
      (wo) =>
        clientAssetIds.includes(wo.assetId) &&
        wo.creationDate >= ninetyDaysAgo &&
        !wo.isPreventive
    );

    const failuresByAsset: { [assetId: string]: { count: number; cost: number } } = {};

    correctiveWos.forEach((wo) => {
      if (!failuresByAsset[wo.assetId]) {
        failuresByAsset[wo.assetId] = { count: 0, cost: 0 };
      }
      failuresByAsset[wo.assetId].count++;

      // Calculate parts cost
      const partsCost = (wo.partsUsed || []).reduce((acc, part) => {
        const product = products.find(p => p.id === part.productId);
        return acc + (product ? product.price * part.quantity : 0);
      }, 0);

      // Calculate labor cost
      let laborCost = 0;
      if (wo.startDate && wo.endDate && wo.responsibleId) {
        const technician = users.find(u => u.id === wo.responsibleId);
        if (technician?.costPerHour) {
          const hours = differenceInHours(new Date(wo.endDate), new Date(wo.startDate));
          laborCost = hours * technician.costPerHour;
        }
      }
      
      failuresByAsset[wo.assetId].cost += partsCost + laborCost;
    });

    const rankedAssets = Object.entries(failuresByAsset)
      .map(([assetId, data]) => {
        const asset = clientAssets.find(a => a.id === assetId);
        return asset ? { asset, failureCount: data.count, totalCost: data.cost } : null;
      })
      .filter((item): item is AssetFailureData => item !== null)
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 10);
      
    setTopTenFailures(rankedAssets);

  }, [isLoading, selectedClient, workOrders, assets, users, products]);
  
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
        <h1 className="text-3xl font-bold font-headline">Relatório de Falhas Recorrentes</h1>
         <Badge>Últimos 90 Dias</Badge>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Top 10 Ativos com Mais Falhas</CardTitle>
          <CardDescription>
            Ativos que mais apresentaram ordens de serviço corretivas, indicando necessidade de atenção.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {topTenFailures.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                         <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rank</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead>Nº de Falhas</TableHead>
                                <TableHead className="text-right">Custo Total</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {topTenFailures.map((item, index) => (
                                <TableRow key={item.asset.id}>
                                <TableCell className="font-bold text-lg text-muted-foreground">{index + 1}</TableCell>
                                <TableCell>{item.asset.name}</TableCell>
                                <TableCell>
                                    <Badge variant="destructive" className="gap-1.5">
                                        <Wrench className="h-3 w-3"/>
                                        {item.failureCount}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">R$ {item.totalCost.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={topTenFailures} layout="vertical" margin={{ left: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="asset.name" type="category" hide />
                                <Tooltip
                                    formatter={(value, name) => [typeof value === 'number' ? name === 'Custo' ? `R$ ${value.toFixed(2)}` : value : value, name === 'failureCount' ? 'Nº de Falhas' : 'Custo Total']}
                                    labelFormatter={(label) => ''}
                                />
                                <Legend />
                                <Bar dataKey="failureCount" name="Nº de Falhas" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="failureCount" position="right" offset={8} className="fill-foreground" fontSize={12} />
                                </Bar>
                                <Bar dataKey="totalCost" name="Custo Total (R$)" fill="hsl(var(--primary) / 0.5)" radius={[0, 4, 4, 0]}>
                                     <LabelList dataKey="totalCost" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `R$ ${value.toFixed(0)}`} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
                    <TrendingDown className="h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-xl font-semibold">Nenhuma falha recorrente significativa</h2>
                    <p className="mt-2 text-muted-foreground">Não foram encontradas ordens de serviço corretivas nos últimos 90 dias.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
