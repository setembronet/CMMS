
export type CompanySegment = string;
export type CompanyStatus = 'active' | 'inactive';
export type OrderStatus = 'ABERTO' | 'FECHADO';
export type OrderPriority = 'Baixa' | 'Média' | 'Alta';

// Roles for SaaS management (internal users)
export type SaaSUserRole = 'ADMIN' | 'FINANCEIRO' | 'SUPORTE' | 'VIEWER';

// Roles for CMMS client users (external users)
export type CMMSUserRole = 'GESTOR' | 'TECNICO' | 'TECNICO_TERCERIZADO' | 'SINDICO' | string;

export type UserRole = SaaSUserRole | CMMSUserRole;

export type SubscriptionStatus = 'ATIVA' | 'CANCELADA' | 'PAUSADA';
export type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
export type InvoiceStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ATRASADO';


export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  saasRole: SaaSUserRole;
  cmmsRole: CMMSUserRole | null;
  clientId: string | null;
  clientName?: string; 
  squad?: string;
  avatarUrl: string;
  password?: string;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  assetLimit: number;
  technicianUserLimit: number; // -1 for unlimited
  hasMultiModuleAccess: boolean;
  hasBasicBigQueryAccess: boolean;
  hasIaAddonAccess: boolean;
  hasIotAddonAccess: boolean;
};

export type Addon = {
  id: string;
  name: string;
  price: number;
};

export type Company = {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  status: CompanyStatus;
  activeSegment: CompanySegment;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  planId: string;
  iaAddonActive: boolean;
  iotAddonActive: boolean;
  currentAssets: number;
  assetLimit?: number; // Added from previous turn, but should be in Company
};

export type Asset = {
  id: string;
  name: string;
  clientId: string;
  activeSegment: CompanySegment;
  serialNumber: string;
  location: {
    lat: number;
    lng: number;
  };
};

export type WorkOrder = {
  id: string;
  title: string;
  clientId: string;
  assetId: string;
  status: OrderStatus;
  priority: OrderPriority;
};

export type Subscription = {
  id: string;
  clientId: string;
  status: SubscriptionStatus;
  period: BillingPeriod;
  startDate: number; // timestamp
  nextBillingDate: number; // timestamp
  basePlanValue: number;
  valuePerAsset?: number;
  activeAddons: { id: string; name: string; value: number }[];
};

export type Invoice = {
  id: string;
  clientId: string;
  subscriptionId: string;
  issueDate: number; // timestamp
  dueDate: number; // timestamp
  totalValue: number;
  status: InvoiceStatus;
  billedItems: { description: string; value: number }[];
  paymentLink?: string;
};
