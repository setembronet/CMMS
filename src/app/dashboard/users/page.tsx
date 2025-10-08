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
import type { User, UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

const initialRoles: UserRole[] = ['Gestor de Empresa', 'Técnico'];

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [roles, setRoles] = React.useState<UserRole[]>(initialRoles);
  const [newRole, setNewRole] = React.useState('');

  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
    setNewRole('');
  };

  const handleAddNewRole = () => {
    if (newRole && !roles.includes(newRole)) {
      setRoles([...roles, newRole]);
      
      // We also need to update the form data if the dialog is open
      const form = document.getElementById('user-form') as HTMLFormElement;
      if(form) {
          const roleSelect = form.elements.namedItem('role') as HTMLSelectElement;
          // This is a workaround to set the value in the Select component
          // because it is not fully controlled in this form version.
          // A better approach would be to use a controlled component for the form.
          setTimeout(() => {
            const hiddenInput = document.querySelector('input[name="role"]');
            if (hiddenInput) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                nativeInputValueSetter?.call(hiddenInput, newRole);
                const ev2 = new Event('input', { bubbles: true });
                hiddenInput.dispatchEvent(ev2);
            }
          }, 0);
      }
      setNewRole('');
    }
  };
  
  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const client = companies.find(c => c.id === formData.get('clientId'));

    const newUser: User = {
      id: editingUser?.id || `user-0${users.length + 1}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      clientId: formData.get('clientId') as string,
      clientName: client?.name,
      squad: formData.get('squad') as string,
      avatarUrl: editingUser?.avatarUrl || '',
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
        <h1 className="text-3xl font-bold font-headline">Gestão de Usuários</h1>
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
            {users.filter(u => u.role !== 'Admin Master').map((user) => (
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
                <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <form id="user-form" onSubmit={handleSaveUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input id="name" name="name" defaultValue={editingUser?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingUser?.email} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Função</Label>
                <Select name="role" defaultValue={editingUser?.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-role" className="text-right">Nova Função</Label>
                <div className="col-span-3 flex gap-2">
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


              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientId" className="text-right">Empresa</Label>
                <Select name="clientId" defaultValue={editingUser?.clientId || undefined}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="squad" className="text-right">Equipe</Label>
                <Input id="squad" name="squad" defaultValue={editingUser?.squad} className="col-span-3" placeholder="Opcional para técnicos" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
