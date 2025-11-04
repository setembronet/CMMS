import type { MaintenanceFrequency, RootCause, RecommendedAction, PurchaseOrder, AccountsPayable, Contract, CustomerLocation, AccountsReceivable, WorkOrder, Product, Supplier, Schedule, Company, CMMSRole, Addon, Plan, CompanySegment, ChecklistTemplate, User } from './types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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


export const createAccountPayableFromPO = (po: PurchaseOrder, allSuppliers: Supplier[]): Omit<AccountsPayable, 'id'> => {
  const supplier = allSuppliers.find(s => s.id === po.supplierId);
  return {
    description: `Fatura referente à OC #${po.id.slice(-6)}`,
    supplierOrCreditor: supplier?.name || 'Fornecedor Desconhecido',
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


export const generateReceivablesFromContracts = (clientId: string, contracts: Contract[], existingReceivables: AccountsReceivable[], customerLocations: CustomerLocation[]) => {
    const today = new Date();
    const clientContracts = contracts.filter(c => {
        const location = customerLocations.find(l => l.id === c.customerLocationId);
        return location?.clientId === clientId;
    }).filter(c => new Date(c.endDate) >= today && new Date(c.startDate) <= today);

    let generatedCount = 0;
    const newReceivables: AccountsReceivable[] = [];

    clientContracts.forEach(contract => {
        const descriptionPattern = `Fatura Contrato #${contract.id} - ${format(today, 'MM/yyyy')}`;
        const alreadyExists = existingReceivables.some(ar => ar.description === descriptionPattern);

        if (!alreadyExists) {
            const newReceivable: Omit<AccountsReceivable, 'id'> & { id: string } = {
                id: `ar-${Date.now()}-${contract.id}`,
                description: descriptionPattern,
                customerLocationId: contract.customerLocationId,
                dueDate: new Date(today.getFullYear(), today.getMonth(), 10).getTime(), 
                value: contract.monthlyValue,
                status: 'Pendente',
                chartOfAccountId: 'coa-3', 
            };
            newReceivables.push(newReceivable as AccountsReceivable); //Firestore will add ID
            generatedCount++;
        }
    });

    return { newReceivables, generatedCount };
}

// In a real application, this would fetch all collections from Firestore.
export const getBackupData = (data: any) => {
  console.log("Backup function called. In a real app, this would fetch from all Firestore collections.");
  return {
    ...data
  };
};

// In a real application, this would perform batch writes to all collections.
export const restoreData = (data: any) => {
  console.log("Restore function called. This is a mock implementation.");
  // The actual logic would involve iterating through collections and using setDoc.
};


// These exports are here for reference, but data is now primarily managed via Firestore hooks in components.
// Note: These empty arrays and functions are being kept to avoid breaking other parts of the app that
// might still be importing them, even if they are not actively used.
export const companies: Company[] = [];
export const segments: CompanySegment[] = [];
export let cmmsRoles: CMMSRole[] = [];
export const customerLocations: CustomerLocation[] = [];
export const users: User[] = [];
export const assets: Asset[] = [];
export const contracts: Contract[] = [];
export const products: Product[] = [];
export const suppliers: Supplier[] = [];
export const workOrders: WorkOrder[] = [];
export const costCenters: CostCenter[] = [];
export const chartOfAccounts: ChartOfAccount[] = [];
export const accountsPayable: AccountsPayable[] = [];
export const accountsReceivable: AccountsReceivable[] = [];
export const bankAccounts: BankAccount[] = [];
export const checklistTemplates: ChecklistTemplate[] = [];
export const schedules: Schedule[] = [];
export const plans: Plan[] = [];
export const addons: Addon[] = [];
export const kpis = {};


export const setWorkOrders = (newWorkOrders: WorkOrder[]) => {};
export const setProducts = (newProducts: Product[]) => {};
export const setContracts = (newContracts: Contract[]) => {};
export const setSuppliers = (newSuppliers: Supplier[]) => {};
export const setPurchaseOrders = (newPOs: PurchaseOrder[]) => {};
export const setSchedules = (newSchedules: Schedule[]) => {};
export const setAccountsPayable = (newAPs: AccountsPayable[]) => {};
export const setAccountsReceivable = (newARs: AccountsReceivable[]) => {};
export const setBankAccounts = (newBAs: BankAccount[]) => {};
export const setKpis = (newKpis: typeof kpis) => {};
export const setCompanies = (newCompanies: Company[]) => {};
export const setCustomerLocations = (newLocations: CustomerLocation[]) => {}
export const setUsers = (newUsers: User[]) => {};
export const setPlans = (newPlans: Plan[]) => {};
export const setAddons = (newAddons: Addon[]) => {};
export const setSegments = (newSegments: CompanySegment[]) => {};
export const setChecklistTemplates = (newTemplates: ChecklistTemplate[]) => {};
export const setCmmsRoles = (newRoles: CMMSRole[]) => {};
const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '';