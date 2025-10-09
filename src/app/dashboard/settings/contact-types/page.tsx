
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
import { contactTypes as initialContactTypes, setContactTypes } from '@/lib/data';
import type { ContactType } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';

const emptyContactType: ContactType = {
  id: '',
  name: '',
};

export default function ContactTypesPage() {
  const { t } = useI18n();
  const [contactTypes, setContactTypesState] = React.useState<ContactType[]>(initialContactTypes);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingType, setEditingType] = React.useState<ContactType | null>(null);
  const [formData, setFormData] = React.useState<ContactType>(emptyContactType);

  const openDialog = (type: ContactType | null = null) => {
    setEditingType(type);
    setFormData(type ? {...type} : emptyContactType);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingType(null);
    setIsDialogOpen(false);
    setFormData(emptyContactType);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveType = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newType: ContactType = {
      ...formData,
      id: editingType?.id || formData.name.toUpperCase().replace(/\s/g, '_'),
    };

    let updatedTypes;
    if (editingType) {
      updatedTypes = contactTypes.map(r => (r.id === newType.id ? newType : r));
    } else {
      updatedTypes = [newType, ...contactTypes];
    }
    setContactTypesState(updatedTypes);
    setContactTypes(updatedTypes); // Update global data
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.contactTypes')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Tipo
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Tipo de Contato</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactTypes.map(type => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{type.id}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(type)}>
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
            <DialogTitle>{editingType ? 'Editar Tipo de Contato' : 'Novo Tipo de Contato'}</DialogTitle>
            <DialogDescription>
              {editingType ? 'Atualize os detalhes do tipo.' : 'Crie um novo tipo de contato para os clientes.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveType} id="type-form" className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Nome do Tipo</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: Financeiro"/>
              </div>
               {!editingType && (
                 <div className="space-y-2">
                    <Label htmlFor="id">ID</Label>
                    <Input id="id" name="id" value={formData.name.toUpperCase().replace(/\s/g, '_')} disabled placeholder="Gerado automaticamente"/>
                </div>
               )}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="type-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
