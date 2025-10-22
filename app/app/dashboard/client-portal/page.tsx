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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Building, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import { assets, workOrders, customerLocations, users, setWorkOrders } from '@/lib/data';
import type { Asset, WorkOrder, OrderStatus, OrderPriority } from '@/lib/types';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/dashboard/user-nav';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const symptoms = [
    { value: 'Ruído Anormal', label: 'Ruído Anormal' },
    { value: 'Falha Elétrica', label: 'Falha Elétrica' },
    { value: 'Vibração Excessiva', label: 'Vibração Excessiva' },
    { value: 'Parada entre Andares', label: 'Parada entre Andares' },
    { value: 'Porta não Abre/Fecha', label: 'Porta não Abre/Fecha' },
    { value: 'Outro', label: 'Outro (descrever)' },
];

const urgencyLevels: { value: OrderPriority, label: string }[] = [
    { value: 'Média', label: 'Normal' },
    { value: 'Alta', label: 'Alta Prioridade' },
    { value: 'Urgente', label: 'CRÍTICO - Equipamento Parado' },
];

export default function ClientPortalPage() {
  const { currentUser } = useClient();
  const { t } = useI18n();
  const [isNewWoDialogOpen, setIsNewWoDialogOpen] = React.useState(false);
  const [newWoFormData, setNewWoFormData] = React.useState<Partial<WorkOrder>>({});

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

    const userLoc = customerLocations.find(loc => (loc.contacts || []).some(c => c.email === currentUser.email));
    const finalUserLocation = userLoc || customerLocations.find(loc => loc.clientId === currentUser.clientId);

    if (!finalUserLocation) {
        return { userLocation: null, locationAssets: [], openWorkOrders: [], recentWorkOrders: [], criticalAssets: 0 };
    }
    
    const locAssets = assets.filter(a => a.customerLocationId === finalUserLocation.id);
    const assetIds = locAssets.map(a => a.id);
    const locWorkOrders = workOrders.filter(wo => assetIds.includes(wo.assetId));
    
    const openWos = locWorkOrders.filter(wo => ['ABERTO', 'EM ANDAMENTO', 'EM_ESPERA_PECAS'].includes(wo.status));
    const recentWos = locWorkOrders.filter(wo => wo.status === 'CONCLUIDO').sort((a,b) => (b.endDate || 0) - (a.endDate || 0)).slice(0, 5);
    const critAssets = locAssets.filter(asset => openWos.some(wo => wo.assetId === asset.id && wo.priority === 'Urgente')).length;

    return { userLocation: finalUserLocation, locationAssets: locAssets, openWorkOrders: openWos, recentWorkOrders: recentWos, criticalAssets: critAssets };

  }, [currentUser]);

  const openNewWoDialog = () => {
    if (!userLocation || !currentUser) return;
    setNewWoFormData({
        clientId: userLocation.clientId,
        status: 'ABERTO',
        priority: 'Média',
        createdByUserId: currentUser.id,
    });
    setIsNewWoDialogOpen(true);
  };
  
  const handleNewWoFormChange = (field: keyof WorkOrder, value: any) => {
    setNewWoFormData(prev => ({...prev, [field]: value}));
  };

  const handleNewWoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newWoFormData.assetId || !newWoFormData.title || !newWoFormData.description) {
        // In a real app, you'd show a toast here
        console.error("Missing required fields");
        return;
    }

    const finalWo: WorkOrder = {
        ...newWoFormData,
        id: `os-${Date.now()}`,
        creationDate: new Date().getTime(),
    } as WorkOrder;

    setWorkOrders([finalWo, ...workOrders]);
    setIsNewWoDialogOpen(false);
    setNewWoFormData({});
  };

  const getAssetName = (assetId: string) => assets.find(a => a.id === assetId)?.name || 'N/A';
  const getTechnicianName = (techId?: string) => users.find(u => u.id === techId)?.name || 'Aguardando';

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'ABERTO': return <Badge variant="secondary">{status}</Badge>;
      case 'EM ANDAMENTO': return <Badge>{status}</Badge>;
      case 'CONCLUIDO': return <Badge variant="outline" className="text-green-600 border-green-600">{status}</Badge>;
      default: return <Badge variant="destructive">{status.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <>
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
                  <Button size="lg" onClick={openNewWoDialog}>
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

      <Dialog open={isNewWoDialogOpen} onOpenChange={setIsNewWoDialogOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Solicitar Novo Serviço</DialogTitle>
                  <DialogDescription>
                      Descreva o problema que você está enfrentando. Nossa equipe responderá em breve.
                  </DialogDescription>
              </DialogHeader>
              <form id="new-wo-form" onSubmit={handleNewWoSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="assetId">Ativo</Label>
                      <Select name="assetId" onValueChange={(v) => handleNewWoFormChange('assetId', v)} required>
                          <SelectTrigger>
                              <SelectValue placeholder="Selecione o equipamento com problema" />
                          </SelectTrigger>
                          <SelectContent>
                              {locationAssets.map(asset => <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="symptom">Sintoma Observado</Label>
                      <Select name="symptom" onValueChange={(v) => handleNewWoFormChange('description', v)} required>
                          <SelectTrigger>
                              <SelectValue placeholder="O que está acontecendo?" />
                          </SelectTrigger>
                          <SelectContent>
                              {symptoms.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="priority">Nível de Urgência</Label>
                      <Select name="priority" onValueChange={(v) => handleNewWoFormChange('priority', v as OrderPriority)} defaultValue="Média" required>
                          <SelectTrigger>
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              {urgencyLevels.map(ul => <SelectItem key={ul.value} value={ul.value}>{ul.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="title">Título do Chamado</Label>
                      <Input id="title" name="title" onChange={(e) => handleNewWoFormChange('title', e.target.value)} placeholder="Título curto do problema" required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="description">Descrição Detalhada</Label>
                      <Textarea id="description" name="description" onChange={(e) => handleNewWoFormChange('description', e.target.value)} placeholder="Forneça mais detalhes sobre o problema, se necessário." />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="media">Fotos ou Vídeos</Label>
                      <Input id="media" type="file" />
                      <p className="text-xs text-muted-foreground">Anexar uma foto ou vídeo pode nos ajudar a entender melhor o problema.</p>
                  </div>
              </form>
              <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsNewWoDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" form="new-wo-form">Abrir Chamado</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
