
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
import { PlusCircle, Building, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { assets, workOrders, customerLocations, users } from '@/lib/data';
import type { Asset, WorkOrder, OrderStatus } from '@/lib/types';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/dashboard/user-nav';

export default function ClientPortalPage() {
  const { currentUser } = useClient();
  const { t } = useI18n();

  const {
      userLocation,
      locationAssets,
      openWorkOrders,
      recentWorkOrders,
      criticalAssets,
  } = React.useMemo(() => {
    if (!currentUser) {
        return { userLocation: null, locationAssets: [], openWorkOrders: [], recentWorkOrders: [], criticalAssets: 0 };
    }

    // Find the location this user belongs to (a real app would have this link directly)
    const userLocation = customerLocations.find(loc => 
        (loc.contacts || []).some(c => c.email === currentUser.email)
    );

    if (!userLocation) {
        // Fallback for demo: find first location of the client
        const firstLocation = customerLocations.find(loc => loc.clientId === currentUser.clientId);
        if (!firstLocation) return { userLocation: null, locationAssets: [], openWorkOrders: [], recentWorkOrders: [], criticalAssets: 0 };
        
        const locationAssets = assets.filter(a => a.customerLocationId === firstLocation.id);
        const assetIds = locationAssets.map(a => a.id);
        const locationWorkOrders = workOrders.filter(wo => assetIds.includes(wo.assetId));
        
        const openWorkOrders = locationWorkOrders.filter(wo => ['ABERTO', 'EM ANDAMENTO', 'EM_ESPERA_PECAS'].includes(wo.status));
        const recentWorkOrders = locationWorkOrders.filter(wo => wo.status === 'CONCLUIDO').sort((a,b) => (b.endDate || 0) - (a.endDate || 0)).slice(0, 5);
        const criticalAssets = locationAssets.filter(asset => openWorkOrders.some(wo => wo.assetId === asset.id && wo.priority === 'Urgente')).length;

        return { userLocation: firstLocation, locationAssets, openWorkOrders, recentWorkOrders, criticalAssets };
    }
    
    const locationAssets = assets.filter(a => a.customerLocationId === userLocation.id);
    const assetIds = locationAssets.map(a => a.id);
    const locationWorkOrders = workOrders.filter(wo => assetIds.includes(wo.assetId));
    
    const openWorkOrders = locationWorkOrders.filter(wo => ['ABERTO', 'EM ANDAMENTO', 'EM_ESPERA_PECAS'].includes(wo.status));
    const recentWorkOrders = locationWorkOrders.filter(wo => wo.status === 'CONCLUIDO').sort((a,b) => (b.endDate || 0) - (a.endDate || 0)).slice(0, 5);
    const criticalAssets = locationAssets.filter(asset => openWorkOrders.some(wo => wo.assetId === asset.id && wo.priority === 'Urgente')).length;

    return { userLocation, locationAssets, openWorkOrders, recentWorkOrders, criticalAssets };

  }, [currentUser]);

  const getAssetName = (assetId: string) => assets.find(a => a.id === assetId)?.name || 'N/A';
  const getTechnicianName = (techId?: string) => users.find(u => u.id === techId)?.name || 'Aguardando';

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'ABERTO': return <Badge variant="secondary">{status}</Badge>;
      case 'EM ANDAMENTO': return <Badge>{status}</Badge>;
      case 'CONCLUIDO': return <Badge variant="outline" className="text-green-600 border-green-600">{status}</Badge>;
      default: return <Badge variant="destructive">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <Logo />
             <div className="flex w-full items-center justify-end gap-4">
                <ThemeToggle />
                <UserNav />
            </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Portal do Cliente</h1>
                    <p className="text-muted-foreground">Bem-vindo, {currentUser?.name}. Aqui você acompanha tudo sobre seus ativos.</p>
                </div>
                <Button size="lg">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Solicitar Serviço
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{locationAssets.length}</div>
                        <p className="text-xs text-muted-foreground">Equipamentos sob nosso cuidado.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openWorkOrders.length}</div>
                        <p className="text-xs text-muted-foreground">Serviços em andamento ou aguardando.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ativos em Alerta</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{criticalAssets}</div>
                        <p className="text-xs text-muted-foreground">Equipamentos com chamados urgentes.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contrato</CardTitle>
                         <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userLocation?.contractStatus || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">Status do seu contrato de manutenção.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Acompanhamento de Ordens de Serviço</CardTitle>
                    <CardDescription>Veja o andamento dos chamados abertos e os últimos concluídos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ativo</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {openWorkOrders.map(wo => (
                                <TableRow key={`open-${wo.id}`}>
                                    <TableCell className="font-medium">{getAssetName(wo.assetId)}</TableCell>
                                    <TableCell>{wo.title}</TableCell>
                                    <TableCell>{getTechnicianName(wo.responsibleId)}</TableCell>
                                    <TableCell>{getStatusBadge(wo.status)}</TableCell>
                                </TableRow>
                            ))}
                             {recentWorkOrders.map(wo => (
                                <TableRow key={`recent-${wo.id}`} className="bg-muted/30">
                                    <TableCell className="font-medium text-muted-foreground">{getAssetName(wo.assetId)}</TableCell>
                                    <TableCell className="text-muted-foreground">{wo.title}</TableCell>
                                    <TableCell className="text-muted-foreground">{getTechnicianName(wo.responsibleId)}</TableCell>
                                    <TableCell>{getStatusBadge(wo.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </main>
    </div>
  );
}
