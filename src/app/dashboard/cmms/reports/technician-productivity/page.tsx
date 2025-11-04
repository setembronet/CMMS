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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Gauge, ListChecks, Timer, User } from 'lucide-react';
import type { WorkOrder, User } from '@/lib/types';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { useCollection } from '@/firebase/firestore';
import { format, subDays, differenceInHours } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type TechnicianProductivityData = {
  technician: User;
  completedWos: number;
  pendingWos: number;
  avgMttrHours: number | null;
  totalHoursOnWos: number;
  utilizationRate: number | null;
};

type SortDescriptor = {
  column: keyof TechnicianProductivityData | 'technician.name';
  direction: 'ascending' | 'descending';
};

export default function TechnicianProductivityReportPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();

  const { data: workOrders, loading: workOrdersLoading } = useCollection<WorkOrder>('workOrders');
  const { data: users, loading: usersLoading } = useCollection<User>('users');
  
  const [productivityData, setProductivityData] = React.useState<TechnicianProductivityData[]>([]);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({ column: 'avgMttrHours', direction: 'ascending' });

  const isLoading = workOrdersLoading || usersLoading;

  React.useEffect(() => {
    if (isLoading || !selectedClient) return;

    const thirtyDaysAgo = subDays(new Date(), 30).getTime();
    const workingDaysInLast30Days = 22; // Approximation
    const totalAvailableHours = workingDaysInLast30Days * 8;

    const clientTechnicians = users.filter(
      (u) => u.clientId === selectedClient.id && u.cmmsRole === 'TECNICO'
    );

    const clientWorkOrders = workOrders.filter(
      (wo) => wo.clientId === selectedClient.id && wo.creationDate >= thirtyDaysAgo
    );

    const data: TechnicianProductivityData[] = clientTechnicians.map((tech) => {
      const techWos = clientWorkOrders.filter((wo) => wo.responsibleId === tech.id);
      const completedWos = techWos.filter((wo) => wo.status === 'CONCLUIDO');
      const pendingWos = techWos.filter((wo) => wo.status !== 'CONCLUIDO' && wo.status !== 'CANCELADO');

      const totalResolutionHours = completedWos.reduce((acc, wo) => {
        if (wo.startDate && wo.endDate) {
          return acc + differenceInHours(new Date(wo.endDate), new Date(wo.startDate));
        }
        return acc;
      }, 0);
      
      const avgMttrHours = completedWos.length > 0 ? totalResolutionHours / completedWos.length : null;

      const utilizationRate = totalAvailableHours > 0 ? (totalResolutionHours / totalAvailableHours) * 100 : null;

      return {
        technician: tech,
        completedWos: completedWos.length,
        pendingWos: pendingWos.length,
        avgMttrHours,
        totalHoursOnWos: totalResolutionHours,
        utilizationRate,
      };
    });

    setProductivityData(data);
  }, [isLoading, selectedClient, workOrders, users]);
  
  const sortedData = React.useMemo(() => {
    if (!sortDescriptor) return productivityData;

    return [...productivityData].sort((a, b) => {
      let first: any;
      let second: any;
      
      if (sortDescriptor.column === 'technician.name') {
        first = a.technician.name;
        second = b.technician.name;
      } else {
        first = a[sortDescriptor.column as keyof TechnicianProductivityData];
        second = b[sortDescriptor.column as keyof TechnicianProductivityData];
      }
      
      // Handle nulls: null values are always considered 'larger' (pushed to the end when ascending)
      if (first === null) return 1;
      if (second === null) return -1;
      
      let cmp = (first < second) ? -1 : (first > second) ? 1 : 0;
      
      if (sortDescriptor.direction === 'descending') {
          cmp *= -1;
      }

      return cmp;
    });

  }, [productivityData, sortDescriptor]);

  const requestSort = (column: keyof TechnicianProductivityData | 'technician.name') => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortDescriptor && sortDescriptor.column === column && sortDescriptor.direction === 'ascending') {
          direction = 'descending';
      }
      setSortDescriptor({ column, direction });
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>;
  }
  
  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">{t('users.selectClientPrompt')}</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Relatório de Produtividade dos Técnicos</h1>
         <Badge>Últimos 30 Dias</Badge>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Análise de Desempenho</CardTitle>
          <CardDescription>
            Este relatório mostra o desempenho da equipe técnica, consolidando dados de Ordens de Serviço dos últimos 30 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('technician.name')} className="px-1">
                        <User className="mr-2 h-4 w-4" />
                        Técnico
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </TableHead>
                <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('completedWos')} className="px-1">
                        <ListChecks className="mr-2 h-4 w-4" />
                        OS Concluídas / Pendentes
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </TableHead>
                 <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('avgMttrHours')} className="px-1">
                        <Timer className="mr-2 h-4 w-4" />
                        MTTR (Horas)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </TableHead>
                <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('utilizationRate')} className="px-1">
                        <Gauge className="mr-2 h-4 w-4" />
                        Taxa de Utilização
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map(({ technician, completedWos, pendingWos, avgMttrHours, utilizationRate }) => (
                <TableRow key={technician.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={technician.avatarUrl} alt={technician.name} />
                            <AvatarFallback>{technician.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{technician.name}</div>
                            <div className="text-sm text-muted-foreground">{technician.squad || 'Sem equipe'}</div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{completedWos} Concluídas</Badge>
                        <Badge variant="secondary">{pendingWos} Pendentes</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {avgMttrHours !== null ? `${avgMttrHours.toFixed(2)}h` : 'N/A'}
                  </TableCell>
                  <TableCell>
                     {utilizationRate !== null ? `${utilizationRate.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
