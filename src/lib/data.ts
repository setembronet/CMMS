import type { Company, User, Asset, WorkOrder, Plan } from './types';
import { PlaceHolderImages } from './placeholder-images';

const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '';

export const plans: Plan[] = [
  {
    id: 'plan_free',
    name: 'Free',
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
    assetLimit: 500,
    technicianUserLimit: -1, // Unlimited
    hasMultiModuleAccess: true,
    hasBasicBigQueryAccess: true,
    hasIaAddonAccess: false,
    hasIotAddonAccess: false,
  },
];

export const companies: Company[] = [
  { 
    id: 'client-01', 
    name: 'Elevadores Atlas', 
    cnpj: '12.345.678/0001-90', 
    email: 'contato@atlas.com', 
    status: 'active', 
    activeSegment: 'ELEVADOR', 
    assetLimit: 25, // Legacy, will be derived from plan
    planId: 'plan_pro',
    iaAddonActive: true,
    iotAddonActive: false,
    currentAssets: 18,
  },
  { 
    id: 'client-02', 
    name: 'Escadas Brasil', 
    cnpj: '98.765.432/0001-10', 
    email: 'contato@escadasbr.com', 
    status: 'active', 
    activeSegment: 'ESCADA_ROLANTE', 
    assetLimit: 50, // Legacy
    planId: 'plan_pro',
    iaAddonActive: false,
    iotAddonActive: false,
    currentAssets: 45,
  },
  { 
    id: 'client-03', 
    name: 'Manutenção Predial XYZ', 
    cnpj: '55.555.555/0001-55', 
    email: 'suporte@xyz.com', 
    status: 'inactive', 
    activeSegment: 'ELEVADOR', 
    assetLimit: 5, // Legacy
    planId: 'plan_free',
    iaAddonActive: false,
    iotAddonActive: false,
    currentAssets: 4,
  },
  { 
    id: 'client-04', 
    name: 'Tecno-Lift', 
    cnpj: '33.333.333/0001-33', 
    email: 'vendas@tecnolift.com.br', 
    status: 'active', 
    activeSegment: 'ELEVADOR', 
    assetLimit: 25, // Legacy
    planId: 'plan_enterprise',
    iaAddonActive: true,
    iotAddonActive: true,
    currentAssets: 150,
  },
];

export const users: User[] = [
  { id: 'user-01', name: 'Admin Master', email: 'admin@tenantcare.com', role: 'Admin Master', coreRole: 'ADMIN', clientId: null, avatarUrl: userAvatar },
  { id: 'user-02', name: 'João Silva', email: 'joao.silva@atlas.com', role: 'Gestor de Empresa', coreRole: 'OPERATOR', clientId: 'client-01', clientName: 'Elevadores Atlas', avatarUrl: userAvatar },
  { id: 'user-03', name: 'Maria Santos', email: 'maria.santos@atlas.com', role: 'Técnico', coreRole: 'OPERATOR', clientId: 'client-01', clientName: 'Elevadores Atlas', squad: 'Equipe Alpha', avatarUrl: userAvatar },
  { id: 'user-04', name: 'Carlos Pereira', email: 'carlos@escadasbr.com', role: 'Gestor de Empresa', coreRole: 'OPERATOR', clientId: 'client-02', clientName: 'Escadas Brasil', avatarUrl: userAvatar },
  { id: 'user-05', name: 'Ana Costa', email: 'ana.costa@escadasbr.com', role: 'Técnico', coreRole: 'OPERATOR', clientId: 'client-02', clientName: 'Escadas Brasil', squad: 'Equipe Beta', avatarUrl: userAvatar },
  { id: 'user-06', name: 'Pedro Lima', email: 'pedro@xyz.com', role: 'Gestor de Empresa', coreRole: 'VIEWER', clientId: 'client-03', clientName: 'Manutenção Predial XYZ', avatarUrl: userAvatar },
];

export const assets: Asset[] = [
  { id: 'asset-01', clientId: 'client-01', name: 'Elevador Social 1', activeSegment: 'ELEVADOR', serialNumber: 'SN-ELEV-A01', location: { lat: -23.5505, lng: -46.6333 } },
  { id: 'asset-02', clientId: 'client-02', name: 'Escada Rolante - Acesso Principal', activeSegment: 'ESCADA_ROLANTE', serialNumber: 'SN-ESCD-B01', location: { lat: -22.9068, lng: -43.1729 } },
];

export const workOrders: WorkOrder[] = [
  { id: 'os-01', clientId: 'client-01', assetId: 'asset-01', title: 'Verificar ruído no motor', status: 'ABERTO', priority: 'Alta' },
  { id: 'os-02', clientId: 'client-02', assetId: 'asset-02', title: 'Manutenção preventiva mensal', status: 'FECHADO', priority: 'Média' },
];

export const kpis = {
    activeUsers: users.length,
    mockMrr: companies.reduce((total, company) => {
        if (company.status === 'active') {
            const plan = plans.find(p => p.id === company.planId);
            if (!plan) return total;
            if (plan.id === 'plan_free') return total + 0;
            if (plan.id === 'plan_pro') return total + 99;
            if (plan.id === 'plan_enterprise') return total + 249;
        }
        return total;
    }, 0),
    activeClients: companies.filter(c => c.status === 'active').length,
    inactiveClients: companies.filter(c => c.status === 'inactive').length,
};
