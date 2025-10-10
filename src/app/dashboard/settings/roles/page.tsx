
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
import { cmmsRoles as initialCmmsRoles, setCmmsRoles } from '@/lib/data';
import type { CMMSRole } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';

const emptyRole: CMMSRole = {
  id: '',
  name: '',
};

export default function RolesPage() {
  const { t } = useI18n();
  const [roles, setRoles] = React.useState<CMMSRole[]>(initialCmmsRoles);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<CMMSRole | null>(null);
  const [formData, setFormData] = React.useState<CMMSRole>(emptyRole);

  const openDialog = (role: CMMSRole | null = null) => {
    setEditingRole(role);
    setFormData(role ? {...role} : emptyRole);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingRole(null);
    setIsDialogOpen(false);
    setFormData(emptyRole);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newRole: CMMSRole = {
      ...formData,
      id: editingRole?.id || formData.name.toUpperCase().replace(/\s/g, '_'),
    };

    let updatedRoles;
    if (editingRole) {
      updatedRoles = roles.map(r => (r.id === newRole.id ? newRole : r));
    } else {
      updatedRoles = [newRole, ...roles];
    }
    setRoles(updatedRoles);
    setCmmsRoles(updatedRoles); // Update global data
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('roles.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('roles.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('roles.table.name')}</TableHead>
              <TableHead>{t('roles.table.id')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{role.id}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(role)}>
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
            <DialogTitle>{editingRole ? t('roles.dialog.editTitle') : t('roles.dialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {editingRole ? t('roles.dialog.editDescription') : t('roles.dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRole} id="role-form" className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="name">{t('roles.dialog.name')}</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder={t('roles.dialog.namePlaceholder')}/>
              </div>
               {!editingRole && (
                 <div className="space-y-2">
                    <Label htmlFor="id">{t('roles.dialog.id')}</Label>
                    <Input id="id" name="id" value={formData.name.toUpperCase().replace(/\s/g, '_')} disabled placeholder={t('roles.dialog.idPlaceholder')}/>
                </div>
               )}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button type="submit" form="role-form">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    