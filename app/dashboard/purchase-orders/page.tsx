
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
import { PlusCircle, MoreHorizontal, Trash2, FileOutput } from 'lucide-react';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus, Supplier, Product, AccountsPayable } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/hooks/use-i18n';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument, updateDocument } from '@/firebase/firestore';

const poStatuses: PurchaseOrderStatus[] = ['Pendente', 'Aprovada', 'Recebida', 'Cancelada'];

export default function PurchaseOrdersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const { data: purchaseOrders, loading: poLoading } = useCollection<PurchaseOrder>('purchaseOrders');
  const { data: allSuppliers, loading: suppliersLoading } = useCollection<Supplier>('suppliers');
  const { data: allProducts, loading: productsLoading } = useCollection<Product>('products');

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = React.useState<PurchaseOrder | null>(null);

  const [partsSuppliers, setPartsSuppliers] = React.useState<Supplier[]>([]);
  const [availableProducts, setAvailableProducts] = React.useState<Product[]>([]);

  const emptyPO: Omit<PurchaseOrder, 'id'> = {
    supplierId: '',
    status: 'Pendente',
    creationDate: new Date().getTime(),
    items: [],
    totalValue: 0,
  };

  React.useEffect(() => {
    if (!suppliersLoading) {
        setPartsSuppliers(allSuppliers.filter(s => s.categories.includes('PEÇAS')));
    }
  }, [allSuppliers, suppliersLoading]);
  
  React.useEffect(() => {
    if(formData?.supplierId && !productsLoading) {
        setAvailableProducts(allProducts.filter(p => p.supplierId === formData.supplierId));
    } else {
        setAvailableProducts([]);
    }
  }, [formData?.supplierId, allProducts, productsLoading]);

  const getSupplierName = (id: string) => allSuppliers.find(s => s.id === id)?.name || 'N/A';

  const openDialog = (po: PurchaseOrder | null = null) => {
    setEditingOrder(po);
    const poData = po ? JSON.parse(JSON.stringify(po)) : { ...emptyPO };
    setFormData(poData as PurchaseOrder);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingOrder(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleSelectChange = (name: keyof PurchaseOrder, value: string) => {
    if (!formData) return;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };
  
  const addItem = () => {
    if(!formData) return;
    const newItem: PurchaseOrderItem = { productId: '', quantity: 1, unitPrice: 0 };
    setFormData(prev => prev ? {...prev, items: [...prev.items, newItem]} : null);
  };

  const removeItem = (index: number) => {
    if(!formData) return;
    setFormData(prev => prev ? {...prev, items: prev.items.filter((_, i) => i !== index)} : null);
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    if(!formData) return;
    const newItems = [...formData.items];
    const item = newItems[index];

    if (field === 'productId') {
        const product = allProducts.find(p => p.id === value);
        item.productId = value as string;
        item.unitPrice = product?.price || 0;
    } else if (field === 'quantity') {
        item.quantity = Number(value) >= 1 ? Number(value) : 1;
    }

    const totalValue = newItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
    setFormData(prev => prev ? {...prev, items: newItems, totalValue} : null);
  };

  const handleSaveOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !firestore) return;

    try {
        // Logic to update stock on receiving goods
        if (editingOrder && editingOrder.status !== 'Recebida' && formData.status === 'Recebida') {
            for (const item of formData.items) {
                const product = allProducts.find(p => p.id === item.productId);
                if (product && product.manageStock) {
                    const newStock = product.stock + item.quantity;
                    await updateDocument(firestore, 'products', product.id, { stock: newStock });
                }
            }
             toast({
                title: "Estoque Atualizado!",
                description: "O estoque das peças recebidas foi atualizado com sucesso.",
            });
        }
        
        const { id, ...poData } = formData;

        if (editingOrder) {
            await updateDocument(firestore, 'purchaseOrders', id, poData);
        } else {
            await addDocument(firestore, 'purchaseOrders', poData);
        }

        toast({
            title: "Ordem de Compra Salva!",
            description: `A OC para ${getSupplierName(formData.supplierId)} foi salva.`,
        });

        closeDialog();
    } catch (error) {
        console.error("Erro ao salvar ordem de compra: ", error);
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar a ordem de compra.' });
    }
  };
  
  const handleLaunchAP = async () => {
    if (!formData || !firestore) return;
    
    const supplier = allSuppliers.find(s => s.id === formData.supplierId);
    
    const newAP: Omit<AccountsPayable, 'id'> = {
        description: `Fatura referente à OC #${formData.id.slice(-6)}`,
        supplierOrCreditor: supplier?.name || 'Fornecedor Desconhecido',
        dueDate: new Date().getTime(),
        value: formData.totalValue,
        status: 'Pendente',
        costCenterId: 'cc-03', // Compras
        chartOfAccountId: 'coa-9', // Fornecedores
        isRecurring: false,
        recurrenceFrequency: 'MENSAL',
        recurrenceInstallments: 1
    };

    try {
        await addDocument(firestore, 'accountsPayable', newAP);
        toast({
            title: "Conta a Pagar Lançada!",
            description: `A fatura para a OC #${formData.id.slice(-6)} foi pré-lançada. Redirecionando...`,
        });
        closeDialog();
        router.push('/dashboard/cmms/accounts-payable');
    } catch (error) {
         console.error("Erro ao lançar conta a pagar: ", error);
         toast({ variant: 'destructive', title: 'Erro ao Lançar', description: 'Não foi possível criar a conta a pagar.' });
    }
  };

  const getStatusBadgeVariant = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'Pendente': return 'secondary';
      case 'Aprovada': return 'default';
      case 'Recebida': return 'outline';
      case 'Cancelada': return 'destructive';
      default: return 'secondary';
    }
  };

  const isLoading = poLoading || suppliersLoading || productsLoading;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('purchaseOrders.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('purchaseOrders.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('purchaseOrders.table.id')}</TableHead>
              <TableHead>{t('purchaseOrders.table.supplier')}</TableHead>
              <TableHead>{t('purchaseOrders.table.creationDate')}</TableHead>
              <TableHead>{t('purchaseOrders.table.totalValue')}</TableHead>
              <TableHead>{t('purchaseOrders.table.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Carregando ordens de compra...</TableCell>
                </TableRow>
            ) : purchaseOrders.map(po => (
              <TableRow key={po.id}>
                <TableCell className="font-mono">{po.id.slice(-6)}</TableCell>
                <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                <TableCell>{format(new Date(po.creationDate), 'dd/MM/yyyy')}</TableCell>
                <TableCell>R$ {po.totalValue.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(po.status)}>{t(`purchaseOrders.statusLabels.${po.status}`)}</Badge>
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
                      <DropdownMenuItem onClick={() => openDialog(po)}>
                        {t('common.edit')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {purchaseOrders.length === 0 && !isLoading && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Nenhuma Ordem de Compra encontrada.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingOrder ? t('purchaseOrders.dialog.editTitle') : t('purchaseOrders.dialog.newTitle')}</DialogTitle>
            <DialogDescription>{t('purchaseOrders.dialog.description')}</DialogDescription>
          </DialogHeader>
          {formData && (
            <>
              <form id="po-form" onSubmit={handleSaveOrder}>
                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                  <div className="space-y-4 py-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="supplierId">{t('purchaseOrders.dialog.supplier')}</Label>
                          <Select name="supplierId" value={formData.supplierId} onValueChange={(v) => handleSelectChange('supplierId', v)} required>
                              <SelectTrigger><SelectValue placeholder={t('purchaseOrders.dialog.supplierPlaceholder')} /></SelectTrigger>
                              <SelectContent>
                                  {partsSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="status">{t('purchaseOrders.dialog.status')}</Label>
                          <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v as PurchaseOrderStatus)} required>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  {poStatuses.map(s => <SelectItem key={s} value={s}>{t(`purchaseOrders.statusLabels.${s}`)}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <h3 className="font-medium">{t('purchaseOrders.dialog.items')}</h3>
                          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={!formData.supplierId}>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              {t('purchaseOrders.dialog.addItem')}
                          </Button>
                      </div>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50%]">{t('purchaseOrders.dialog.item')}</TableHead>
                              <TableHead>{t('purchaseOrders.dialog.quantity')}</TableHead>
                              <TableHead>{t('purchaseOrders.dialog.unitPrice')}</TableHead>
                              <TableHead>{t('purchaseOrders.dialog.total')}</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formData.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Select value={item.productId} onValueChange={(v) => handleItemChange(index, 'productId', v)}>
                                    <SelectTrigger><SelectValue placeholder={t('purchaseOrders.dialog.itemPlaceholder')} /></SelectTrigger>
                                    <SelectContent>
                                      {availableProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                                </TableCell>
                                <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell>R$ {(item.unitPrice * item.quantity).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {formData.items.length === 0 && (
                              <TableRow>
                                  <TableCell colSpan={5} className="text-center h-24">{t('purchaseOrders.dialog.noItems')}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                       <div className="text-right font-bold text-lg">
                          {t('purchaseOrders.dialog.totalOrderValue')}: R$ {formData.totalValue.toFixed(2)}
                       </div>
                    </div>
                  </div>
                </ScrollArea>
              </form>
            </>
          )}
          <DialogFooter className="sm:justify-between">
            <div>
              {formData?.status === 'Recebida' && (
                <Button variant="secondary" onClick={handleLaunchAP}>
                  <FileOutput className="mr-2 h-4 w-4" />
                  {t('purchaseOrders.dialog.launchAP')}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
              <Button type="submit" form="po-form">{t('common.save')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
