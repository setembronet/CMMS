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
import { assets as initialAssets, companies, segments } from '@/lib/data';
import type { Asset } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';

const emptyAsset: Asset = {
  id: '',
  name: '',
  clientId: '',
  activeSegment: '',
  serialNumber: '',
  location: { lat: 0, lng: 0 },
};

export default function AssetsPage() {
  const { t } = useI18n();
  const [assets, setAssets] = React.useState<Asset[]>(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);
  const [formData, setFormData] = React.useState<Asset>(emptyAsset);
  
  // NOTE: This is a placeholder for a real client filter based on logged-in user
  // For now, we'll just show all assets, but the structure is ready.
  const clientAssets = assets;

  const getCompanyName = (clientId: string) => companies.find(c => c.id === clientId)?.name || 'N/A';
  const getSegmentName = (segmentId: string) => segments.find(s => s.id === segmentId)?.name || 'N/A';

  const openDialog = (asset: Asset | null = null) => {
    setEditingAsset(asset);
    setFormData(asset || emptyAsset);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAsset(null);
    setIsDialogOpen(false);
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for saving will be added here
    console.log('Saving asset:', formData);
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.assets')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Ativo
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Ativo</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Nº de Série</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{getSegmentName(asset.activeSegment)}</TableCell>
                <TableCell>{getCompanyName(asset.clientId)}</TableCell>
                <TableCell>{asset.serialNumber}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(asset)}>
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
            <DialogTitle>{editingAsset ? 'Editar Ativo' : 'Novo Ativo'}</DialogTitle>
            <DialogDescription>
              Preencha as informações do ativo.
            </DialogDescription>
          </DialogHeader>
          <form id="asset-form" onSubmit={handleSave} className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Nome do Ativo</Label>
                  <Input id="name" name="name" value={formData.name} required />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Série</Label>
                  <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} required />
              </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="asset-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
