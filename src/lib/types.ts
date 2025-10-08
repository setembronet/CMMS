export type UserRole = 'Admin Master' | 'Gestor de Empresa' | 'Técnico';
export type CompanySegment = 'ELEVADOR' | 'ESCADA_ROLANTE';
export type CompanyStatus = 'active' | 'inactive';
export type OrderStatus = 'ABERTO' | 'FECHADO';
export type OrderPriority = 'Baixa' | 'Média' | 'Alta';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId: string | null;
  clientName?: string; 
  squad?: string;
  avatarUrl: string;
};

export type Company = {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  status: CompanyStatus;
  activeSegment: CompanySegment;
  assetLimit: number;
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
