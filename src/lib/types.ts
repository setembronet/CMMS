

export type ContractStatus = 'Vigente' | 'Próximo a Vencer' | 'Vencido';

export type InteractionType = 'LIGAÇÃO' | 'EMAIL' | 'REUNIÃO' | 'VISITA' | 'OUTRO';

export type Interaction = {
  id: string;
  date: number; // timestamp
  type: InteractionType;
  description: string;
  userId: string; // ID of the user who logged the interaction
};

export type Contact = {
  id: string;
  name: string;
  role: string; 
  phone?: string;
  email?: string;
  observation?: string;
};

export type CustomerLocation = {
  id: string;
  name: string;
  clientId: string; // The SaaS client this location belongs to
  contractStatus: ContractStatus;
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
  interactions?: Interaction[];
};


export type CustomFieldType = 'text' | 'number' | 'date';

export type CustomField = {
  id: string;
  name: string;
  label: string;
  type: CustomFieldType;
}

export type CompanySegment = {
  id: string;
  name: string;
  customFields?: CustomField[];
  applicableRoles?: string[]; // IDs of CMMSRole
};

export type CompanyStatus = 'active' | 'inactive';
export type OrderStatus = 'ABERTO' | 'EM ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type OrderPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type MaintenanceFrequency = 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
export type ContractType = 'Integral' | 'Mão de Obra';
export type ChecklistItemStatus = 'OK' | 'NÃO OK' | 'N/A';
export type RootCause = 'Desgaste Natural' | 'Falha Humana' | 'Falha Elétrica' | 'Vandalismo' | 'Outro';
export type RecommendedAction = 'Criar OS de Follow-up' | 'Monitorar' | 'Nenhuma Ação Necessária';


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
  cmmsRole: CMMSRole['id'] | null;
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
  planId: string;
  activeAddons: string[]; // IDs of Addon
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
  customData?: { [key: string]: any };
};

export type WorkOrderPart = {
  productId: string;
  quantity: number;
};

export type ChecklistItem = {
  id: string;
  text: string;
  status: ChecklistItemStatus;
  comment?: string;
  photoUrl?: string; // For future use
};

export type ChecklistGroup = {
  id: string;
  title: string;
  items: ChecklistItem[];
};

export type Checklist = ChecklistGroup[];

export type WorkOrder = {
  id:string;
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
  partsUsed?: WorkOrderPart[];
  isPreventive?: boolean;
  checklist?: Checklist;
  rootCause?: RootCause;
  recommendedAction?: RecommendedAction;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  manufacturer: string;
  stock: number;
  price: number;
};

export type MaintenancePlan = {
  id: string;
  assetId: string;
  frequency: MaintenanceFrequency;
  description: string;
  lastGenerated: number; // timestamp
};

export type Contract = {
  id: string;
  title: string;
  customerLocationId: string;
  startDate: number; // timestamp
  endDate: number; // timestamp
  contractType: ContractType;
  coveredAssetIds: string[];
  plans: MaintenancePlan[];
};

export type SupplierContact = {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
};

export type SupplierCategory = 'PEÇAS' | 'SERVIÇOS' | 'MATERIAIS';

export type Supplier = {
  id: string;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  categories: SupplierCategory[];
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contacts?: SupplierContact[];
};
