
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
import { PlusCircle, MoreHorizontal, Trash2, UserPlus } from 'lucide-react';
import { suppliers as initialSuppliers, setSuppliers } from '@/lib/data';
import type { Supplier, SupplierContact, SupplierCategory } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/hooks/use-i18n';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const emptyContact: SupplierContact = {
  id: '',
  name: '',
  role: '',
  email: '',
  phone: '',
};

const emptySupplier: Supplier = {
  id: '',
  name: '',
  cnpj: '',
  email: '',
  phone: '',
  categories: [],
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
  contacts: [],
};

const supplierCategories: { id: SupplierCategory, label: string }[] = [
    { id: 'PEÇAS', label: 'Peças' },
    { id: 'SERVIÇOS', label: 'Serviços' },
    { id: 'MATERIAIS', label: 'Materiais' },
];

export default function SuppliersPage() {
  const { t } = useI18n();
  const [suppliers, setLocalSuppliers] = React.useState<Supplier[]>(initialSuppliers);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);
  const [formData, setFormData] = React.useState<Supplier | null>(null);

  const openDialog = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier);
    setFormData(supplier ? JSON.parse(JSON.stringify(supplier)) : JSON.parse(JSON.stringify(emptySupplier)));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingSupplier(null);
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => prev ? ({
        ...prev,
        [parent]: {
          // @ts-ignore
          ...prev[parent],
          [child]: value
        }
      }) : null);
    } else {
      setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    }
  };

  const handleCategoryChange = (categoryId: SupplierCategory, checked: boolean) => {
    if (!formData) return;
    setFormData(prev => {
        if (!prev) return null;
        const currentCategories = prev.categories || [];
        if (checked) {
            return { ...prev, categories: [...currentCategories, categoryId] };
        } else {
            return { ...prev, categories: currentCategories.filter(c => c !== categoryId) };
        }
    });
  };

  const handleContactChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const newContacts = [...(formData.contacts || [])];
    // @ts-ignore
    newContacts[index][name] = value;
    setFormData(prev => prev ? ({ ...prev, contacts: newContacts }) : null);
  };

  const addContact = () => {
    if (!formData) return;
    const newContact: SupplierContact = { ...emptyContact, id: `contact-${Date.now()}` };
    setFormData(prev => prev ? ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact],
    }) : null);
  };

  const removeContact = (index: number) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      contacts: (prev.contacts || []).filter((_, i) => i !== index),
    }) : null);
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (!formData) return;
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => prev ? ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          },
        }) : null);
      }
    } catch (error) {
      console.error("Falha ao buscar CEP:", error);
    }
  };

  const handleSaveSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;
    let updatedSuppliers;

    if (editingSupplier) {
      updatedSuppliers = suppliers.map(s => (s.id === editingSupplier.id ? formData : s));
    } else {
      const newSupplier: Supplier = {
        ...formData,
        id: `supp-${Date.now()}`,
      };
      updatedSuppliers = [newSupplier, ...suppliers];
    }

    setSuppliers(updatedSuppliers);
    setLocalSuppliers(updatedSuppliers);
    closeDialog();
  };
  
  const getCategoryLabel = (id: SupplierCategory) => {
      const category = supplierCategories.find(c => c.id === id);
      return category ? t(`suppliers.categories.${id.toLowerCase()}`) : id;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('suppliers.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('suppliers.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('suppliers.table.name')}</TableHead>
              <TableHead>{t('suppliers.table.contact')}</TableHead>
              <TableHead>{t('common.phone')}</TableHead>
              <TableHead>{t('suppliers.table.categories')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map(supplier => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contacts && supplier.contacts[0] ? supplier.contacts[0].name : 'N/A'}</TableCell>
                <TableCell>{supplier.phone || 'N/A'}</TableCell>
                <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {(supplier.categories || []).map(cat => (
                            <Badge key={cat} variant="secondary">{getCategoryLabel(cat)}</Badge>
                        ))}
                    </div>
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
                      <DropdownMenuItem onClick={() => openDialog(supplier)}>
                        {t('common.edit')}
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? t('suppliers.dialog.editTitle') : t('suppliers.dialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? t('suppliers.dialog.editDescription') : t('suppliers.dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>
          {formData && (
            <>
              <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                <form onSubmit={handleSaveSupplier} id="supplier-form" className="space-y-6 py-4 px-1">
                  <h3 className="text-lg font-medium">{t('suppliers.dialog.registrationData')}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('suppliers.dialog.name')}</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">{t('companies.cnpj')}</Label>
                        <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleInputChange} required />
                      </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('common.email')}</Label>
                            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('common.phone')}</Label>
                            <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2">
                        <Label>{t('suppliers.dialog.classification')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg border p-4">
                            {supplierCategories.map(cat => (
                                <div key={cat.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`cat-${cat.id}`}
                                        checked={(formData.categories || []).includes(cat.id)}
                                        onCheckedChange={(checked) => handleCategoryChange(cat.id, !!checked)}
                                    />
                                    <Label htmlFor={`cat-${cat.id}`} className="font-normal">{t(`suppliers.categories.${cat.id.toLowerCase()}`)}</Label>
                                </div>
                            ))}
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="number">{t('address.number')}</Label>
                        <Input id="number" name="address.number" value={formData.address?.number || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="complement">{t('address.complement')}</Label>
                        <Input id="complement" name="address.complement" value={formData.address?.complement || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">{t('address.neighborhood')}</Label>
                        <Input id="neighborhood" name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">{t('address.city')}</Label>
                        <Input id="city" name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">{t('address.state')}</Label>
                      <Input id="state" name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">{t('clients.dialog.contactsSection')}</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addContact}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t('clients.dialog.addContact')}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {(formData.contacts || []).map((contact, index) => (
                        <div key={contact.id} className="p-4 border rounded-lg space-y-4 relative">
                          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeContact(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">{t('clients.dialog.removeContact')}</span>
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`contact-name-${index}`}>{t('clients.dialog.fullName')}</Label>
                              <Input id={`contact-name-${index}`} name="name" value={contact.name} onChange={e => handleContactChange(index, e)} required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`contact-role-${index}`}>{t('clients.dialog.role')}</Label>
                              <Input id={`contact-role-${index}`} name="role" value={contact.role} onChange={e => handleContactChange(index, e)} required placeholder={t('suppliers.dialog.rolePlaceholder')} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`contact-phone-${index}`}>{t('common.phone')}</Label>
                              <Input id={`contact-phone-${index}`} name="phone" value={contact.phone || ''} onChange={e => handleContactChange(index, e)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`contact-email-${index}`}>{t('common.email')}</Label>
                              <Input id={`contact-email-${index}`} name="email" type="email" value={contact.email || ''} onChange={e => handleContactChange(index, e)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </ScrollArea>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
                <Button type="submit" form="supplier-form">{t('common.save')}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

  