
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
import { Button } from '@/components/ui/button';
import { 
  products as allProducts, 
  suppliers,
  purchaseOrders as initialPurchaseOrders,
  setPurchaseOrders,
} from '@/lib/data';
import type { Product, PurchaseOrder } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedItem extends Product {
  suggestedQuantity: number;
}

export default function PurchaseSuggestionPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [suggestedItems, setSuggestedItems] = React.useState<SuggestedItem[]>([]);

  React.useEffect(() => {
    const suggestions = allProducts
      .filter(p => p.manageStock && p.stock <= p.stockMin)
      .map(p => ({
        ...p,
        // Simple suggestion logic: replenish to minimum stock + 50% of min stock, or at least 5 units
        suggestedQuantity: Math.max(5, Math.ceil((p.stockMin - p.stock) + (p.stockMin * 0.5))),
      }));
    setSuggestedItems(suggestions);
  }, []);

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return 'N/A';
    return suppliers.find(s => s.id === supplierId)?.name || 'N/A';
  };

  const handleCreatePO = (item: SuggestedItem) => {
    if (!item.supplierId) {
      toast({
        variant: 'destructive',
        title: t('purchaseSuggestion.noSupplierTitle'),
        description: t('purchaseSuggestion.noSupplierDescription', { itemName: item.name }),
      });
      return;
    }

    const newPO: PurchaseOrder = {
      id: `oc-${Date.now()}`,
      supplierId: item.supplierId,
      status: 'Pendente',
      creationDate: new Date().getTime(),
      items: [
        {
          productId: item.id,
          quantity: item.suggestedQuantity,
          unitPrice: item.price,
        },
      ],
      totalValue: item.price * item.suggestedQuantity,
    };

    const updatedPOs = [newPO, ...initialPurchaseOrders];
    setPurchaseOrders(updatedPOs);

    toast({
      title: t('purchaseSuggestion.poCreatedTitle'),
      description: t('purchaseSuggestion.poCreatedDescription', { poId: newPO.id, supplierName: getSupplierName(newPO.supplierId) }),
    });

    // Remove the item from the suggestion list after creating the PO
    setSuggestedItems(prev => prev.filter(p => p.id !== item.id));
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('purchaseSuggestion.title')}</h1>
      </div>

       {suggestedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">{t('purchaseSuggestion.allGoodTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('purchaseSuggestion.allGoodDescription')}</p>
        </div>
      ) : (
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('purchaseSuggestion.table.item')}</TableHead>
                <TableHead>{t('purchaseSuggestion.table.supplier')}</TableHead>
                <TableHead>{t('purchaseSuggestion.table.stock')}</TableHead>
                <TableHead>{t('purchaseSuggestion.table.minStock')}</TableHead>
                <TableHead>{t('purchaseSuggestion.table.suggestedQty')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestedItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{getSupplierName(item.supplierId)}</TableCell>
                  <TableCell className={cn("text-destructive font-bold")}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {item.stock}
                    </div>
                  </TableCell>
                  <TableCell>{item.stockMin}</TableCell>
                  <TableCell>{item.suggestedQuantity}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleCreatePO(item)} size="sm">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t('purchaseSuggestion.createPO')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
