
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { assets as initialAssets, companies, segments as allSegments } from '@/lib/data';
import type { Asset, Company, CompanySegment } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const emptyAsset: Asset = {
  id: '',
  name: '',
  clientId: '',
  activeSegment: '',
  serialNumber: '',
  location: { lat: 0, lng: 0 },
};

export default function AssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>(initialAssets);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);
  const [formData, setFormData] = React.useState<Asset>(emptyAsset);
  const [availableSegments, setAvailableSegments] = React.useState<CompanySegment[]>([]);

  React.useEffect(() => {
    if (formData.clientId) {
      const company = companies.find(c => c.id === formData.clientId);
      if (company && company.activeSegments.length > 0) {
        const companySegments = allSegments.filter(s => company.activeSegments.includes(s.id));
        setAvailableSegments(companySegments);
        
        // If only one segment is available, auto-select it.
        if (companySegments.length === 1) {
          handleSelectChange('activeSegment', companySegments[0].id);
        } else {
           // If the current segment is not in the new list, clear it
          if (!companySegments.some(s => s.id === formData.activeSegment)) {
            handleSelectChange('activeSegment', '');
          }
        }
      } else {
        setAvailableSegments([]);
        handleSelectChange('activeSegment', '');
      }
    } else {
      setAvailableSegments([]);
      handleSelectChange('activeSegment', '');
    }
  }, [formData.clientId]);

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'N/A';
  const getSegmentName = (id: string) => allSegments.find(s => s.id === id)?.name || 'N/A';

  const openDialog = (asset: Asset | null = null) => {
    setEditingAsset(asset);
    const assetData = asset ? { ...asset } : emptyAsset;
    setFormData(assetData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAsset(null);
    setIsDialogOpen(false);
    setFormData(emptyAsset);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Asset, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newAsset: Asset = {
      ...formData,
      id: editingAsset?.id || `asset-0${assets.length + 1}`,
    };

    if (editingAsset) {
      setAssets(assets.map(a => a.id === newAsset.id ? newAsset : a));
    } else {
      setAssets([newAsset, ...assets]);
    }
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gestão de Ativos</h1>
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
              <TableHead>Cliente</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Nº de Série</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(asset => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{getCompanyName(asset.clientId)}</TableCell>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Editar Ativo' : 'Novo Ativo'}</DialogTitle>
            <DialogDescription>
              {editingAsset ? 'Atualize os detalhes do ativo.' : 'Preencha os detalhes do novo ativo.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <form onSubmit={handleSaveAsset} id="asset-form" className="space-y-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select name="clientId" value={formData.clientId} onValueChange={(value) => handleSelectChange('clientId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.filter(c => c.status === 'active').map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {formData.clientId && (
                <>
                   {availableSegments.length > 1 ? (
                    <div className="space-y-2">
                      <Label htmlFor="activeSegment">Segmento do Ativo</Label>
                      <Select name="activeSegment" value={formData.activeSegment} onValueChange={(value) => handleSelectChange('activeSegment', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o segmento" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSegments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                     <div className="space-y-2">
                        <Label>Segmento do Ativo</Label>
                        <Input value={availableSegments[0]?.name || 'O cliente não possui segmentos ativos'} disabled />
                     </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Ativo</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: Elevador Social Bloco B"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Número de Série</Label>
                <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required />
              </div>
            </form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="asset-form" disabled={!formData.activeSegment}>Salvar Ativo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
