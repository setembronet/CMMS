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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock do cliente logado. Em um app real, isso viria de um contexto de autenticação.
const LOGGED_IN_CLIENT_ID = 'client-01';

const emptyAsset: Asset = {
  id: '',
  name: '',
  clientId: LOGGED_IN_CLIENT_ID,
  activeSegment: '',
  serialNumber: '',
  location: { lat: 0, lng: 0 },
};

export default function ClientAssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>(() => 
    initialAssets.filter(asset => asset.clientId === LOGGED_IN_CLIENT_ID)
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);
  const [formData, setFormData] = React.useState<Asset>(emptyAsset);
  
  const clientInfo = companies.find(c => c.id === LOGGED_IN_CLIENT_ID);
  const clientSegments = segments.filter(s => clientInfo?.activeSegments.includes(s.id));

  React.useEffect(() => {
    // Lógica inteligente para preencher o segmento automaticamente se houver apenas um.
    if (!editingAsset && clientSegments.length === 1) {
      setFormData(prev => ({...prev, activeSegment: clientSegments[0].id}));
    }
  }, [isDialogOpen, editingAsset, clientSegments]);


  const getSegmentName = (segmentId: string) => segments.find(s => s.id === segmentId)?.name || 'N/A';

  const openDialog = (asset: Asset | null = null) => {
    setEditingAsset(asset);
    setFormData(asset || {...emptyAsset, id: `asset-${Date.now()}`});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAsset(null);
    setFormData(emptyAsset);
    setIsDialogOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Asset, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAsset) {
        setAssets(assets.map(asset => asset.id === formData.id ? formData : asset));
    } else {
        setAssets([formData, ...assets]);
    }
    console.log('Saving asset:', formData);
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Meus Ativos</h1>
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
              <TableHead>Nº de Série</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{getSegmentName(asset.activeSegment)}</TableCell>
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
                  <Label htmlFor="name">Nome / Modelo do Ativo</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="serialNumber">Número de Série / Identificação</Label>
                  <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required />
              </div>

              {clientSegments.length > 1 ? (
                <div className="space-y-2">
                  <Label htmlFor="activeSegment">Segmento</Label>
                  <Select name="activeSegment" value={formData.activeSegment} onValueChange={(value) => handleSelectChange('activeSegment', value)} required>
                      <SelectTrigger><SelectValue placeholder="Selecione um segmento" /></SelectTrigger>
                      <SelectContent>
                          {clientSegments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
              ) : (
                 <div className="space-y-2">
                    <Label>Segmento</Label>
                    <Input value={clientSegments[0]?.name || 'Nenhum segmento configurado'} disabled />
                 </div>
              )}
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
