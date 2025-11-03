
import type { Company, User, Asset, WorkOrder, Plan, Addon, CompanySegment, CMMSRole, CustomerLocation, Contact, Interaction, Product, Contract, MaintenanceFrequency, ChecklistTemplate, Supplier, SupplierCategory, PurchaseOrder, ChartOfAccount, CostCenter, AccountsPayable, AccountsReceivable, BankAccount, Checklist, Schedule } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { format } from 'date-fns';

const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '';

// This file is now mostly deprecated in favor of Firestore, but some data might still be here for reference.
// The goal is to move all of these to Firestore collections.

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


export let kpis = {
    activeUsers: 0,
    mockMrr: 1250, 
    activeClients: 0,
    inactiveClients: 0,
    overdueInvoices: [
        {id: 'inv-001', companyId: 'client-01', customerLocationId: 'loc-01', dueDate: '2024-07-15', totalValue: 249},
        {id: 'inv-002', companyId: 'client-02', customerLocationId: 'loc-03', dueDate: '2024-07-10', totalValue: 999},
    ],
};


export const generateReceivablesFromContracts = (clientId: string, contracts: Contract[], existingReceivables: AccountsReceivable[], customerLocations: CustomerLocation[]) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
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
            const newReceivable: Omit<AccountsReceivable, 'id'> = {
                description: descriptionPattern,
                customerLocationId: contract.customerLocationId,
                dueDate: new Date(currentYear, currentMonth, 10).getTime(), 
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


// These functions are for in-memory data manipulation, which is now deprecated.
// They will be removed in a future step once all components use Firestore directly.
export const setWorkOrders = (newWorkOrders: WorkOrder[]) => {};
export const setProducts = (newProducts: Product[]) => {};
export const setContracts = (newContracts: Contract[]) => {};
export const setSuppliers = (newSuppliers: Supplier[]) => {};
export const setPurchaseOrders = (newPOs: PurchaseOrder[]) => {};
export const setSchedules = (newSchedules: Schedule[]) => {};
export const setAccountsPayable = (newAPs: AccountsPayable[]) => {};
export const createAccountPayableFromPO = (po: PurchaseOrder): Omit<AccountsPayable, 'id'> => { return {} as any };
export const setAccountsReceivable = (newARs: AccountsReceivable[]) => {};
export const setBankAccounts = (newBAs: BankAccount[]) => {};
export const setKpis = (newKpis: typeof kpis) => {};
export const getBackupData = () => {};
export const restoreData = (data: any) => {};
export const setCompanies = (newCompanies: Company[]) => {};
export const setCustomerLocations = (newLocations: CustomerLocation[]) => {}
export const setUsers = (newUsers: User[]) => {};
export const setPlans = (newPlans: Plan[]) => {};
export const setAddons = (newAddons: Addon[]) => {};
export const setSegments = (newSegments: CompanySegment[]) => {};
export const setChecklistTemplates = (newTemplates: ChecklistTemplate[]) => {};
export const setCmmsRoles = (newRoles: CMMSRole[]) => {};
