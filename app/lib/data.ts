
import type { MaintenanceFrequency, RootCause, RecommendedAction, PurchaseOrder, AccountsPayable } from './types';
import { format } from 'date-fns';


// This file contains only static or helper data that doesn't change.
// All dynamic application data is now managed in Firestore.

export const maintenanceFrequencies: { value: MaintenanceFrequency, label: string }[] = [
    { value: 'DIARIA', label: 'Diária' },
    { value: 'SEMANAL', label: 'Semanal' },
    { value: 'QUINZENAL', label: 'Quinzenal' },
    { value: 'MENSAL', label: 'Mensal' },
    { value: 'TRIMESTRAL', label: 'Trimestral' },
    { value: 'SEMESTRAL', label: 'Semestral' },
    { value: 'ANUAL', label: 'Anual' },
];

export const rootCauses: { value: string, label: string }[] = [
    { value: 'Desgaste Natural', label: 'Desgaste Natural' },
    { value: 'Falha Humana', label: 'Falha Humana' },
    { value: 'Falha Elétrica', label: 'Falha Elétrica' },
    { value: 'Vandalismo', label: 'Vandalismo' },
    { value: 'Outro', label: 'Outro' },
];

export const recommendedActions: { value: string, label: string }[] = [
    { value: 'Criar OS de Follow-up', label: 'Criar OS de Follow-up' },
    { value: 'Monitorar', label: 'Monitorar' },
    { value: 'Nenhuma Ação Necessária', label: 'Nenhuma Ação Necessária' },
];


export const createAccountPayableFromPO = (po: PurchaseOrder): Omit<AccountsPayable, 'id'> => {
  return {
    description: `Fatura referente à OC #${po.id.slice(-6)}`,
    supplierOrCreditor: po.supplierId, // This should be resolved to a name, but for now, ID is fine
    dueDate: new Date().getTime(),
    value: po.totalValue,
    status: 'Pendente',
    costCenterId: 'cc-03', // Compras
    chartOfAccountId: 'coa-9', // Fornecedores
    isRecurring: false,
    recurrenceFrequency: 'MENSAL',
    recurrenceInstallments: 1
  }
};
