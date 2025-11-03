
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Company, Plan, Addon } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { useCollection } from '@/firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';


export default function SubscriptionsPage() {
  const { t } = useI18n();
  const { data: companies, loading: companiesLoading } = useCollection<Company>('companies');
  const { data: plans, loading: plansLoading } = useCollection<Plan>('plans');
  const { data: addons, loading: addonsLoading } = useCollection<Addon>('addons');

  const calculateMrr = (company: Company): number => {
    if (!plans || !addons) return 0;
    const plan = plans.find(p => p.id === company.planId);
    const planPrice = plan?.price || 0;

    const addonsPrice = (company.activeAddons || []).reduce((addonTotal, addonId) => {
        const addon = addons.find(a => a.id === addonId);
        return addonTotal + (addon?.price || 0);
    }, 0);

    return planPrice + addonsPrice;
  };
  
  const isLoading = companiesLoading || plansLoading || addonsLoading;

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.subscriptions')}</h1>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('companies.name')}</TableHead>
              <TableHead>{t('sidebar.plans')}</TableHead>
              <TableHead>{t('sidebar.addons')}</TableHead>
              <TableHead className="text-right">{t('finance.mrr')}</TableHead>
              <TableHead className="w-[50px] text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Carregando assinaturas...
                </TableCell>
              </TableRow>
            ) : companies.map(company => {
              const plan = plans.find(p => p.id === company.planId);
              const mrr = calculateMrr(company);

              return (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan?.name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    {(company.activeAddons || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {company.activeAddons.map(addonId => {
                          const addon = addons.find(a => a.id === addonId);
                          return <Badge key={addonId} variant="secondary">{addon?.name || 'N/A'}</Badge>;
                        })}
                      </div>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-medium">R$ {mrr.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('common.openMenu')}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                           <Link href="/dashboard/companies">
                            {t('common.edit')}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
