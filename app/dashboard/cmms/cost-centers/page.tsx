
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
import { costCenters as initialData } from '@/lib/data';
import type { CostCenter } from '@/lib/types';
import { useI18n } from '@/hooks/use-i18n';
import { PlusCircle } from 'lucide-react';

export default function CostCentersPage() {
  const { t } = useI18n();
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>(initialData);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.costCenters')}</h1>
        <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('common.new')}
        </Button>
      </div>
      <p className="text-muted-foreground">
        Centros de custo agrupam despesas por departamento ou área, ajudando a entender para onde o dinheiro está indo.
      </p>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Centro de Custo</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters.map(center => (
              <TableRow key={center.id}>
                <TableCell className="font-medium">{center.name}</TableCell>
                <TableCell className="text-muted-foreground">{center.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    