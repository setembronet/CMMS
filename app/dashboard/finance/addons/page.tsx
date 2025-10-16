
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { addons as initialAddons } from '../../lib/data';
import type { Addon } from '../../lib/types';
import { useI18n } from '../../hooks/use-i18n';

const emptyAddon: Addon = {
  id: '',
  name: '',
  price: 0,
};

export default function AddonsPage() {
  const { t } = useI18n();
  const [addons, setAddons] = React.useState<Addon[]>(initialAddons);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingAddon, setEditingAddon] = React.useState<Addon | null>(null);
  const [formData, setFormData] = React.useState<Addon>(emptyAddon);

  const openDialog = (addon: Addon | null = null) => {
    setEditingAddon(addon);
    setFormData(addon || emptyAddon);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingAddon(null);
    setIsDialogOpen(false);
    setFormData(emptyAddon);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveAddon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newAddon: Addon = {
      ...formData,
      id: editingAddon?.id || `addon_${formData.name.toLowerCase().replace(/\s/g, '_')}`,
    };

    if (editingAddon) {
      setAddons(addons.map(a => (a.id === newAddon.id ? newAddon : a)));
    } else {
      setAddons([newAddon, ...addons]);
    }
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('addons.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('addons.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('addons.table.name')}</TableHead>
              <TableHead>{t('addons.table.monthlyValue')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.map(addon => (
              <TableRow key={addon.id}>
                <TableCell className="font-medium">{addon.name}</TableCell>
                <TableCell>R$ {addon.price.toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(addon)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddon ? t('addons.dialog.editTitle') : t('addons.dialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {editingAddon ? t('addons.dialog.editDescription') : t('addons.dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAddon} id="addon-form" className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="name">{t('addons.dialog.name')}</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="price">{t('addons.dialog.monthlyValue')}</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
              </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button type="submit" form="addon-form">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
