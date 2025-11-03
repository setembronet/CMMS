
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
import type { ChecklistTemplate, ChecklistGroup, ChecklistItem, CompanySegment, CustomFieldType } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/hooks/use-i18n';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useCollection, addDocument, updateDocument } from '@/firebase/firestore';

const emptyTemplate: Omit<ChecklistTemplate, 'id'> = {
  name: '',
  segmentId: '',
  checklistData: [],
};

const emptyGroup: Omit<ChecklistGroup, 'id'> = {
  title: '',
  items: [],
};

const emptyItem: Omit<ChecklistItem, 'id'> = {
  text: '',
  status: 'OK',
  comment: '',
};

export default function ChecklistTemplatesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const firestore = useFirestore();

  const { data: templates, loading: templatesLoading } = useCollection<ChecklistTemplate>('checklistTemplates');
  const { data: segments, loading: segmentsLoading } = useCollection<CompanySegment>('segments');

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<ChecklistTemplate | null>(null);
  const [formData, setFormData] = React.useState<Omit<ChecklistTemplate, 'id'>>(emptyTemplate);

  const openDialog = (template: ChecklistTemplate | null = null) => {
    setEditingTemplate(template);
    if (template) {
        const { id, ...templateData } = template;
        setFormData(templateData);
    } else {
        setFormData(emptyTemplate);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingTemplate(null);
    setIsDialogOpen(false);
    setFormData(emptyTemplate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof Omit<ChecklistTemplate, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (groupIdx: number, value: string) => {
    const newChecklistData = [...(formData.checklistData || [])];
    newChecklistData[groupIdx].title = value;
    setFormData(prev => ({ ...prev, checklistData: newChecklistData }));
  };
  
  const handleItemChange = (groupIdx: number, itemIdx: number, value: string) => {
      const newChecklistData = [...(formData.checklistData || [])];
      newChecklistData[groupIdx].items[itemIdx].text = value;
      setFormData(prev => ({...prev, checklistData: newChecklistData}));
  };
  
  const addGroup = () => {
      const newGroup = { ...emptyGroup, id: `group_${Date.now()}` };
      setFormData(prev => ({ ...prev, checklistData: [...(prev.checklistData || []), newGroup] }));
  }

  const removeGroup = (groupIdx: number) => {
      setFormData(prev => ({ ...prev, checklistData: (prev.checklistData || []).filter((_, idx) => idx !== groupIdx) }));
  }

  const addItem = (groupIdx: number) => {
      const newChecklistData = [...(formData.checklistData || [])];
      newChecklistData[groupIdx].items.push({ ...emptyItem, id: `item_${Date.now()}`});
      setFormData(prev => ({...prev, checklistData: newChecklistData}));
  }

  const removeItem = (groupIdx: number, itemIdx: number) => {
      const newChecklistData = [...(formData.checklistData || [])];
      newChecklistData[groupIdx].items = newChecklistData[groupIdx].items.filter((_, idx) => idx !== itemIdx);
      setFormData(prev => ({ ...prev, checklistData: newChecklistData }));
  }

  const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !formData) return;

    try {
        if (editingTemplate) {
            await updateDocument(firestore, 'checklistTemplates', editingTemplate.id, formData);
            toast({
                title: "Modelo Atualizado!",
                description: `O modelo "${formData.name}" foi atualizado com sucesso.`,
            });
        } else {
            await addDocument(firestore, 'checklistTemplates', formData);
            toast({
                title: "Modelo Criado!",
                description: `O modelo "${formData.name}" foi criado com sucesso.`,
            });
        }
        closeDialog();
    } catch (error) {
        console.error("Erro ao salvar modelo:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar o modelo de checklist."
        });
    }
  };

  const getSegmentName = (segmentId: string) => {
    return segments.find(s => s.id === segmentId)?.name || 'N/A';
  }

  const isLoading = templatesLoading || segmentsLoading;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Modelos de Checklist</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Modelo</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Nº de Itens</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Carregando modelos...</TableCell>
              </TableRow>
            ) : templates.map(template => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{getSegmentName(template.segmentId)}</Badge>
                </TableCell>
                <TableCell>
                  {(template.checklistData || []).reduce((acc, group) => acc + group.items.length, 0)}
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
                      <DropdownMenuItem onClick={() => openDialog(template)}>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Editar Modelo' : 'Novo Modelo de Checklist'}</DialogTitle>
            <DialogDescription>
              Crie ou edite um modelo de checklist para ser usado nas ordens de serviço.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTemplate} id="template-form">
            <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                <div className="space-y-6 py-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Modelo</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: Manutenção Preventiva Mensal"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="segmentId">Segmento</Label>
                            <Select name="segmentId" value={formData.segmentId} onValueChange={(v) => handleSelectChange('segmentId', v)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o segmento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {segmentsLoading ? <SelectItem value="loading" disabled>Carregando...</SelectItem> : segments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-4">
                        {(formData.checklistData || []).map((group, groupIdx) => (
                            <div key={group.id} className="p-4 border rounded-lg space-y-4">
                                <div className="flex items-center gap-2">
                                    <Input 
                                        value={group.title} 
                                        onChange={(e) => handleGroupChange(groupIdx, e.target.value)} 
                                        placeholder="Nome do Grupo (Ex: Casa de Máquinas)"
                                        className="font-semibold text-base"
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(groupIdx)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                                <div className="pl-4 space-y-2">
                                    {(group.items || []).map((item, itemIdx) => (
                                        <div key={item.id} className="flex items-center gap-2">
                                            <Input 
                                                value={item.text} 
                                                onChange={(e) => handleItemChange(groupIdx, itemIdx, e.target.value)} 
                                                placeholder="Descrição do item do checklist"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(groupIdx, itemIdx)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => addItem(groupIdx)}>
                                        <PlusCircle className="mr-2 h-3 w-3"/> Adicionar Item
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button type="button" variant="secondary" onClick={addGroup}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Grupo
                    </Button>
                </div>
            </ScrollArea>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button type="submit" form="template-form">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
