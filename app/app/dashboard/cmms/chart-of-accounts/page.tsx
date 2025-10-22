
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
import { Button } from '@/components/ui/button';
import { chartOfAccounts as initialData } from '@/lib/data';
import type { ChartOfAccount } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';


export default function ChartOfAccountsPage() {
  const { t } = useI18n();
  const [accounts, setAccounts] = React.useState<ChartOfAccount[]>(initialData);

  const getAccountTypeBadge = (type: ChartOfAccount['type']) => {
    switch (type) {
      case 'RECEITA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'CUSTO':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'DESPESA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  const sortedAccounts = React.useMemo(() => {
    return accounts.sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts]);
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.chartOfAccounts')}</h1>
         <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('common.new')}
        </Button>
      </div>
       <p className="text-muted-foreground">
        Esta é a estrutura contábil que categoriza todas as transações financeiras da sua empresa.
      </p>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Código</TableHead>
              <TableHead>Nome da Conta</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAccounts.map(account => (
              <TableRow key={account.id} className={cn(account.isGroup && 'bg-muted/50')}>
                <TableCell className={cn("font-mono", account.isGroup ? 'font-bold' : `pl-${4 + (account.code.split('.').length - 1) * 4}`)}>
                    {account.code}
                </TableCell>
                <TableCell className={cn(account.isGroup && 'font-bold')}>
                    {account.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('border', getAccountTypeBadge(account.type))}>
                    {account.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
