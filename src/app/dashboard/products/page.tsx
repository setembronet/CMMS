
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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { products as initialProducts, setProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

const emptyProduct: Product = {
  id: '',
  name: '',
  sku: '',
  manufacturer: '',
  stock: 0,
};

export default function ProductsPage() {
  const [products, setLocalProducts] = React.useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [formData, setFormData] = React.useState<Product>(emptyProduct);

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
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Cadastro de Peças</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Peça
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Peça</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.manufacturer}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(product)}>
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Peça' : 'Nova Peça'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Atualize os detalhes da peça.' : 'Preencha os detalhes da nova peça.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} id="product-form" className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Nome da Peça</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Código)</Label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="stock">Estoque</Label>
                    <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante</Label>
                  <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
              </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="product-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
