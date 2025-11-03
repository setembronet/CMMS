
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
import { useI18n } from '@/hooks/use-i18n';

const emptyPlan: Plan = {
  id: '',
  name: '',
  price: 0,
  assetLimit: 0,
  technicianUserLimit: 0,
  hasMultiModuleAccess: false,
  hasBasicBigQueryAccess: false,
  hasIaAddonAccess: false,
  hasIotAddonAccess: false,
};

export default function PlansPage() {
  const { t } = useI18n();
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
        <h1 className="text-3xl font-bold font-headline">{t('plans.title')}</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('plans.new')}
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('plans.table.name')}</TableHead>
              <TableHead>{t('plans.table.monthlyValue')}</TableHead>
              <TableHead>{t('plans.table.assetLimit')}</TableHead>
              <TableHead>{t('plans.table.technicianLimit')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map(plan => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>R$ {plan.price.toLocaleString('pt-BR')}</TableCell>
                <TableCell>{plan.assetLimit === -1 ? t('plans.unlimited') : plan.assetLimit}</TableCell>
                <TableCell>{plan.technicianUserLimit === -1 ? t('plans.unlimited') : plan.technicianUserLimit}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.openMenu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(plan)}>
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingPlan ? t('plans.dialog.editTitle') : t('plans.dialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {editingPlan ? t('plans.dialog.editDescription') : t('plans.dialog.newDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePlan} id="plan-form" className="flex-1 overflow-y-auto -mx-6 px-6">
            <ScrollArea className="h-full pr-6">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="name">{t('plans.dialog.name')}</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="price">{t('plans.dialog.monthlyValue')}</Label>
                      <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetLimit">{t('plans.dialog.assetLimit')}</Label>
                    <Input id="assetLimit" name="assetLimit" type="number" value={formData.assetLimit} onChange={handleInputChange} required placeholder={t('plans.dialog.limitPlaceholder')}/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="technicianUserLimit">{t('plans.dialog.technicianLimit')}</Label>
                    <Input id="technicianUserLimit" name="technicianUserLimit" type="number" value={formData.technicianUserLimit} onChange={handleInputChange} required placeholder={t('plans.dialog.limitPlaceholder')}/>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-medium">{t('plans.dialog.permissions')}</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>{t('plans.dialog.multiModule')}</Label>
                            <p className="text-xs text-muted-foreground">{t('plans.dialog.multiModuleDescription')}</p>
                        </div>
                        <Switch name="hasMultiModuleAccess" checked={formData.hasMultiModuleAccess} onCheckedChange={(checked) => handleSwitchChange('hasMultiModuleAccess', checked)} />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>{t('plans.dialog.bigQuery')}</Label>
                            <p className="text-xs text-muted-foreground">{t('plans.dialog.bigQueryDescription')}</p>
                        </div>
                        <Switch name="hasBasicBigQueryAccess" checked={formData.hasBasicBigQueryAccess} onCheckedChange={(checked) => handleSwitchChange('hasBasicBigQueryAccess', checked)} />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>{t('plans.dialog.iaAddon')}</Label>
                            <p className="text-xs text-muted-foreground">{t('plans.dialog.iaAddonDescription')}</p>
                        </div>
                        <Switch name="hasIaAddonAccess" checked={formData.hasIaAddonAccess} onCheckedChange={(checked) => handleSwitchChange('hasIaAddonAccess', checked)} />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>{t('plans.dialog.iotAddon')}</Label>
                            <p className="text-xs text-muted-foreground">{t('plans.dialog.iotAddonDescription')}</p>
                        </div>
                        <Switch name="hasIotAddonAccess" checked={formData.hasIotAddonAccess} onCheckedChange={(checked) => handleSwitchChange('hasIotAddonAccess', checked)} />
                    </div>
                </div>

              </div>
            </ScrollArea>
          </form>
          <DialogFooter className="pt-4 mt-auto border-t -mx-6 px-6 pb-6 sticky bottom-0 bg-background">
            <Button type="button" variant="outline" onClick={closeDialog}>{t('common.cancel')}</Button>
            <Button type="submit" form="plan-form">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
