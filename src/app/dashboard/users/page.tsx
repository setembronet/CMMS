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
import { users as initialUsers } from '@/lib/data';
import type { User, SaaSUserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

const saasRoles: SaaSUserRole[] = ['ADMIN', 'FINANCEIRO', 'SUPORTE'];

const emptyUser: User = {
    id: '',
    name: '',
    email: '',
    role: '',
    saasRole: 'SUPORTE',
    clientId: null,
    clientName: '',
    squad: '',
    avatarUrl: ''
};

export default function SaaSUsersPage() {
  const [users, setUsers] = React.useState<User[]>(initialUsers.filter(u => saasRoles.includes(u.saasRole as SaaSUserRole)));
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [formData, setFormData] = React.useState<User>(emptyUser);


  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
    setFormData(user || emptyUser);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
    setFormData(emptyUser);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newUser: User = {
      ...formData,
      id: editingUser?.id || `user-0${users.length + 1}`,
      role: formData.saasRole, // Role is the saasRole for these users
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
        <h1 className="text-3xl font-bold font-headline">Usuários do SaaS</h1>
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
                <TableCell><Badge variant="secondary">{user.saasRole}</Badge></TableCell>
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
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className='flex-1 overflow-y-auto -mx-6 px-6'>
            <ScrollArea className="h-full pr-6">
              <form id="user-form" onSubmit={handleSaveUser} className="space-y-4 py-4">
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
                  <Label htmlFor="saasRole">Função SaaS</Label>
                  <Select name="saasRole" value={formData.saasRole} onValueChange={(value) => handleSelectChange('saasRole', value as SaaSUserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      {saasRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </ScrollArea>
          </div>
          <DialogFooter className="pt-4 mt-auto border-t bg-background -mx-6 px-6 pb-6 sticky bottom-0">
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="user-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
