

import type { Company, User, Asset, WorkOrder, Plan, Addon, CompanySegment, CMMSRole, CustomerLocation, Contact, Interaction, Product } from './types';
import { PlaceHolderImages } from './placeholder-images';

const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '';

export let cmmsRoles: CMMSRole[] = [
  { id: 'GESTOR', name: 'Gestor' },
  { id: 'TECNICO', name: 'Técnico' },
  { id: 'TECNICO_TERCERIZADO', name: 'Técnico Terceirizado' },
  { id: 'SINDICO', name: 'Síndico(a)' },
  { id: 'ZELADOR', name: 'Zelador(a)' },
  { id: 'PORTEIRO', name: 'Porteiro(a)' },
  { id: 'GERENTE_PREDIAL', name: 'Gerente Predial' },
];

export let segments: CompanySegment[] = [
  { 
    id: 'ELEVADOR', 
    name: 'Elevador', 
    customFields: [
        { id: 'field_1', name: 'numero_de_paradas', label: 'Número de Paradas', type: 'number'},
        { id: 'field_2', name: 'data_ultima_vistoria', label: 'Data da Última Vistoria', type: 'date'},
    ], 
    applicableRoles: ['GESTOR', 'TECNICO', 'SINDICO', 'GERENTE_PREDIAL', 'ZELADOR'] 
  },
  { 
    id: 'ESCADA_ROLANTE', 
    name: 'Escada Rolante', 
    customFields: [], 
    applicableRoles: ['GESTOR', 'TECNICO'] 
  },
  { 
    id: 'AR_CONDICIONADO', 
    name: 'Ar Condicionado', 
    customFields: [
        { id: 'field_3', name: 'potencia_btus', label: 'Potência (BTUs)', type: 'number'},
    ], 
    applicableRoles: ['GESTOR', 'TECNICO', 'TECNICO_TERCERIZADO'] 
  },
];

export let plans: Plan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    price: 0,
    assetLimit: 5,
    technicianUserLimit: 1,
    hasMultiModuleAccess: false,
    hasBasicBigQueryAccess: false,
    hasIaAddonAccess: false,
    hasIotAddonAccess: false,
  },
  {
    id: 'plan_pro',
    name: 'Pró',
    price: 249,
    assetLimit: 50,
    technicianUserLimit: -1, // Unlimited
    hasMultiModuleAccess: true,
    hasBasicBigQueryAccess: true,
    hasIaAddonAccess: false,
    hasIotAddonAccess: false,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    price: 999,
    assetLimit: 500,
    technicianUserLimit: -1, // Unlimited
    hasMultiModuleAccess: true,
    hasBasicBigQueryAccess: true,
    hasIaAddonAccess: false,
    hasIotAddonAccess: false,
  },
];

export let addons: Addon[] = [
  { id: 'ia-addon', name: 'Módulo IA', price: 199 },
  { id: 'iot-addon', name: 'Módulo IoT', price: 299 },
];

export let companies: Company[] = [
  { 
    id: 'client-01', 
    name: 'Elevadores Atlas', 
    cnpj: '12.345.678/0001-90', 
    email: 'contato@atlas.com', 
    status: 'active', 
    planId: 'plan_enterprise',
    activeAddons: ['ia-addon'],
    activeSegments: ['ELEVADOR'], 
  },
  { 
    id: 'client-02', 
    name: 'Escadas Brasil', 
    cnpj: '98.765.432/0001-10', 
    email: 'contato@escadasbr.com', 
    status: 'active', 
    planId: 'plan_pro',
    activeAddons: [],
    activeSegments: ['ESCADA_ROLANTE'], 
  },
  { 
    id: 'client-03', 
    name: 'Manutenção Predial XYZ', 
    cnpj: '55.555.555/0001-55', 
    email: 'suporte@xyz.com', 
    status: 'inactive', 
    planId: 'plan_pro',
    activeAddons: [],
    activeSegments: ['ELEVADOR', 'AR_CONDICIONADO'], 
  },
  { 
    id: 'client-04', 
    name: 'Tecno-Lift', 
    cnpj: '33.333.333/0001-33',
    email: 'vendas@tecnolift.com.br',
    status: 'active', 
    planId: 'plan_free',
    activeAddons: [],
    activeSegments: ['ELEVADOR'], 
  },
];

