
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { products as initialProducts, setProducts, suppliers } from '@/lib/data';
import type { Product, Supplier } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const emptyProduct: Product = {
  id: '',
  name: '',
  sku: '',
  manufacturer: '',
  manageStock: true,
  stock: 0,
  stockMin: 0,
  price: 0,
  supplierId: '',
};

export default function ProductsPage() {
  const { t } = useI18n();
  const [products, setLocalProducts] = React.useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [formData, setFormData] = React.useState<Product>(emptyProduct);
  
  const [partsSuppliers, setPartsSuppliers] = React.useState<Supplier[]>([]);

  React.useEffect(() => {
    setLocalProducts(initialProducts);
    setPartsSuppliers(suppliers.filter(s => s.categories.includes('PEÇAS')));
  }, []);

  const openDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setFormData(product ? { ...product } : emptyProduct);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(false);
    setFormData(emptyProduct);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSwitchChange = (name: keyof Product, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSelectChange = (name: keyof Product, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => (p.id === editingProduct.id ? formData : p));
    } else {
      const newProduct: Product = {
        ...formData,
        id: `prod-${Date.now()}`,
      };
      updatedProducts = [newProduct, ...products];
    }
    
    setProducts(updatedProducts);
    setLocalProducts(updatedProducts);
    closeDialog();
  };
  
  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return 'N/A';
    return suppliers.find(s => s.id === supplierId)?.name || 'N/A';
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('products.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('products.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('products.table.name')}</TableHead>
              <TableHead>{t('products.table.sku')}</TableHead>
              <TableHead>{t('products.table.supplier')}</TableHead>
              <TableHead>{t('products.table.stock')}</TableHead>
              <TableHead>{t('products.table.price')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => {
                const isLowStock = product.manageStock && product.stock <= product.stockMin;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{getSupplierName(product.supplierId)}</TableCell>
                    <TableCell className={cn(isLowStock && "text-destructive")}>
                        {product.manageStock ? (
                            <div className="flex items-center gap-2">
                               {isLowStock && <AlertTriangle className="h-4 w-4" />}
                               {product.stock}
                            </div>
                        ) : (
                            <span className="text-muted-foreground">{t('products.notManaged')}</span>
                        )}
                    </TableCell>
                    <TableCell>{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('common.openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(product)}>
                            {t('common.edit')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? t('products.dialog.editTitle') : t('products.dialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {editingProduct ? t('products.dialog.editDescription') : t('products.dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} id="product-form" className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="name">{t('products.dialog.name')}</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sku">{t('products.dialog.sku')}</Label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="price">{t('products.dialog.price')}</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="manufacturer">{t('products.dialog.manufacturer')}</Label>
                  <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="supplierId">{t('products.dialog.supplier')}</Label>
                   <Select name="supplierId" value={formData.supplierId} onValueChange={(value) => handleSelectChange('supplierId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.dialog.supplierPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {partsSuppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                      <Label htmlFor="manageStock">{t('products.dialog.manageStock')}</Label>
                      <p className="text-xs text-muted-foreground">{t('products.dialog.manageStockDescription')}</p>
                  </div>
                  <Switch id="manageStock" checked={formData.manageStock} onCheckedChange={(checked) => handleSwitchChange('manageStock', checked)} />
                </div>

                {formData.manageStock && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="stock">{t('products.dialog.stock')}</Label>
                        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required={formData.manageStock} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stockMin">{t('products.dialog.stockMin')}</Label>
                        <Input id="stockMin" name="stockMin" type="number" value={formData.stockMin} onChange={handleInputChange} required={formData.manageStock} />
                    </div>
                  </div>
                )}
              </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button type="submit" form="product-form">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

  