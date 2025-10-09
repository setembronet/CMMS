

export type Contact = {
  id: string;
  name: string;
  contactTypeId: string; // This will now refer to a CMMSRole ID
  phone?: string;
  email?: string;
  observation?: string;
};

export type CustomerLocation = {
  id: string;
  name: string;
  clientId: string; // The SaaS client this location belongs to
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  contacts?: Contact[];
};


export type CompanySegment = {
  id: string;
  name: string;
  customFields?: { id: string; name: string; type: 'text' | 'number' | 'date' }[];
  applicableRoles?: string[]; // IDs of CMMSRole that apply
};

export type CompanyStatus = 'active' | 'inactive';
export type OrderStatus = 'ABERTO' | 'EM ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type OrderPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

// Roles for SaaS management (internal users)
export type SaaSUserRole = 'ADMIN' | 'FINANCEIRO' | 'SUPORTE' | 'VIEWER';

// Roles for CMMS client users (external users)
export type CMMSRole = {
  id: string;
  name: string;
};

export type UserRole = SaaSUserRole | CMMSRole['name'] | string;

export type SubscriptionStatus = 'ATIVA' | 'CANCELADA' | 'PAUSADA';
export type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
export type InvoiceStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ATRASADO';


export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  saasRole: SaaSUserRole;
  cmmsRole: CMMSRole['name'] | null;
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
  activeSegments: string[]; // This will store segment IDs
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
  assetLimit?: number; 
};

export type Asset = {
  id: string;
  name: string;
  clientId: string;
  customerLocationId: string;
  activeSegment: string;
  serialNumber: string;
  brand?: string;
  model?: string;
  observation?: string;
  location: {
    lat: number;
    lng: number;
  };
};

export type WorkOrder = {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  assetId: string;
  status: OrderStatus;
  priority: OrderPriority;
  creationDate: number;
  createdByUserId?: string;
  scheduledDate?: number;
  startDate?: number;
  endDate?: number;
  responsibleId?: string;
  internalObservation?: string;
  squad?: string;
};

export type Subscription = {
  id: string;
  clientId: string;
  planId: string;
  status: SubscriptionStatus;
  period: BillingPeriod;
  startDate: number; // timestamp
  nextBillingDate: number; // timestamp
  basePlanValue: number;
  valuePerAsset?: number;
  activeAddons: { id: string; name: string; price: number }[];
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

// This was moved to roles, but is kept for retro-compatibility in case some files still use it.
// Will be removed in a future iteration.
export type ContactType = {
  id: string;
  name: string;
};
