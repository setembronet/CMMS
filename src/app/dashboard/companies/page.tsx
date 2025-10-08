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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { companies as initialCompanies } from '@/lib/data';
import type { Company } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialSegments = ['ELEVADOR', 'ESCADA_ROLANTE'];

export default function CompaniesPage() {
  const [companies, setCompanies] = React.useState<Company[]>(initialCompanies);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);
  const [segments, setSegments] = React.useState<string[]>(initialSegments);
  const [newSegment, setNewSegment] = React.useState('');


  const openDialog = (company: Company | null = null) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingCompany(null);
    setIsDialogOpen(false);
    setNewSegment('');
  };

  const handleAddNewSegment = () => {
    if (newSegment && !segments.includes(newSegment.toUpperCase().replace(/\s/g, '_'))) {
      setSegments([...segments, newSegment.toUpperCase().replace(/\s/g, '_')]);
      setNewSegment('');
    }
  };

  const handleSaveCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCompany: Company = {
      id: editingCompany?.id || `client-0${companies.length + 1}`,
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      email: formData.get('email') as string,
      status: editingCompany?.status || 'active',
      activeSegment: formData.get('segment') as string,
      assetLimit: parseInt(formData.get('assetLimit') as string),
      phone: formData.get('phone') as string,
      address: {
        street: formData.get('street') as string,
        number: formData.get('number') as string,
        complement: formData.get('complement') as string,
        neighborhood: formData.get('neighborhood') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string,
      }
    };

    if (editingCompany) {
      setCompanies(companies.map(c => c.id === newCompany.id ? newCompany : c));
    } else {
      setCompanies([newCompany, ...companies]);
    }
    closeDialog();
  };

  const toggleCompanyStatus = (companyId: string, status: boolean) => {
    setCompanies(companies.map(c => c.id === companyId ? { ...c, status: status ? 'active' : 'inactive' } : c));
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gestão de Empresas</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Limite de Ativos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.cnpj}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell><Badge variant="outline">{company.activeSegment}</Badge></TableCell>
                <TableCell>{company.assetLimit}</TableCell>
                <TableCell>
                    <Switch
                        checked={company.status === 'active'}
                        onCheckedChange={(checked) => toggleCompanyStatus(company.id, checked)}
                        aria-label="Toggle company status"
                    />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(company)}>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Atualize os detalhes da empresa.' : 'Preencha os detalhes da nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto -mx-6 px-6">
            <form onSubmit={handleSaveCompany} id="company-form" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input id="name" name="name" defaultValue={editingCompany?.name} required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input id="cnpj" name="cnpj" defaultValue={editingCompany?.cnpj} required />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={editingCompany?.email} required />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" name="phone" defaultValue={editingCompany?.phone} required />
                  </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input id="zipCode" name="zipCode" defaultValue={editingCompany?.address?.zipCode} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input id="street" name="street" defaultValue={editingCompany?.address?.street} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input id="number" name="number" defaultValue={editingCompany?.address?.number} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input id="complement" name="complement" defaultValue={editingCompany?.address?.complement} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input id="neighborhood" name="neighborhood" defaultValue={editingCompany?.address?.neighborhood} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" name="city" defaultValue={editingCompany?.address?.city} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input id="state" name="state" defaultValue={editingCompany?.address?.state} />
                  </div>
              </div>
              
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetLimit">Limite de Ativos</Label>
                  <Input id="assetLimit" name="assetLimit" type="number" defaultValue={editingCompany?.assetLimit} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento</Label>
                  <Select name="segment" defaultValue={editingCompany?.activeSegment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map(segment => (
                        <SelectItem key={segment} value={segment}>{segment.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Novo Segmento</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: PLATAFORMA ELEVATORIA" 
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddNewSegment}>
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Adicione um novo segmento de atuação para as empresas.</p>
              </div>
            </form>
          </div>
          <DialogFooter className="pt-4 -mx-6 px-6 pb-6 border-t">
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="company-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
