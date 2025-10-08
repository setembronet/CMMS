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
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { users as initialUsers, companies } from '@/lib/data';
import type { User, CMMSUserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

const cmmsRoles: CMMSUserRole[] = ['GESTOR', 'TECNICO', 'TECNICO_TERCERIZADO', 'SINDICO'];

const emptyUser: User = {
    id: '',
    name: '',
    email: '',
    role: '',
    cmmsRole: 'GESTOR',
    saasRole: 'VIEWER', // Default non-SaaS user
    clientId: null,
    clientName: '',
    squad: '',
    avatarUrl: ''
};

export default function CMMSUsersPage() {
  const [users, setUsers] = React.useState<User[]>(initialUsers.filter(u => cmmsRoles.includes(u.cmmsRole as CMMSUserRole)));
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [roles, setRoles] = React.useState<CMMSUserRole[]>(cmmsRoles);
  const [newRole, setNewRole] = React.useState('');
  const [formData, setFormData] = React.useState<User>(emptyUser);


  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
    setFormData(user || emptyUser);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
    setNewRole('');
    setFormData(emptyUser);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewRole = () => {
    const formattedRole = newRole.trim().toUpperCase().replace(/\s/g, '_') as CMMSUserRole;
    if (newRole && !roles.includes(formattedRole)) {
      setRoles([...roles, formattedRole]);
      setFormData(prev => ({...prev, cmmsRole: formattedRole}));
      setNewRole('');
    }
  };
  
  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const client = companies.find(c => c.id === formData.clientId);

    const newUser: User = {
      ...formData,
      id: editingUser?.id || `user-0${users.length + 1}`,
      clientName: client?.name,
      role: formData.cmmsRole ?? '',
    };

    if (editingUser) {
      setUsers(users.map(u => u.id === newUser.id ? newUser : u));
    } else {
      setUsers([newUser, ...users]);
    }
    closeDialog();
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Usuários do CMMS</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage asChild src={user.avatarUrl}><Image src={user.avatarUrl} alt={user.name} width={32} height={32} /></AvatarImage>
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div>{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="secondary">{user.cmmsRole?.replace(/_/g, ' ') ?? user.role}</Badge></TableCell>
                <TableCell>{user.clientName}</TableCell>
                <TableCell>{user.squad || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(user)}>
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
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário CMMS'}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto -mx-6 px-6">
            <ScrollArea className="h-full pr-6">
              <form id="user-form" onSubmit={handleSaveUser} className="grid gap-4 py-4 h-full">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {formData.avatarUrl && <AvatarImage src={formData.avatarUrl} alt={formData.name} />}
                      <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full space-y-2">
                      <Label htmlFor="avatarUrl">URL do Avatar</Label>
                      <Input id="avatarUrl" name="avatarUrl" value={formData.avatarUrl} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cmmsRole">Função CMMS</Label>
                  <Select name="cmmsRole" value={formData.cmmsRole} onValueChange={(value) => handleSelectChange('cmmsRole', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nova Função CMMS</Label>
                  <div className="flex gap-2">
                      <Input 
                          id="new-role"
                          placeholder="Ex: Supervisor" 
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                      />
                      <Button type="button" variant="secondary" onClick={handleAddNewRole}>
                          Adicionar
                      </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientId">Empresa</Label>
                  <Select name="clientId" value={formData.clientId || undefined} onValueChange={(value) => handleSelectChange('clientId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squad">Equipe</Label>
                  <Input id="squad" name="squad" value={formData.squad} onChange={handleInputChange} placeholder="Opcional para técnicos" />
                </div>
              </form>
            </ScrollArea>
          </div>
          <DialogFooter className="pt-4 mt-auto border-t bg-background -mx-6 px-6 pb-6">
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="user-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
