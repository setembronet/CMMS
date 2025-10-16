
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../../components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Banknote } from 'lucide-react';
import { 
    accountsPayable as allAccountsPayable, 
    accountsReceivable as allAccountsReceivable,
    customerLocations as allCustomerLocations,
    contracts as allContracts,
    costCenters,
    chartOfAccounts
} from '../../lib/data';
import type { AccountsPayable, AccountsReceivable } from '../../lib/types';
import { 
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useClient } from '../../context/client-provider';
import { useI18n } from '../../hooks/use-i18n';
import { format, getMonth, getYear } from 'date-fns';
import { cn } from '../../lib/utils';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function CmmsFinanceDashboardPage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();

  const financeData = React.useMemo(() => {
    if (!selectedClient) {
      return { 
        totalReceivable: 0, 
        totalPayable: 0, 
        balance: 0, 
        nextEntries: [],
        cashFlow: [],
        expensesByCostCenter: [],
        expensesByChartOfAccount: [],
      };
    }

    const clientLocationIds = allCustomerLocations.filter(loc => loc.clientId === selectedClient.id).map(loc => loc.id);
    
    // --- General Overview Data ---
    const clientReceivables = allAccountsReceivable.filter(ar => clientLocationIds.includes(ar.customerLocationId));
    const clientPayables = allAccountsPayable; 

    const totalReceivable = clientReceivables
        .filter(ar => ar.status === 'Pendente')
        .reduce((sum, ar) => sum + ar.value, 0);
        
    const totalPayable = clientPayables
        .filter(ap => ap.status === 'Pendente')
        .reduce((sum, ap) => sum + ap.value, 0);

    const balance = totalReceivable - totalPayable;
    
    const nextPayables = clientPayables
        .filter(ap => ap.status === 'Pendente' && new Date(ap.dueDate) >= new Date())
        .map(ap => ({...ap, type: 'payable' as const}));

    const nextReceivables = clientReceivables
        .filter(ar => ar.status === 'Pendente' && new Date(ar.dueDate) >= new Date())
        .map(ar => ({...ar, type: 'receivable' as const}));
        
    const nextEntries = [...nextPayables, ...nextReceivables]
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 5);

    // --- Cash Flow Data Calculation ---
    const monthlyData: { [key: string]: { entries: number, exits: number } } = {};

    const allEntries = [...clientReceivables, ...clientPayables];

    allEntries.forEach(entry => {
        const date = new Date(entry.paymentDate || entry.dueDate);
        const monthYear = format(date, 'yyyy-MM');
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { entries: 0, exits: 0 };
        }
        if ('customerLocationId' in entry) { 
            if (entry.status === 'Paga') monthlyData[monthYear].entries += entry.value;
        } else { 
            if (entry.status === 'Paga') monthlyData[monthYear].exits += entry.value;
        }
    });

    allContracts.filter(c => clientLocationIds.includes(c.customerLocationId)).forEach(contract => {
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);
        let currentDate = startDate;

        while (currentDate <= endDate) {
            const monthYear = format(currentDate, 'yyyy-MM');
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { entries: 0, exits: 0 };
            }
            monthlyData[monthYear].entries += contract.monthlyValue;
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    });
    
    const cashFlow = Object.keys(monthlyData)
        .map(key => ({
            month: format(new Date(key), 'MMM/yy'),
            Entradas: monthlyData[key].entries,
            Saídas: monthlyData[key].exits,
        }))
        .sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-6); 


    // --- Expense Analysis Data ---
    const paidPayables = clientPayables.filter(ap => ap.status === 'Paga');

    const expensesByCostCenterData = paidPayables.reduce((acc, ap) => {
        const centerName = costCenters.find(cc => cc.id === ap.costCenterId)?.name || 'Outros';
        acc[centerName] = (acc[centerName] || 0) + ap.value;
        return acc;
    }, {} as { [key: string]: number });
    
    const expensesByCostCenter = Object.entries(expensesByCostCenterData).map(([name, value]) => ({ name, value }));

    const expensesByChartOfAccountData = paidPayables.reduce((acc, ap) => {
        const accountName = chartOfAccounts.find(ca => ca.id === ap.chartOfAccountId)?.name || 'Não classificado';
        acc[accountName] = (acc[accountName] || 0) + ap.value;
        return acc;
    }, {} as { [key: string]: number });
    
    const expensesByChartOfAccount = Object.entries(expensesByChartOfAccountData).map(([name, value]) => ({ name, value }));


    return { totalReceivable, totalPayable, balance, nextEntries, cashFlow, expensesByCostCenter, expensesByChartOfAccount };

  }, [selectedClient]);

  const { totalReceivable, totalPayable, balance, nextEntries, cashFlow, expensesByCostCenter, expensesByChartOfAccount } = financeData;

  if (!selectedClient) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold font-headline mb-4">{t('cmms.finance.dashboardTitle')}</h1>
            <p className="text-muted-foreground">{t('clients.selectClientPrompt')}</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">{t('cmms.finance.dashboardTitle')}</h1>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('sidebar.overview')}</TabsTrigger>
          <TabsTrigger value="analysis">Análise de Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cmms.finance.receivableTitle')}</CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('cmms.finance.receivableDescription')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cmms.finance.payableTitle')}</CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">{t('cmms.finance.payableDescription')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('cmms.finance.balanceTitle')}</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", balance >= 0 ? 'text-green-600' : 'text-red-600')}>
                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">{t('cmms.finance.balanceDescription')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{t('cmms.finance.cashflowTitle')}</CardTitle>
                <CardDescription>{t('cmms.finance.cashflowDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cashFlow}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`}/>
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}/>
                        <Legend />
                        <Bar dataKey="Entradas" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Saídas" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('cmms.finance.upcomingTitle')}</CardTitle>
                <CardDescription>{t('cmms.finance.upcomingDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('common.description')}</TableHead>
                            <TableHead>{t('common.date')}</TableHead>
                            <TableHead className="text-right">{t('common.value')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {nextEntries.map(entry => (
                            <TableRow key={`${entry.id}-${entry.type}`}>
                                <TableCell className="font-medium">{entry.description}</TableCell>
                                <TableCell>{format(new Date(entry.dueDate), 'dd/MM/yy')}</TableCell>
                                <TableCell className={cn("text-right font-semibold", entry.type === 'payable' ? 'text-red-500' : 'text-green-600')}>
                                    {entry.type === 'payable' ? '-' : '+'} R$ {entry.value.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {nextEntries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                    {t('cmms.finance.noUpcoming')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Despesas por Centro de Custo</CardTitle>
                        <CardDescription>Distribuição dos gastos por área da empresa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expensesByCostCenter}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {expensesByCostCenter.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Despesas por Conta Contábil</CardTitle>
                        <CardDescription>Detalhamento dos gastos por tipo de despesa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={expensesByChartOfAccount} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => `R$ ${value / 1000}k`}/>
                                <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12}} />
                                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}/>
                                <Legend />
                                <Bar dataKey="value" name="Valor" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
