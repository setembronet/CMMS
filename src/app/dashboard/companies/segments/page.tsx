
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
import { Badge } from '@/components/ui/badge';
import { segments as initialSegments } from '@/lib/data';
import type { CompanySegment } from '@/lib/types';

const emptySegment: CompanySegment = {
  id: '',
  name: '',
  customFields: [],
};

export default function SegmentsPage() {
  const [segments, setSegments] = React.useState<CompanySegment[]>(initialSegments);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSegment, setEditingSegment] = React.useState<CompanySegment | null>(null);
  const [formData, setFormData] = React.useState<CompanySegment>(emptySegment);

  const openDialog = (segment: CompanySegment | null = null) => {
    setEditingSegment(segment);
    setFormData(segment ? {...segment} : emptySegment);
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

  const handleSaveSegment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSegment: CompanySegment = {
      ...formData,
      id: editingSegment?.id || formData.name.toUpperCase().replace(/\s/g, '_'),
      customFields: formData.customFields || [],
    };

    if (editingSegment) {
      setSegments(segments.map(s => (s.id === newSegment.id ? newSegment : s)));
    } else {
      setSegments([newSegment, ...segments]);
    }
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Segmentos de Atuação</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Segmento
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Segmento</TableHead>
              <TableHead>Campos Personalizados</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.map(segment => (
              <TableRow key={segment.id}>
                <TableCell className="font-medium">{segment.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{segment.customFields?.length || 0} campos</Badge>
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
                      <DropdownMenuItem onClick={() => openDialog(segment)}>
                        Editar
                      </DropdownMenuItem>
                       <DropdownMenuItem disabled>
                        Gerenciar Campos
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
            <DialogTitle>{editingSegment ? 'Editar Segmento' : 'Novo Segmento'}</DialogTitle>
            <DialogDescription>
              {editingSegment ? 'Atualize os detalhes do segmento.' : 'Defina um novo segmento de atuação para o CMMS.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSegment} id="segment-form" className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Nome do Segmento</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: Ar Condicionado Central"/>
              </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="segment-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
