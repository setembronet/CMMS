
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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { companies as initialCompanies, segments as initialSegments } from '@/lib/data';
import type { Company, CompanySegment } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const emptyCompany: Company = {
  id: '',
  name: '',
  cnpj: '',
  email: '',
  phone: '',
  status: 'active',
  activeSegments: [],
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
};

export default function CompaniesPage() {
  const [companies, setCompanies] = React.useState<Company[]>(initialCompanies);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);
  const [formData, setFormData] = React.useState<Company>(emptyCompany);
  const [segments] = React.useState<CompanySegment[]>(initialSegments);

  const openDialog = (company: Company | null = null) => {
    setEditingCompany(company);
    setFormData(company ? JSON.parse(JSON.stringify(company)) : emptyCompany);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingCompany(null);
    setIsDialogOpen(false);
    setFormData(emptyCompany);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          // @ts-ignore
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };
  
  const handleSegmentChange = (segmentId: string, checked: boolean) => {
    setFormData(prev => {
      const currentSegments = prev.activeSegments || [];
      if (checked) {
        return { ...prev, activeSegments: [...currentSegments, segmentId] };
      } else {
        return { ...prev, activeSegments: currentSegments.filter(s => s !== segmentId) };
      }
    });
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          },
        }));
      }
    } catch (error) {
      console.error("Falha ao buscar CEP:", error);
    }
  };

  const handleSaveCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newCompany: Company = {
      ...formData,
      id: editingCompany?.id || `client-0${companies.length + 1}`,
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
        <h1 className="text-3xl font-bold font-headline">Visão Geral das Empresas</h1>
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
              <TableHead>Segmentos Ativos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
                return (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.cnpj}</TableCell>
                    <TableCell>{company.activeSegments.length}</TableCell>
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
                )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Atualize os detalhes da empresa.' : 'Preencha os detalhes da nova empresa.'}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[calc(80vh-150px)] overflow-y-auto">
            <ScrollArea className="h-full pr-6 -mx-6 px-6">
              <form onSubmit={handleSaveCompany} id="company-form" className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Empresa</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                </div>

                <Separator />

                <h3 className="text-lg font-medium">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input id="zipCode" name="address.zipCode" value={formData.address?.zipCode || ''} onChange={handleInputChange} onBlur={handleCepBlur} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Rua</Label>
                        <Input id="street" name="address.street" value={formData.address?.street || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input id="number" name="address.number" value={formData.address?.number || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input id="complement" name="address.complement" value={formData.address?.complement || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input id="state" name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} />
                    </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Configuração Operacional</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Segmentos de Atuação</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg border p-4 mt-2">
                        {segments.map(segment => (
                          <div key={segment.id} className="flex items-center gap-2">
                              <Checkbox 
                                id={`segment-${segment.id}`}
                                checked={(formData.activeSegments || []).includes(segment.id)}
                                onCheckedChange={(checked) => handleSegmentChange(segment.id, !!checked)}
                              />
                              <Label htmlFor={`segment-${segment.id}`} className="font-normal capitalize">
                                {segment.name.replace(/_/g, ' ').toLowerCase()}
                              </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </form>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="company-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
