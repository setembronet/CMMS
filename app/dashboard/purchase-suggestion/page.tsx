
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Product, PurchaseOrder, Supplier, WorkOrder } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInMonths, fromUnixTime } from 'date-fns';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument } from '@/firebase/firestore';

interface SuggestedItem extends Product {
  suggestedQuantity: number;
  avgMonthlyConsumption: number;
  stockCoverageDays: number;
}

interface SuggestionsBySupplier {
    supplier: Supplier;
    items: SuggestedItem[];
    totalValue: number;
}

export default function PurchaseSuggestionPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const { data: allProducts, loading: productsLoading } = useCollection<Product>('products');
  const { data: allSuppliers, loading: suppliersLoading } = useCollection<Supplier>('suppliers');
  const { data: allWorkOrders, loading: workOrdersLoading } = useCollection<WorkOrder>('workOrders');
  
  const [suggestionsBySupplier, setSuggestionsBySupplier] = React.useState<SuggestionsBySupplier[]>([]);

  React.useEffect(() => {
    if(productsLoading || workOrdersLoading || suppliersLoading) return;

    // 1. Calculate historical consumption
    const completedWOs = allWorkOrders.filter(wo => wo.status === 'CONCLUIDO' && wo.endDate);
    if (completedWOs.length === 0) {
        setSuggestionsBySupplier([]);
        return;
    };

    const firstDate = Math.min(...completedWOs.map(wo => wo.endDate || 0).filter(Boolean));
    const lastDate = Math.max(...completedWOs.map(wo => wo.endDate || 0).filter(Boolean));
    const monthsDiff = firstDate && lastDate ? differenceInMonths(fromUnixTime(lastDate / 1000), fromUnixTime(firstDate / 1000)) + 1 : 1;
    const historyMonths = Math.max(1, monthsDiff);

    const consumption: { [productId: string]: number } = {};
    completedWOs.forEach(wo => {
        (wo.partsUsed || []).forEach(part => {
            consumption[part.productId] = (consumption[part.productId] || 0) + part.quantity;
        });
    });

    // 2. Generate suggestions
    const suggestedItems = allProducts
      .filter(p => p.manageStock && p.stock <= p.stockMin)
      .map(p => {
        const totalConsumed = consumption[p.id] || 0;
        const avgMonthlyConsumption = totalConsumed / historyMonths;
        const stockCoverageDays = avgMonthlyConsumption > 0 ? (p.stock / avgMonthlyConsumption) * 30 : Infinity;
        const suggestedQuantity = Math.max(p.stockMin - p.stock, Math.ceil((avgMonthlyConsumption * 3) - p.stock));
        
        return {
          ...p,
          suggestedQuantity: Math.max(0, suggestedQuantity), 
          avgMonthlyConsumption,
          stockCoverageDays,
        };
      })
      .filter(p => p.suggestedQuantity > 0);

    // 3. Group by supplier
    const grouped: { [supplierId: string]: SuggestionsBySupplier } = {};
    suggestedItems.forEach(item => {
      const supplierId = item.supplierId || 'unknown';
      const supplier = allSuppliers.find(s => s.id === supplierId) || { id: 'unknown', name: 'Fornecedor não definido', cnpj: '', categories: [] };
      if (!grouped[supplierId]) {
        grouped[supplierId] = { supplier, items: [], totalValue: 0 };
      }
      grouped[supplierId].items.push(item);
      grouped[supplierId].totalValue += item.price * item.suggestedQuantity;
    });

    setSuggestionsBySupplier(Object.values(grouped));

  }, [allProducts, allWorkOrders, allSuppliers, productsLoading, workOrdersLoading, suppliersLoading]);

  const handleCreatePO = async (supplierGroup: SuggestionsBySupplier) => {
    if (!firestore) return;
    if (!supplierGroup.supplier || supplierGroup.supplier.id === 'unknown') {
      toast({
        variant: 'destructive',
        title: t('purchaseSuggestion.noSupplierTitle'),
        description: t('purchaseSuggestion.noSupplierDescriptionBatch'),
      });
      return;
    }

    const newPO: Omit<PurchaseOrder, 'id'> = {
      supplierId: supplierGroup.supplier.id,
      status: 'Pendente',
      creationDate: new Date().getTime(),
      items: supplierGroup.items.map(item => ({
        productId: item.id,
        quantity: item.suggestedQuantity,
        unitPrice: item.price,
      })),
      totalValue: supplierGroup.totalValue,
    };
    
    try {
        await addDocument(firestore, 'purchaseOrders', newPO);
        toast({
          title: t('purchaseSuggestion.poCreatedTitle'),
          description: t('purchaseSuggestion.poCreatedDescription', { poId: 'nova', supplierName: supplierGroup.supplier.name }),
          action: (
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/purchase-orders')}>
                Ver OCs
            </Button>
          ),
        });
        setSuggestionsBySupplier(prev => prev.filter(group => group.supplier.id !== supplierGroup.supplier.id));
    } catch(err) {
        toast({
            variant: "destructive",
            title: "Erro ao criar Ordem de Compra",
            description: "Não foi possível salvar a nova OC. Tente novamente.",
        });
    }
  };
  
  const isLoading = productsLoading || suppliersLoading || workOrdersLoading;


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('purchaseSuggestion.title')}</h1>
      </div>
      <p className="text-muted-foreground">{t('purchaseSuggestion.description')}</p>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : suggestionsBySupplier.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">{t('purchaseSuggestion.allGoodTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('purchaseSuggestion.allGoodDescription')}</p>
        </div>
      ) : (
        <div className="space-y-6">
            {suggestionsBySupplier.map(group => (
                <div key={group.supplier.id} className="rounded-lg border shadow-sm">
                    <div className="p-4 bg-muted/50 flex justify-between items-center rounded-t-lg">
                        <h2 className="font-bold text-lg">{group.supplier.name}</h2>
                        <Button onClick={() => handleCreatePO(group)} size="sm" disabled={group.supplier.id === 'unknown'}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {t('purchaseSuggestion.createPOForSupplier')} (R$ {group.totalValue.toFixed(2)})
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-2/5">{t('purchaseSuggestion.table.item')}</TableHead>
                            <TableHead>{t('purchaseSuggestion.table.stockInfo')}</TableHead>
                            <TableHead>{t('purchaseSuggestion.table.consumption')}</TableHead>
                            <TableHead>{t('purchaseSuggestion.table.coverage')}</TableHead>
                            <TableHead className="text-right">{t('purchaseSuggestion.table.suggestedQty')}</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {group.items.map(item => (
                            <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                                <div className={cn("flex items-center gap-1.5", item.stock <= item.stockMin && "text-destructive font-semibold")}>
                                    {item.stock <= item.stockMin && <AlertTriangle className="h-4 w-4" />}
                                    {item.stock} / {item.stockMin}
                                </div>
                            </TableCell>
                            <TableCell>{item.avgMonthlyConsumption.toFixed(2)}/mês</TableCell>
                            <TableCell>
                                {isFinite(item.stockCoverageDays) ? `~${Math.floor(item.stockCoverageDays)} dias` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right font-bold">{item.suggestedQuantity}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
