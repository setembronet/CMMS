
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
import { DollarSign, TrendingUp, AlertCircle, PieChart, Users } from 'lucide-react';
import { kpis, companies, customerLocations } from '@/lib/data';
import { cn } from '@/lib/utils';
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
    Cell
} from 'recharts';

// Mock data for charts
const mrrData = [
  { month: 'Jan', value: 650 },
  { month: 'Fev', value: 700 },
  { month: 'Mar', value: 720 },
  { month: 'Abr', value: 780 },
  { month: 'Mai', value: 850 },
  { month: 'Jun', value: kpis.mockMrr },
];

const revenueByModuleData = [
    { name: 'Planos Base', value: 400 },
    { name: 'Módulo IA', value: 300 },
    { name: 'Módulo IoT', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const overdueInvoices = kpis.overdueInvoices || [];
const overdueValue = overdueInvoices.reduce((sum, inv) => sum + inv.totalValue, 0);

export default function FinancePage() {
  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'N/A';
  const getCustomerLocationName = (id: string) => customerLocations.find(l => l.id === id)?.name || 'N/A';

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Dashboard Financeiro</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Recorrente Mensal)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {kpis.mockMrr.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">+5.2% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {overdueValue.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">{overdueInvoices.length} faturas vencidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeClients}</div>
            <p className="text-xs text-muted-foreground">Total de clientes com assinaturas ativas</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Evolução do MRR</CardTitle>
            <CardDescription>Receita recorrente mensal nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mrrData}>
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
            <CardTitle>Receita por Módulo</CardTitle>
            <CardDescription>Distribuição da receita entre os módulos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={revenueByModuleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {revenueByModuleData.map((entry, index) => (
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
          <CardTitle>Faturas em Atraso</CardTitle>
          <CardDescription>Faturas que passaram da data de vencimento e continuam pendentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente Final</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>ID da Fatura</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
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
    </div>
  );
}