export let customerLocations: CustomerLocation[] = [
  {
    id: 'loc-01',
    clientId: 'client-01',
    name: 'Condomínio Edifício Central',
    address: { street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP', zipCode: '01310-100' },
    contractStatus: 'Vigente',
    contacts: [
      { id: 'contact-01', name: 'Sr. Roberto', role: 'Síndico', phone: '11987654321', email: 'roberto.sindico@email.com', observation: 'Ligar apenas em emergências.' }
    ],
    interactions: [
        { id: 'int-01', date: new Date(2024, 6, 15).getTime(), type: 'LIGAÇÃO', description: 'Cliente ligou para relatar barulho no elevador social. OS-01 foi aberta.', userId: 'user-04' }
    ]
  },
  {
    id: 'loc-02',
    clientId: 'client-01',
    name: 'Shopping Plaza',
    address: { street: 'Rua das Flores', number: 'S/N', city: 'São Paulo', state: 'SP', zipCode: '01001-000' },
    contractStatus: 'Próximo a Vencer',
    contacts: [],
    interactions: []
  },
  {
    id: 'loc-03',
    clientId: 'client-02',
    name: 'Aeroporto Internacional',
    address: { city: 'Rio de Janeiro', state: 'RJ' },
    contractStatus: 'Vencido',
    contacts: [],
    interactions: []
  },
];


export let users: User[] = [
  { id: 'user-01', name: 'Admin Master', email: 'admin@tenantcare.com', role: 'ADMIN', saasRole: 'ADMIN', cmmsRole: null, clientId: null, avatarUrl: userAvatar },
  { id: 'user-02', name: 'Financeiro App', email: 'finance@tenantcare.com', role: 'FINANCEIRO', saasRole: 'FINANCEIRO', cmmsRole: null, clientId: null, avatarUrl: userAvatar },
  { id: 'user-03', name: 'Suporte App', email: 'support@tenantcare.com', role: 'SUPORTE', saasRole: 'SUPORTE', cmmsRole: null, clientId: null, avatarUrl: userAvatar },
  { id: 'user-04', name: 'João Silva', email: 'joao.silva@atlas.com', role: 'GESTOR', saasRole: 'VIEWER', cmmsRole: 'GESTOR', clientId: 'client-01', clientName: 'Elevadores Atlas', avatarUrl: userAvatar },
  { id: 'user-05', name: 'Maria Santos', email: 'maria.santos@atlas.com', role: 'TECNICO', saasRole: 'VIEWER', cmmsRole: 'TECNICO', clientId: 'client-01', clientName: 'Elevadores Atlas', squad: 'Equipe Alpha', avatarUrl: userAvatar },
  { id: 'user-06', name: 'Carlos Pereira', email: 'carlos@escadasbr.com', role: 'GESTOR', saasRole: 'VIEWER', cmmsRole: 'GESTOR', clientId: 'client-02', clientName: 'Escadas Brasil', avatarUrl: userAvatar },
  { id: 'user-07', name: 'Ana Costa', email: 'ana.costa@escadasbr.com', role: 'TECNICO', saasRole: 'VIEWER', cmmsRole: 'TECNICO', clientId: 'client-02', clientName: 'Escadas Brasil', squad: 'Equipe Beta', avatarUrl: userAvatar },
  { id: 'user-08', name: 'Pedro Lima', email: 'pedro@xyz.com', role: 'SINDICO', saasRole: 'VIEWER', cmmsRole: 'SINDICO', clientId: 'client-03', clientName: 'Manutenção Predial XYZ', avatarUrl: userAvatar },
];

export let assets: Asset[] = [
  { id: 'asset-01', clientId: 'client-01', customerLocationId: 'loc-01', name: 'Elevador Social 1', activeSegment: 'ELEVADOR', serialNumber: 'SN-ELEV-A01', brand: 'Atlas Schindler', model: '5500 MRL', observation: 'Instalado em 2020. Contrato de manutenção platinum.', location: { lat: -23.5505, lng: -46.6333 }, customData: { numero_de_paradas: 15, data_ultima_vistoria: '2024-07-01' } },
  { id: 'asset-02', clientId: 'client-01', customerLocationId: 'loc-02', name: 'Elevador de Carga', activeSegment: 'ELEVADOR', serialNumber: 'SN-ELEV-C01', brand: 'Thyssenkrupp', model: 'Synergy', observation: 'Utilizado para abastecimento do shopping.', location: { lat: -23.5505, lng: -46.6333 } },
  { id: 'asset-03', clientId: 'client-02', customerLocationId: 'loc-03', name: 'Escada Rolante - Acesso Principal', activeSegment: 'ESCADA_ROLANTE', serialNumber: 'SN-ESCD-B01', brand: 'Thyssenkrupp', model: 'Velino', observation: 'Fluxo intenso em horários de pico.', location: { lat: -22.9068, lng: -43.1729 } },
];

export let workOrders: WorkOrder[] = [
  { id: 'os-01', clientId: 'client-01', assetId: 'asset-01', title: 'Verificar ruído no motor', status: 'ABERTO', priority: 'Alta', creationDate: new Date(2024, 6, 20).getTime(), createdByUserId: 'user-04', scheduledDate: new Date(2024, 6, 24).getTime(), description: 'Cliente relatou ruído estranho vindo da casa de máquinas durante a operação.', responsibleId: 'user-05', squad: 'Equipe Alpha' },
  { id: 'os-02', clientId: 'client-01', assetId: 'asset-02', title: 'Manutenção preventiva mensal', status: 'CONCLUIDO', priority: 'Média', creationDate: new Date(2024, 5, 15).getTime(), createdByUserId: 'user-04', startDate: new Date(2024, 5, 15, 9).getTime(), endDate: new Date(2024, 5, 15, 11).getTime(), responsibleId: 'user-05', internalObservation: 'Troca de óleo realizada.', squad: 'Equipe Alpha', partsUsed: [{productId: 'prod-01', quantity: 1}] },
  { id: 'os-03', clientId: 'client-02', assetId: 'asset-03', title: 'Degrau quebrado', status: 'EM ANDAMENTO', priority: 'Urgente', creationDate: new Date(2024, 6, 22).getTime(), createdByUserId: 'user-06', startDate: new Date(2024, 6, 22, 14).getTime(), responsibleId: 'user-07', squad: 'Equipe Beta' },
];

export let products: Product[] = [
    { id: 'prod-01', name: 'Óleo Lubrificante XPTO', sku: 'LUB-001', manufacturer: 'Castrol', stock: 150, price: 50.00 },
    { id: 'prod-02', name: 'Correia Dentada 5M', sku: 'COR-005', manufacturer: 'Gates', stock: 80, price: 120.50 },
    { id: 'prod-03', name: 'Painel de Comando Digital', sku: 'PDC-100', manufacturer: 'Atlas Schindler', stock: 10, price: 2500.00 },
];

export let kpis = {
    activeUsers: users.length,
    mockMrr: 1250, // This will be replaced by dynamic calculation
    activeClients: companies.filter(c => c.status === 'active').length,
    inactiveClients: companies.filter(c => c.status === 'inactive').length,
    overdueInvoices: [
        {id: 'inv-001', companyId: 'client-01', customerLocationId: 'loc-01', dueDate: '2024-07-15', totalValue: 249},
        {id: 'inv-002', companyId: 'client-02', customerLocationId: 'loc-03', dueDate: '2024-07-10', totalValue: 999},
    ],
};

// Functions to update data
export const setCompanies = (newCompanies: Company[]) => {
  companies = newCompanies;
};

export const setCustomerLocations = (newLocations: CustomerLocation[]) => {
  customerLocations = newLocations;
}

export const setUsers = (newUsers: User[]) => {
  users = newUsers;
};

export const setPlans = (newPlans: Plan[]) => {
  plans = newPlans;
};

export const setAddons = (newAddons: Addon[]) => {
  addons = newAddons;
};

export const setSegments = (newSegments: CompanySegment[]) => {
  segments = newSegments;
};

export const setCmmsRoles = (newRoles: CMMSRole[]) => {
  cmmsRoles = newRoles;
};

export const setWorkOrders = (newWorkOrders: WorkOrder[]) => {
  workOrders = newWorkOrders;
};

export const setProducts = (newProducts: Product[]) => {
  products = newProducts;
};

export const setKpis = (newKpis: typeof kpis) => {
    kpis = newKpis;
};

// Function to get all data for backup
export const getBackupData = () => ({
  segments,
  plans,
  addons,
  companies,
  customerLocations,
  users,
  assets,
  workOrders,
  cmmsRoles,
  kpis,
  products,
});

// Function to restore all data
export const restoreData = (data: any) => {
  // Basic validation to ensure we're not restoring junk
  if (data && typeof data === 'object') {
    if (Array.isArray(data.segments)) setSegments(data.segments);
    if (Array.isArray(data.plans)) setPlans(data.plans);
    if (Array.isArray(data.addons)) setAddons(data.addons);
    if (Array.isArray(data.companies)) setCompanies(data.companies);
    if (Array.isArray(data.customerLocations)) setCustomerLocations(data.customerLocations);
    if (Array.isArray(data.users)) setUsers(data.users);
    if (Array.isArray(data.assets)) assets = data.assets;
    if (Array.isArray(data.workOrders)) setWorkOrders(data.workOrders);
    if (Array.isArray(data.cmmsRoles)) setCmmsRoles(data.cmmsRoles);
    if (data.kpis) setKpis(data.kpis);
    if (Array.isArray(data.products)) setProducts(data.products);
  }
};
