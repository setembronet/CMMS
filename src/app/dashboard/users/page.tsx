
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
import { users as initialUsers, companies, cmmsRoles as allRoles, segments, plans } from '@/lib/data';
import type { User, CMMSRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';


type PasswordStrength = {
  level: 'Fraca' | 'Média' | 'Forte';
  value: number;
  color: string;
};


export default function CMMSUsersPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();

  const [users, setUsers] = React.useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [formData, setFormData] = React.useState<User & { password?: string, confirmPassword?: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = React.useState<PasswordStrength | null>(null);
  const [availableRoles, setAvailableRoles] = React.useState<CMMSRole[]>([]);

  const clientPlan = React.useMemo(() => plans.find(p => p.id === selectedClient?.planId), [selectedClient]);
  const technicianUsersCount = users.filter(u => u.cmmsRole === 'TECNICO').length;
  const technicianLimit = clientPlan?.technicianUserLimit ?? 0;
  const hasReachedTechnicianLimit = technicianLimit !== -1 && technicianUsersCount >= technicianLimit;

  const emptyUser: User & { password?: string, confirmPassword?: string } = React.useMemo(() => ({
      id: '',
      name: '',
      email: '',
      role: '',
      cmmsRole: null, 
      saasRole: 'VIEWER',
      clientId: selectedClient?.id || '',
      clientName: selectedClient?.name || '',
      squad: '',
      avatarUrl: '',
      password: '',
      confirmPassword: '',
  }), [selectedClient]);

  React.useEffect(() => {
    if (selectedClient) {
      setUsers(initialUsers.filter(u => u.clientId === selectedClient.id));
      
      const company = selectedClient;
      if (company.activeSegments.length > 0) {
        const applicableRoleIds = new Set<string>();
        company.activeSegments.forEach(segmentId => {
          const segment = segments.find(s => s.id === segmentId);
          (segment?.applicableRoles || []).forEach(roleId => applicableRoleIds.add(roleId));
        });
        const filteredRoles = allRoles.filter(role => applicableRoleIds.has(role.id));
        setAvailableRoles(filteredRoles);
      } else {
        setAvailableRoles([]);
      }
    } else {
      setUsers([]);
      setAvailableRoles([]);
    }
  }, [selectedClient]);

  React.useEffect(() => {
    if (isDialogOpen && !editingUser && formData?.cmmsRole && !availableRoles.some(r => r.id === formData.cmmsRole)) {
        handleSelectChange('cmmsRole', '');
    }
  }, [isDialogOpen, editingUser, formData, availableRoles]);

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

  const translatedPasswordStrength = (level: 'Fraca' | 'Média' | 'Forte') => {
    switch(level) {
      case 'Fraca': return t('saasUsers.dialog.strength.weak');
      case 'Média': return t('saasUsers.dialog.strength.medium');
      case 'Forte': return t('saasUsers.dialog.strength.strong');
    }
  }

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
    setFormData(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => {
        if (!prev) return null;
        const newFormData = { ...prev, [name]: value };
        if (name === 'password') {
            setPasswordStrength(value ? calculatePasswordStrength(value) : null);
        }
        return newFormData;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData || !selectedClient) return;
    if (isSaveDisabled) return;

    if (!editingUser && formData.cmmsRole === 'TECNICO' && hasReachedTechnicianLimit) {
      console.error("Technician limit reached");
      return;
    }

    const newUser: User = {
      ...formData,
      id: editingUser?.id || `user-0${initialUsers.length + 1}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
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
    !formData ||
    (!!formData.password && passwordStrength?.level === 'Fraca') ||
    (formData.password !== formData.confirmPassword) ||
    !formData.cmmsRole ||
    (!editingUser && formData.cmmsRole === 'TECNICO' && hasReachedTechnicianLimit);

  
  const getRoleName = (roleId: string | null) => {
    if (!roleId) return '';
    return allRoles.find(r => r.id === roleId)?.name || roleId;
  };
  
  const NewUserButton = () => (
    <Button onClick={() => openDialog()} disabled={!selectedClient}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('users.new')}
    </Button>
  );

  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('users.selectClientPrompt')}</p>
        </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-headline">{t('users.title', { clientName: selectedClient?.name || 'Empresa' })}</h1>
           {hasReachedTechnicianLimit ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span><NewUserButton /></span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('users.limitReached', { limit: technicianLimit, planName: clientPlan?.name })}</p>
                <p>{t('users.limitInfo')}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <NewUserButton />
          )}
        </div>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('users.table.user')}</TableHead>
                <TableHead>{t('users.table.role')}</TableHead>
                <TableHead>{t('users.table.squad')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                  <TableCell>{user.squad || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('common.openMenu')}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(user)}>
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
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? t('users.dialog.editTitle') : t('users.dialog.newTitle', { clientName: selectedClient?.name })}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 150px)' }}>
              <ScrollArea className="h-full pr-6 -mx-6 px-6">
                {formData && (
                  <form id="user-form" onSubmit={handleSaveUser} className="grid gap-4 py-4 h-full">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          {formData.avatarUrl && <AvatarImage src={formData.avatarUrl} alt={formData.name} />}
                          <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-2">
                          <Label htmlFor="avatarUrl">{t('saasUsers.dialog.avatarUrl')}</Label>
                          <Input id="avatarUrl" name="avatarUrl" value={formData.avatarUrl} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">{t('common.name')}</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('common.email')}</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">{t('saasUsers.dialog.password')}</Label>
                      <Input id="password" name="password" type="password" value={formData.password || ''} onChange={handleInputChange} required={!editingUser} placeholder={editingUser ? t('saasUsers.dialog.passwordPlaceholder') : ''} />
                    </div>
                    
                    {passwordStrength && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <Label>{t('saasUsers.dialog.passwordStrength')}</Label>
                                <span className={cn(
                                    passwordStrength.level === 'Fraca' && 'text-red-500',
                                    passwordStrength.level === 'Média' && 'text-yellow-500',
                                    passwordStrength.level === 'Forte' && 'text-green-500'
                                )}>{translatedPasswordStrength(passwordStrength.level)}</span>
                            </div>
                            <Progress value={passwordStrength.value} className={cn("h-2", passwordStrength.color)} />
                            <p className="text-xs text-muted-foreground">
                                {t('saasUsers.dialog.strengthHint')}
                            </p>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('saasUsers.dialog.confirmPassword')}</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword || ''} onChange={handleInputChange} required={!!formData.password} />
                      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-destructive">{t('saasUsers.dialog.passwordMismatch')}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t('users.dialog.company')}</Label>
                      <Input value={selectedClient?.name || ''} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cmmsRole">{t('users.dialog.role')}</Label>
                      <Select name="cmmsRole" value={formData.cmmsRole || ''} onValueChange={(value) => handleSelectChange('cmmsRole', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder={availableRoles.length > 0 ? t('users.dialog.rolePlaceholder') : t('users.dialog.noRoles')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map(role => (
                            <SelectItem key={role.id} value={role.id} disabled={role.id === 'TECNICO' && hasReachedTechnicianLimit && !editingUser}>{role.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.cmmsRole === 'TECNICO' && hasReachedTechnicianLimit && !editingUser && (
                          <p className="text-sm text-destructive">{t('users.dialog.technicianLimitReached')}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="squad">{t('users.dialog.squad')}</Label>
                      <Input id="squad" name="squad" value={formData.squad || ''} onChange={handleInputChange} placeholder={t('users.dialog.squadPlaceholder')} />
                    </div>
                  </form>
                )}
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
              <Button type="submit" form="user-form" disabled={isSaveDisabled}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

    