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
import { Switch } from '@/components/ui/switch';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { plans as initialPlans } from '@/lib/data';
import type { Plan } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const emptyPlan: Plan = {
  id: '',
  name: '',
  assetLimit: 0,
  technicianUserLimit: 0,
  hasMultiModuleAccess: false,
  hasBasicBigQueryAccess: false,
  hasIaAddonAccess: false,
  hasIotAddonAccess: false,
};

export default function PlansPage() {
  const [plans, setPlans] = React.useState<Plan[]>(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [formData, setFormData] = React.useState<Plan>(emptyPlan);

  const openDialog = (plan: Plan | null = null) => {
    setEditingPlan(plan);
    setFormData(plan || emptyPlan);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingPlan(null);
    setIsDialogOpen(false);
    setFormData(emptyPlan);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
    }));
  };
  
  const handleSwitchChange = (name: keyof Plan, checked: boolean) => {
    setFormData(prev => ({...prev, [name]: checked }));
  }

  const handleSavePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newPlan: Plan = {
      ...formData,
      id: editingPlan?.id || `plan_${formData.name.toLowerCase().replace(' ', '_')}`,
    };

    if (editingPlan) {
      setPlans(plans.map(p => (p.id === newPlan.id ? newPlan : p)));
    } else {
      setPlans([newPlan, ...plans]);
    }
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gerenciamento de Planos</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Plano</TableHead>
              <TableHead>Limite de Ativos</TableHead>
              <TableHead>Limite de Técnicos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map(plan => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{plan.assetLimit === -1 ? 'Ilimitado' : plan.assetLimit}</TableCell>
                <TableCell>{plan.technicianUserLimit === -1 ? 'Ilimitado' : plan.technicianUserLimit}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(plan)}>
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Atualize os detalhes do plano.' : 'Preencha os detalhes do novo plano.'}
            </DialogDescription>
          </DialogHeader>
          <div className='flex-grow overflow-y-auto -mx-6 px-6'>
            <form onSubmit={handleSavePlan} id="plan-form" className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Plano</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetLimit">Limite de Ativos</Label>
                  <Input id="assetLimit" name="assetLimit" type="number" value={formData.assetLimit} onChange={handleInputChange} required placeholder="-1 para ilimitado"/>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="technicianUserLimit">Limite de Técnicos</Label>
                  <Input id="technicianUserLimit" name="technicianUserLimit" type="number" value={formData.technicianUserLimit} onChange={handleInputChange} required placeholder="-1 para ilimitado"/>
                </div>
              </div>

              <Separator />

              <h3 className="text-lg font-medium">Permissões do Plano</h3>
              <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                          <Label>Acesso Multi-Módulo</Label>
                          <p className="text-xs text-muted-foreground">Permite acesso a diferentes módulos de ativos.</p>
                      </div>
                      <Switch name="hasMultiModuleAccess" checked={formData.hasMultiModuleAccess} onCheckedChange={(checked) => handleSwitchChange('hasMultiModuleAccess', checked)} />
                  </div>
                   <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                          <Label>Acesso Básico ao BigQuery</Label>
                          <p className="text-xs text-muted-foreground">Permite consultas básicas no BigQuery.</p>
                      </div>
                      <Switch name="hasBasicBigQueryAccess" checked={formData.hasBasicBigQueryAccess} onCheckedChange={(checked) => handleSwitchChange('hasBasicBigQueryAccess', checked)} />
                  </div>
                   <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                          <Label>Acesso ao Add-on de IA</Label>
                          <p className="text-xs text-muted-foreground">Habilita as funcionalidades do módulo de IA.</p>
                      </div>
                      <Switch name="hasIaAddonAccess" checked={formData.hasIaAddonAccess} onCheckedChange={(checked) => handleSwitchChange('hasIaAddonAccess', checked)} />
                  </div>
                   <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                          <Label>Acesso ao Add-on de IoT</Label>
                          <p className="text-xs text-muted-foreground">Habilita as funcionalidades do módulo de IoT.</p>
                      </div>
                      <Switch name="hasIotAddonAccess" checked={formData.hasIotAddonAccess} onCheckedChange={(checked) => handleSwitchChange('hasIotAddonAccess', checked)} />
                  </div>
              </div>

            </form>
          </div>
          <DialogFooter className="pt-4 mt-auto border-t bg-background -mx-6 px-6 pb-6 sticky bottom-0">
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="plan-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
