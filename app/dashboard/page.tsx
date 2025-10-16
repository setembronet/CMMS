'use client';
import * as React from 'react';
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
import { Button } from '@/components/ui/button';
import { Wrench, AlertTriangle, Users, Package, CalendarCheck, CheckCircle, Play } from 'lucide-react';
import { workOrders, assets, users, customerLocations } from '@/lib/data';
import { useI18n } from '@/hooks/use-i18n';
import type { WorkOrder, Asset, User, OrderStatus, OrderPriority } from '@/lib/types';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { useClient } from '@/context/client-provider';
import { useRouter } from 'next/navigation';

function ManagerDashboard() {
  const { t } = useI18n();
  const { selectedClient } = useClient();

  const {
    openWorkOrders,
    urgentWorkOrders,
    assetsInMaintenance,
    activeTechnicians,
    recentActivities,
  } = React.useMemo(() => {
    if (!selectedClient) {
      return { openWorkOrders: [], urgentWorkOrders: [], assetsInMaintenance: [], activeTechnicians: [], recentActivities: [] };
    }
    const clientWorkOrders = workOrders.filter(wo => wo.clientId === selectedClient.id);
    const clientAssets = assets.filter(a => a.clientId === selectedClient.id);
    const clientUsers = users.filter(u => u.clientId === selectedClient.id);

    const openWorkOrders = clientWorkOrders.filter(wo => wo.status === 'ABERTO' || wo.status === 'EM ANDAMENTO');
    const urgentWorkOrders = clientWorkOrders.filter(wo => wo.priority === 'Urgente' && wo.status !== 'CONCLUIDO' && wo.status !== 'CANCELADO');
    const assetsInMaintenance = clientAssets.filter(asset => 
      clientWorkOrders.some(wo => wo.assetId === asset.id && (wo.status === 'ABERTO' || wo.status === 'EM ANDAMENTO'))
    );
    const activeTechnicians = clientUsers.filter(u => u.cmmsRole === 'TECNICO');

    const recentActivities = [...clientWorkOrders]
      .sort((a, b) => b.creationDate - a.creationDate)
      .slice(0, 5);
      
    return { openWorkOrders, urgentWorkOrders, assetsInMaintenance, activeTechnicians, recentActivities };
  }, [selectedClient]);
  
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

  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold font-headline mb-4">{t('sidebar.dashboard')}</h1>
            <p className="text-muted-foreground">{t('cmmsDashboard.selectClientPrompt')}</p>
        </div>
    )
  }

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
                <TableHead>{t('workOrders.table.title')}</TableHead>
                <TableHead>{t('assets.title')}</TableHead>
                <TableHead>{t('workOrders.table.priority')}</TableHead>
                <TableHead>{t('workOrders.table.creationDate')}</TableHead>
                <TableHead>{t('workOrders.table.status')}</TableHead>
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


function TechnicianDashboard() {
  const { t } = useI18n();
  const { currentUser } = useClient();
  const router = useRouter();

  const {
    myOpenWos,
    scheduledForToday,
    completedThisWeek,
    upcomingWos
  } = React.useMemo(() => {
    if (!currentUser) return { myOpenWos: 0, scheduledForToday: 0, completedThisWeek: 0, upcomingWos: [] };
    
    const myWorkOrders = workOrders.filter(wo => wo.responsibleId === currentUser.id);
    
    const myOpenWos = myWorkOrders.filter(wo => wo.status === 'ABERTO' || wo.status === 'EM ANDAMENTO').length;
    
    const scheduledForToday = myWorkOrders.filter(wo => wo.scheduledDate && isToday(new Date(wo.scheduledDate))).length;

    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const completedThisWeek = myWorkOrders.filter(wo => 
      wo.status === 'CONCLUIDO' &&
      wo.endDate &&
      wo.endDate >= startOfThisWeek.getTime() &&
      wo.endDate <= endOfThisWeek.getTime()
    ).length;

    const upcomingWos = myWorkOrders
      .filter(wo => wo.status === 'ABERTO' || wo.status === 'EM ANDAMENTO')
      .sort((a,b) => (a.scheduledDate || a.creationDate) - (b.scheduledDate || b.creationDate))
      .slice(0, 10);

    return { myOpenWos, scheduledForToday, completedThisWeek, upcomingWos };
  }, [currentUser]);

  const getAssetName = (id: string) => assets.find(a => a.id === id)?.name || 'N/A';
  const getCustomerLocationName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return 'N/A';
    const location = customerLocations.find(loc => loc.id === asset.customerLocationId);
    return location?.name || 'N/A';
  };
   const formatDate = (timestamp?: number) => timestamp ? format(new Date(timestamp), 'dd/MM/yyyy') : 'N/A';


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Olá, {currentUser?.name.split(' ')[0]}!</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas OS Abertas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myOpenWos}</div>
            <p className="text-xs text-muted-foreground">Ordens aguardando sua ação.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas para Hoje</CardTitle>
            <CalendarCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledForToday}</div>
            <p className="text-xs text-muted-foreground">Serviços programados para o dia.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas esta Semana</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisWeek}</div>
            <p className="text-xs text-muted-foreground">OS finalizadas desde segunda-feira.</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Próximas Ordens de Serviço</CardTitle>
          <CardDescription>Suas próximas tarefas atribuídas, ordenadas por data.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              {upcomingWos.length > 0 ? upcomingWos.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{order.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {getAssetName(order.assetId)} - {getCustomerLocationName(order.assetId)}
                    </p>
                     <p className="text-xs text-muted-foreground">
                      Agendado para: {formatDate(order.scheduledDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge variant={order.priority === 'Urgente' ? 'destructive' : 'outline'}>{order.priority}</Badge>
                     <Button size="sm" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                        <Play className="mr-2 h-4 w-4"/>
                        Iniciar
                     </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  Você não tem ordens de serviço pendentes. Bom trabalho!
                </div>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function DashboardPage() {
  const { currentUser } = useClient();
  const isTechnician = currentUser?.cmmsRole === 'TECNICO';

  return isTechnician ? <TechnicianDashboard /> : <ManagerDashboard />;
}
