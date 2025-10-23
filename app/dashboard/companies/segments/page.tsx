
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
import { PlusCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CompanySegment, CMMSRole, CustomField, CustomFieldType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/hooks/use-i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument, updateDocument } from '@/firebase/firestore';

const emptySegment: Omit<CompanySegment, 'id'> = {
  name: '',
  customFields: [],
  applicableRoles: [],
};

const customFieldTypes: { value: CustomFieldType, label: string }[] = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
];


export default function SegmentsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const { data: segments, loading: segmentsLoading } = useCollection<CompanySegment>('segments');
  const { data: cmmsRoles, loading: rolesLoading } = useCollection<CMMSRole>('cmmsRoles');

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSegment, setEditingSegment] = React.useState<CompanySegment | null>(null);
  const [formData, setFormData] = React.useState<Omit<CompanySegment, 'id'>>(emptySegment);

  const openDialog = (segment: CompanySegment | null = null) => {
    setEditingSegment(segment);
    if (segment) {
      const { id, ...segmentData } = segment;
      setFormData({
          ...segmentData,
          customFields: segmentData.customFields || [],
          applicableRoles: segmentData.applicableRoles || [],
      });
    } else {
      setFormData(emptySegment);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingSegment(null);
    setIsDialogOpen(false);
    setFormData(emptySegment);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setFormData(prev => {
      const currentRoles = prev.applicableRoles || [];
      if (checked) {
        return { ...prev, applicableRoles: [...currentRoles, roleId] };
      } else {
        return { ...prev, applicableRoles: currentRoles.filter(id => id !== roleId) };
      }
    });
  };

  const addCustomField = () => {
    setFormData(prev => ({
        ...prev,
        customFields: [...(prev.customFields || []), { id: `field_${Date.now()}`, name: '', label: '', type: 'text' }]
    }));
  };

  const removeCustomField = (id: string) => {
      setFormData(prev => ({
          ...prev,
          customFields: (prev.customFields || []).filter(field => field.id !== id)
      }));
  }

  const handleCustomFieldChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          customFields: (prev.customFields || []).map(field => 
              field.id === id ? { ...field, [name]: value, ...(name === 'label' && {name: value.toLowerCase().replace(/\s+/g, '_')}) } : field
          )
      }));
  };
  
  const handleCustomFieldTypeChange = (id: string, value: CustomFieldType) => {
    setFormData(prev => ({
        ...prev,
        customFields: (prev.customFields || []).map(field => 
            field.id === id ? { ...field, type: value } : field
        )
    }));
  };


  const handleSaveSegment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;

    try {
        if (editingSegment) {
            await updateDocument(firestore, 'segments', editingSegment.id, formData);
             toast({
                title: "Segmento Atualizado!",
                description: `O segmento "${formData.name}" foi atualizado.`,
            });
        } else {
            const newSegmentData = {
                ...formData,
                id: formData.name.toUpperCase().replace(/\s/g, '_'),
            }
            await addDocument(firestore, 'segments', newSegmentData);
             toast({
                title: "Segmento Criado!",
                description: `O segmento "${formData.name}" foi criado com sucesso.`,
            });
        }
        closeDialog();
    } catch (error) {
         console.error("Erro ao salvar segmento:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar o segmento."
        });
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('segments.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('segments.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('segments.table.name')}</TableHead>
              <TableHead>{t('segments.table.applicableRoles')}</TableHead>
              <TableHead>{t('segments.table.customFields')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segmentsLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Carregando segmentos...</TableCell></TableRow>
            ) : segments.map(segment => (
              <TableRow key={segment.id}>
                <TableCell className="font-medium">{segment.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{(segment.applicableRoles || []).length} {t('sidebar.roles').toLowerCase()}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{(segment.customFields || []).length} {t('segments.table.customFields').toLowerCase()}</Badge>
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
                      <DropdownMenuItem onClick={() => openDialog(segment)}>
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
            <DialogTitle>{editingSegment ? t('segments.dialog.editTitle') : t('segments.dialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {editingSegment ? t('segments.dialog.editDescription') : t('segments.dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] -mx-6 px-6">
            <form onSubmit={handleSaveSegment} id="segment-form" className="space-y-6 py-4">
                <div className="space-y-2 px-1">
                    <Label htmlFor="name">{t('segments.dialog.name')}</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder={t('segments.dialog.namePlaceholder')}/>
                </div>
                
                <Separator />

                <div className="space-y-4 px-1">
                  <div>
                      <h3 className="font-medium">{t('segments.dialog.applicableRoles')}</h3>
                      <p className="text-sm text-muted-foreground">{t('segments.dialog.applicableRolesDescription')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                      {rolesLoading ? <p>Carregando funções...</p> : cmmsRoles.map(role => (
                        <div key={role.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`role-${role.id}`}
                              checked={(formData.applicableRoles || []).includes(role.id)}
                              onCheckedChange={(checked) => handleRoleChange(role.id, !!checked)}
                            />
                            <Label htmlFor={`role-${role.id}`} className="font-normal">
                              {role.name}
                            </Label>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                 <div className="space-y-4 px-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('segments.dialog.customFields')}</h3>
                      <p className="text-sm text-muted-foreground">{t('segments.dialog.customFieldsDescription')}</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addCustomField}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {t('segments.dialog.addField')}
                    </Button>
                  </div>
                  <div className="space-y-4">
                      {(formData.customFields || []).map((field) => (
                          <div key={field.id} className="flex items-end gap-2 p-4 border rounded-lg">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                                <div className="space-y-1.5">
                                    <Label htmlFor={`field-label-${field.id}`}>{t('segments.dialog.fieldLabel')}</Label>
                                    <Input id={`field-label-${field.id}`} name="label" value={field.label} onChange={(e) => handleCustomFieldChange(field.id, e)} placeholder={t('segments.dialog.fieldLabelPlaceholder')}/>
                                </div>
                                 <div className="space-y-1.5">
                                    <Label htmlFor={`field-type-${field.id}`}>{t('segments.dialog.fieldType')}</Label>
                                    <Select value={field.type} onValueChange={(value) => handleCustomFieldTypeChange(field.id, value as CustomFieldType)}>
                                        <SelectTrigger id={`field-type-${field.id}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customFieldTypes.map(type => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                     <Label htmlFor={`field-name-${field.id}`}>{t('segments.dialog.fieldVariable')}</Label>
                                     <Input id={`field-name-${field.id}`} name="name" value={field.name} disabled />
                                </div>
                              </div>
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeCustomField(field.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive"/>
                              </Button>
                          </div>
                      ))}
                  </div>
                </div>
            </form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button type="submit" form="segment-form">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
