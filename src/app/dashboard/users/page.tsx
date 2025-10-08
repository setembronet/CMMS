
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
import { users as initialUsers, companies, cmmsRoles } from '@/lib/data';
import type { User, CMMSRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const emptyUser: User & { password?: string, confirmPassword?: string } = {
    id: '',
    name: '',
    email: '',
    role: '',
    cmmsRole: 'GESTOR',
    saasRole: 'VIEWER', // Default non-SaaS user
    clientId: null,
    clientName: '',
    squad: '',
    avatarUrl: '',
    password: '',
    confirmPassword: '',
};

type PasswordStrength = {
  level: 'Fraca' | 'Média' | 'Forte';
  value: number;
  color: string;
};


export default function CMMSUsersPage() {
  const [users, setUsers] = React.useState<User[]>(initialUsers.filter(u => cmmsRoles.some(r => r.id === u.cmmsRole)));
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [roles] = React.useState<CMMSRole[]>(cmmsRoles);
  const [formData, setFormData] = React.useState(emptyUser);
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength | null>(null);


  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'Fraca', value: 33, color: 'bg-red-500' };
    if (score <= 4) return { level: 'Média', value: 66, color: 'bg-yellow-500' };
    return { level: 'Forte', value: 100, color: 'bg-green-500' };
  };

  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
    const userData = user ? { ...user, password: '', confirmPassword: '' } : emptyUser;
    setFormData(userData);
    setPasswordStrength(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(false);
    setFormData(emptyUser);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newFormData = { ...prev, [name]: value };
        if (name === 'password') {
            setPasswordStrength(value ? calculatePasswordStrength(value) : null);
        }
        return newFormData;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSaveDisabled) return;

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
  
  const isSaveDisabled = 
    (!!formData.password && passwordStrength?.level === 'Fraca') ||
    (formData.password !== formData.confirmPassword);
  
  const getRoleName = (roleId: string | null) => {
    if (!roleId) return '';
    return cmmsRoles.find(r => r.id === roleId)?.name || roleId;
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Usuários</h1>
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
                <TableCell><Badge variant="secondary">{getRoleName(user.cmmsRole)}</Badge></TableCell>
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
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário CMMS'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 150px)' }}>
            <ScrollArea className="h-full pr-6 -mx-6 px-6">
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
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleInputChange} required={!editingUser} placeholder={editingUser ? 'Deixe em branco para não alterar' : ''} />
                </div>
                
                {passwordStrength && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <Label>Força da Senha</Label>
                            <span className={cn(
                                passwordStrength.level === 'Fraca' && 'text-red-500',
                                passwordStrength.level === 'Média' && 'text-yellow-500',
                                passwordStrength.level === 'Forte' && 'text-green-500'
                            )}>{passwordStrength.level}</span>
                        </div>
                        <Progress value={passwordStrength.value} className={cn("h-2", passwordStrength.color)} />
                         <p className="text-xs text-muted-foreground">
                            Use 8+ caracteres com letras, números e símbolos.
                        </p>
                    </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword || ''} onChange={handleInputChange} required={!!formData.password} />
                   {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-destructive">As senhas não coincidem.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cmmsRole">Função CMMS</Label>
                  <Select name="cmmsRole" value={formData.cmmsRole || ''} onValueChange={(value) => handleSelectChange('cmmsRole', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientId">Empresa</Label>
                  <Select name="clientId" value={formData.clientId || ''} onValueChange={(value) => handleSelectChange('clientId', value)}>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="user-form" disabled={isSaveDisabled}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
