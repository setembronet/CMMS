
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wrench, AlertTriangle, Users, Package } from 'lucide-react';
import { workOrders, assets, users } from '@/lib/data';
import { useI18n } from '@/hooks/use-i18n';
import type { WorkOrder, Asset, User, OrderStatus, OrderPriority } from '@/lib/types';
import { format } from 'date-fns';

const TEST_CLIENT_ID = 'client-01';

export default function DashboardCmmsPage() {
  const { t } = useI18n();

  // --- Dynamic Data Calculation for CMMS ---
  const clientWorkOrders = workOrders.filter(wo => wo.clientId === TEST_CLIENT_ID);
  const clientAssets = assets.filter(a => a.clientId === TEST_CLIENT_ID);
  const clientUsers = users.filter(u => u.clientId === TEST_CLIENT_ID);

  const openWorkOrders = clientWorkOrders.filter(wo => wo.status === 'ABERTO' || wo.status === 'EM ANDAMENTO');
  const urgentWorkOrders = clientWorkOrders.filter(wo => wo.priority === 'Urgente' && wo.status !== 'CONCLUIDO' && wo.status !== 'CANCELADO');
  const assetsInMaintenance = clientAssets.filter(asset => 
    clientWorkOrders.some(wo => wo.assetId === asset.id && (wo.status === 'ABERTO' || wo.status === 'EM ANDAMENTO'))
  );
  const activeTechnicians = clientUsers.filter(u => u.cmmsRole === 'TECNICO');

  const recentActivities = [...clientWorkOrders]
    .sort((a, b) => b.creationDate - a.creationDate)
    .slice(0, 5);
  
  const getAssetName = (id: string) => assets.find(a => a.id === id)?.name || 'N/A';

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'ABERTO': return 'secondary';
      case 'EM ANDAMENTO': return 'default';
      case 'CONCLUIDO': return 'outline';
      case 'CANCELADO': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const formatDate = (timestamp?: number) => timestamp ? format(new Date(timestamp), 'dd/MM/yyyy') : 'N/A';

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">{t('cmmsDashboard.title')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cmmsDashboard.openWorkOrders')}</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openWorkOrders.length}</div>
            <p className="text-xs text-muted-foreground">{t('cmmsDashboard.totalOpen')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cmmsDashboard.urgentAlerts')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{urgentWorkOrders.length}</div>
            <p className="text-xs text-muted-foreground">{t('cmmsDashboard.urgentPriority')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cmmsDashboard.assetsInMaintenance')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetsInMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">{t('cmmsDashboard.currentlyInIntervention')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cmmsDashboard.activeTechnicians')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTechnicians.length}</div>
             <p className="text-xs text-muted-foreground">{t('cmmsDashboard.availableTeam')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cmmsDashboard.recentActivity')}</CardTitle>
          <CardDescription>{t('cmmsDashboard.latestWorkOrders')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('workOrders.title')}</TableHead>
                <TableHead>{t('assets.title')}</TableHead>
                <TableHead>{t('workOrders.priority')}</TableHead>
                <TableHead>{t('workOrders.creationDate')}</TableHead>
                <TableHead>{t('workOrders.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.title}</TableCell>
                  <TableCell>{getAssetName(order.assetId)}</TableCell>
                  <TableCell>{order.priority}</TableCell>
                   <TableCell>{formatDate(order.creationDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
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
