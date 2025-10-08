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
import type { Company, CompanySegment } from '@/lib/types';

export default function CompaniesPage() {
  const [companies, setCompanies] = React.useState<Company[]>(initialCompanies);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);

  const openDialog = (company: Company | null = null) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingCompany(null);
    setIsDialogOpen(false);
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
      activeSegment: formData.get('segment') as CompanySegment,
      assetLimit: parseInt(formData.get('assetLimit') as string),
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Atualize os detalhes da empresa.' : 'Preencha os detalhes da nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCompany}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input id="name" name="name" defaultValue={editingCompany?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
                <Input id="cnpj" name="cnpj" defaultValue={editingCompany?.cnpj} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingCompany?.email} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="segment" className="text-right">Segmento</Label>
                <Select name="segment" defaultValue={editingCompany?.activeSegment}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELEVADOR">Elevador</SelectItem>
                    <SelectItem value="ESCADA_ROLANTE">Escada Rolante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assetLimit" className="text-right">Limite de Ativos</Label>
                <Input id="assetLimit" name="assetLimit" type="number" defaultValue={editingCompany?.assetLimit} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
