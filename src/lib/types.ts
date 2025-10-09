

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

// This was moved to roles, but is kept for retro-compatibility in case some files still use it.
// Will be removed in a future iteration.
export type ContactType = {
  id: string;
  name: string;
};

    