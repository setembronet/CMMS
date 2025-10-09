
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
import { assets as initialAssets, companies, segments as allSegments, customerLocations as allLocations } from '@/lib/data';
import type { Asset, Company, CompanySegment, CustomerLocation } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// --- Development Fix: Use a single client for easier debugging ---
const TEST_CLIENT_ID = 'client-01';
const testClient = companies.find(c => c.id === TEST_CLIENT_ID);

const emptyAsset: Asset = {
  id: '',
  name: '',
  clientId: TEST_CLIENT_ID, // Always default to the test client
  customerLocationId: '',
  activeSegment: '',
  serialNumber: '',
  brand: '',
  model: '',
  observation: '',
  location: { lat: 0, lng: 0 },
};
// ----------------------------------------------------------------

export default function AssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>(initialAssets.filter(a => a.clientId === TEST_CLIENT_ID));
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);
  const [formData, setFormData] = React.useState<Asset>(emptyAsset);
  const [availableSegments, setAvailableSegments] = React.useState<CompanySegment[]>([]);
  const [availableLocations, setAvailableLocations] = React.useState<CustomerLocation[]>([]);

  React.useEffect(() => {
    if (testClient) {
      const companySegments = allSegments.filter(s => testClient.activeSegments.includes(s.id));
      setAvailableSegments(companySegments);
      
      if (companySegments.length === 1) {
        handleSelectChange('activeSegment', companySegments[0].id);
      } else {
        if (!companySegments.some(s => s.id === formData.activeSegment)) {
          handleSelectChange('activeSegment', '');
        }
      }

      const clientLocations = allLocations.filter(l => l.clientId === TEST_CLIENT_ID);
      setAvailableLocations(clientLocations);
    } else {
      setAvailableSegments([]);
      setAvailableLocations([]);
      handleSelectChange('activeSegment', '');
    }
  }, [formData.activeSegment, testClient]);

  const getLocationName = (id: string) => allLocations.find(l => l.id === id)?.name || 'N/A';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      clientId: TEST_CLIENT_ID, // Ensure it's always the test client
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
              <TableHead>Cliente Final</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Nº de Série</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(asset => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{getLocationName(asset.customerLocationId)}</TableCell>
                <TableCell>{asset.brand || 'N/A'}</TableCell>
                <TableCell>{asset.model || 'N/A'}</TableCell>
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
              {editingAsset ? 'Atualize os detalhes do ativo.' : `Preencha os detalhes do novo ativo para ${testClient?.name || 'cliente de teste'}.`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <form onSubmit={handleSaveAsset} id="asset-form" className="space-y-4 py-4 px-1">
              
              <div className="space-y-2">
                <Label htmlFor="customerLocationId">Cliente Final</Label>
                <Select name="customerLocationId" value={formData.customerLocationId} onValueChange={(value) => handleSelectChange('customerLocationId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente final" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {availableSegments.length > 0 && (
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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Input id="brand" name="brand" value={formData.brand || ''} onChange={handleInputChange} placeholder="Ex: Atlas Schindler"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input id="model" name="model" value={formData.model || ''} onChange={handleInputChange} placeholder="Ex: 5500 MRL"/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Número de Série</Label>
                <Input id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observation">Observação</Label>
                <Textarea id="observation" name="observation" value={formData.observation || ''} onChange={handleInputChange} placeholder="Detalhes adicionais, histórico, etc."/>
              </div>
            </form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="asset-form" disabled={!formData.activeSegment || !formData.customerLocationId}>Salvar Ativo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
