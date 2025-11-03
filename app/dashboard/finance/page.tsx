
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
import { DollarSign, AlertCircle, Users } from 'lucide-react';
import { 
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
    Pie,
    Cell,
    PieChart,
} from 'recharts';
import { useI18n } from '@/hooks/use-i18n';
import * as React from 'react';
import { useCollection } from '@/firebase/firestore';
import type { Company, CustomerLocation, Plan, Addon } from '@/lib/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

type OverdueInvoice = {
    id: string;
    companyId: string;
    customerLocationId: string;
    dueDate: string;
    totalValue: number;
}


export default function FinanceDashboardPage() {
  const { t } = useI18n();

  const { data: companies, loading: companiesLoading } = useCollection<Company>('companies');
  const { data: customerLocations, loading: locationsLoading } = useCollection<CustomerLocation>('customerLocations');
  const { data: plans, loading: plansLoading } = useCollection<Plan>('plans');
  const { data: addons, loading: addonsLoading } = useCollection<Addon>('addons');
  // Mocking KPIs for now, as it's not a collection
  const [kpis, setKpis] = React.useState<{ overdueInvoices: OverdueInvoice[] }>({ overdueInvoices: [] });


  const {
      activeClients,
      totalMrr,
      overdueValue,
      activeClientsCount,
      mrrData,
      revenueByModuleData,
      overdueInvoices
  } = React.useMemo(() => {
    if (companiesLoading || plansLoading || addonsLoading) {
        return { activeClients: [], totalMrr: 0, overdueValue: 0, activeClientsCount: 0, mrrData: [], revenueByModuleData: [], overdueInvoices: [] };
    }
    
    const activeClients = companies.filter(c => c.status === 'active');
    const activeClientsCount = activeClients.length;

    const totalMrr = activeClients.reduce((total, company) => {
      const plan = plans.find(p => p.id === company.planId);
      const planPrice = plan?.price || 0;
      
      const addonsPrice = (company.activeAddons || []).reduce((addonTotal, addonId) => {
        const addon = addons.find(a => a.id === addonId);
        return addonTotal + (addon?.price || 0);
      }, 0);

      return total + planPrice + addonsPrice;
    }, 0);
    
    // Using mock data for these as they are not in collections yet
    const overdueInvoicesData = [
        {id: 'inv-001', companyId: 'client-01', customerLocationId: 'loc-01', dueDate: '2024-07-15', totalValue: 249},
        {id: 'inv-002', companyId: 'client-02', customerLocationId: 'loc-03', dueDate: '2024-07-10', totalValue: 999},
    ];
    const overdueValue = overdueInvoicesData.reduce((sum, inv) => sum + inv.totalValue, 0);


    const mrrData = [
      { month: 'Jan', value: totalMrr * 0.75 },
      { month: 'Fev', value: totalMrr * 0.80 },
      { month: 'Mar', value: totalMrr * 0.82 },
      { month: 'Abr', value: totalMrr * 0.90 },
      { month: 'Mai', value: totalMrr * 0.95 },
      { month: 'Jun', value: totalMrr },
    ].map(d => ({...d, value: Math.round(d.value)}));

    const totalPlanRevenue = activeClients.reduce((total, company) => {
        const plan = plans.find(p => p.id === company.planId);
        return total + (plan?.price || 0);
    }, 0);

    const totalIaAddonRevenue = activeClients.reduce((total, company) => {
        const hasIaAddon = (company.activeAddons || []).includes('ia-addon');
        const addon = addons.find(a => a.id === 'ia-addon');
        return total + (hasIaAddon ? (addon?.price || 0) : 0);
    }, 0);

    const totalIotAddonRevenue = activeClients.reduce((total, company) => {
        const hasIotAddon = (company.activeAddons || []).includes('iot-addon');
        const addon = addons.find(a => a.id === 'iot-addon');
        return total + (hasIotAddon ? (addon?.price || 0) : 0);
    }, 0);

    const revenueByModuleData = [
        { name: 'planosbase', value: totalPlanRevenue },
        { name: 'móduloia', value: totalIaAddonRevenue },
        { name: 'móduloiot', value: totalIotAddonRevenue },
    ].filter(d => d.value > 0);

    return { activeClients, totalMrr, overdueValue, activeClientsCount, mrrData, revenueByModuleData, overdueInvoices: overdueInvoicesData };
  }, [companies, plans, addons, companiesLoading, plansLoading, addonsLoading]);


  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'N/A';
  const getCustomerLocationName = (id: string) => customerLocations.find(l => l.id === id)?.name || 'N/A';

  const formattedMrrData = mrrData.map(item => ({
    ...item,
    month: t(`months.${item.month.toLowerCase()}`)
  }));

  const formattedRevenueByModuleData = revenueByModuleData.map(item => ({
    ...item,
    name: t(`finance.modules.${item.name.toLowerCase().replace(/ /g, '')}`)
  }));

  const isLoading = companiesLoading || locationsLoading || plansLoading || addonsLoading;


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">{t('sidebar.financeDashboard')}</h1>
      {isLoading ? (<p>Carregando...</p>) : (
        <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('finance.mrr')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">R$ {totalMrr.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">{t('finance.mrrDescription')}</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('finance.overdue')}</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">R$ {overdueValue.toLocaleString('pt-BR')}</div>
                <p className="text-xs text-muted-foreground">{t('finance.overdueDescription', { count: overdueInvoices.length })}</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('finance.activeClients')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activeClientsCount}</div>
                <p className="text-xs text-muted-foreground">{t('finance.activeClientsDescription')}</p>
            </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>{t('finance.mrrEvolution')}</CardTitle>
                <CardDescription>{t('finance.mrrEvolutionDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedMrrData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}/>
                        <Legend />
                        <Line type="monotone" dataKey="value" name="MRR" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
            <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>{t('finance.revenueByModule')}</CardTitle>
                <CardDescription>{t('finance.revenueByModuleDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={formattedRevenueByModuleData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {formattedRevenueByModuleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name) => [`R$ ${value.toLocaleString('pt-BR')}`, name]} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>{t('finance.overdueInvoices')}</CardTitle>
            <CardDescription>{t('finance.overdueInvoicesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>{t('clients.table.finalClient')}</TableHead>
                    <TableHead>{t('sidebar.companies')}</TableHead>
                    <TableHead>{t('finance.invoiceId')}</TableHead>
                    <TableHead>{t('finance.dueDate')}</TableHead>
                    <TableHead className="text-right">{t('common.value')}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{getCustomerLocationName(invoice.customerLocationId)}</TableCell>
                    <TableCell>{getCompanyName(invoice.companyId)}</TableCell>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">R$ {invoice.totalValue.toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}

    