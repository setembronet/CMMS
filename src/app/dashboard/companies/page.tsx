
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
import { segments as initialSegments, plans, addons } from '@/lib/data';
import type { Company, CompanySegment, Plan, Addon } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/hooks/use-i18n';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument, updateDocument } from '@/firebase/firestore';

const emptyCompany: Omit<Company, 'id'> = {
  name: '',
  cnpj: '',
  email: '',
  phone: '',
  status: 'active',
  planId: plans[0]?.id || '',
  activeAddons: [],
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
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();

  const { data: companies, loading: companiesLoading } = useCollection<Company>('companies');
  const { data: segments, loading: segmentsLoading } = useCollection<CompanySegment>('segments');

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);
  const [formData, setFormData] = React.useState<Omit<Company, 'id'>>(emptyCompany);

  const openDialog = (company: Company | null = null) => {
    setEditingCompany(company);
    if (company) {
      const { id, ...companyData } = company;
      setFormData(companyData);
    } else {
      setFormData(emptyCompany);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingCompany(null);
    setIsDialogOpen(false);
    setFormData(emptyCompany);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
        const newFormData = { ...prev };
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            // @ts-ignore
            if (!newFormData[parent]) newFormData[parent] = {};
            // @ts-ignore
            newFormData[parent][child] = value;
        } else {
            // @ts-ignore
            newFormData[name] = type === 'checkbox' ? checked : value;
        }
        return newFormData;
    });
  };

  const handleSelectChange = (name: keyof Omit<Company, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleAddonChange = (addonId: string, checked: boolean) => {
    setFormData(prev => {
      const currentAddons = prev.activeAddons || [];
      if (checked) {
        return { ...prev, activeAddons: [...currentAddons, addonId] };
      } else {
        return { ...prev, activeAddons: currentAddons.filter(s => s !== addonId) };
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

  const handleSaveCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    
    try {
        if (editingCompany) {
            await updateDocument(firestore, 'companies', editingCompany.id, formData);
            toast({
                title: "Empresa Atualizada!",
                description: `A empresa "${formData.name}" foi atualizada com sucesso.`,
            });
        } else {
            await addDocument(firestore, 'companies', formData);
            toast({
                title: "Empresa Criada!",
                description: `A empresa "${formData.name}" foi criada com sucesso.`,
            });
        }
        closeDialog();
    } catch (error) {
        console.error("Erro ao salvar empresa:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar os dados da empresa. Tente novamente."
        });
    }
  };

  const toggleCompanyStatus = async (company: Company) => {
    if (!firestore) return;
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    try {
        await updateDocument(firestore, 'companies', company.id, { status: newStatus });
        toast({
            title: "Status Alterado",
            description: `A empresa "${company.name}" foi marcada como ${newStatus === 'active' ? 'ativa' : 'inativa'}.`
        });
    } catch(error) {
        console.error("Erro ao alterar status:", error);
         toast({
            variant: "destructive",
            title: "Erro ao Alterar Status",
            description: "Não foi possível alterar o status da empresa."
        });
    }
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('companies.overviewTitle')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('companies.newCompany')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('sidebar.plans')}</TableHead>
              <TableHead>{t('sidebar.segments')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companiesLoading ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Carregando empresas...</TableCell>
                </TableRow>
            ) : companies.map((company) => {
                const plan = plans.find(p => p.id === company.planId);
                return (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{company.activeSegments.length}</TableCell>
                    <TableCell>
                        <Switch
                            checked={company.status === 'active'}
                            onCheckedChange={() => toggleCompanyStatus(company)}
                            aria-label={t('companies.toggleStatus')}
                        />
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
                          <DropdownMenuItem onClick={() => openDialog(company)}>
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingCompany ? t('companies.editCompany') : t('companies.newCompany')}</DialogTitle>
            <DialogDescription>
              {editingCompany ? t('companies.editDescription') : t('companies.newDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[calc(80vh-150px)] overflow-y-auto">
            <ScrollArea className="h-full pr-6 -mx-6 px-6">
              <form onSubmit={handleSaveCompany} id="company-form" className="space-y-6 py-4 px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('companies.name')}</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cnpj">{t('companies.cnpj')}</Label>
                        <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('common.email')}</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">{t('common.phone')}</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                </div>

                <Separator />

                <h3 className="text-lg font-medium">{t('common.address')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="zipCode">{t('address.zipCode')}</Label>
                        <Input id="zipCode" name="address.zipCode" value={formData.address?.zipCode || ''} onChange={handleInputChange} onBlur={handleCepBlur} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">{t('address.street')}</Label>
                        <Input id="street" name="address.street" value={formData.address?.street || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">{t('address.number')}</Label>
                        <Input id="number" name="address.number" value={formData.address?.number || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="complement">{t('address.complement')}</Label>
                        <Input id="complement" name="address.complement" value={formData.address?.complement || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="neighborhood">{t('address.neighborhood')}</Label>
                        <Input id="neighborhood" name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">{t('address.city')}</Label>
                        <Input id="city" name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">{t('address.state')}</Label>
                        <Input id="state" name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} />
                    </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">{t('companies.operationalConfig')}</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="planId">{t('companies.subscriptionPlan')}</Label>
                    <Select name="planId" value={formData.planId} onValueChange={(value) => handleSelectChange('planId', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.selectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>{plan.name} - R$ {plan.price}/mês</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('companies.actingSegments')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg border p-4 mt-2">
                        {segmentsLoading ? <p>Carregando segmentos...</p> : segments.map(segment => (
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
                   <div>
                    <Label>{t('companies.contractedAddons')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg border p-4 mt-2">
                        {addons.map(addon => (
                          <div key={addon.id} className="flex items-center gap-2">
                              <Checkbox 
                                id={`addon-${addon.id}`}
                                checked={(formData.activeAddons || []).includes(addon.id)}
                                onCheckedChange={(checked) => handleAddonChange(addon.id, !!checked)}
                              />
                              <Label htmlFor={`addon-${addon.id}`} className="font-normal">
                                {addon.name}
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
            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button type="submit" form="company-form">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
