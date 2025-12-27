// ============================================================================
// SHARED TYPES - Must match backend Prisma schema
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  USER = 'USER',
}

export enum RequestType {
  CORRECTIVE = 'CORRECTIVE',
  PREVENTIVE = 'PREVENTIVE',
}

export enum RequestStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  REPAIRED = 'REPAIRED',
  SCRAP = 'SCRAP',
}

export enum EquipmentCategory {
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  HVAC = 'HVAC',
  PLUMBING = 'PLUMBING',
  IT_HARDWARE = 'IT_HARDWARE',
  VEHICLES = 'VEHICLES',
  TOOLS = 'TOOLS',
  FACILITIES = 'FACILITIES',
  OTHER = 'OTHER',
}

export enum Department {
  PRODUCTION = 'PRODUCTION',
  MAINTENANCE = 'MAINTENANCE',
  WAREHOUSE = 'WAREHOUSE',
  ADMINISTRATION = 'ADMINISTRATION',
  IT = 'IT',
  HR = 'HR',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE',
  LOGISTICS = 'LOGISTICS',
  SALES = 'SALES',
  OTHER = 'OTHER',
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  team?: MaintenanceTeam;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// ============================================================================
// EQUIPMENT TYPES
// ============================================================================

export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  category: EquipmentCategory;
  department: Department;
  assignedEmployeeName?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  physicalLocation: string;
  defaultTeamId?: string;
  defaultTeam?: MaintenanceTeam;
  isScrap: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TEAM TYPES
// ============================================================================

export interface MaintenanceTeam {
  id: string;
  name: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MAINTENANCE REQUEST TYPES
// ============================================================================

export interface MaintenanceRequest {
  id: string;
  subject: string;
  description?: string;
  requestType: RequestType;
  status: RequestStatus;
  equipmentId: string;
  equipment?: Equipment;
  teamId?: string;
  team?: MaintenanceTeam;
  assignedToId?: string;
  assignedTo?: User;
  requestedById: string;
  requestedBy?: User;
  scheduledDate?: string;
  completedDate?: string;
  durationHours?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface DashboardStats {
  totalRequests: number;
  newRequests: number;
  inProgressRequests: number;
  repairedRequests: number;
  scrapRequests: number;
  overdueRequests: number;
  totalEquipment: number;
  scrapEquipment: number;
  totalTeams: number;
}

export interface RequestsByTeam {
  teamId: string;
  teamName: string;
  total: number;
  byStatus: {
    NEW: number;
    IN_PROGRESS: number;
    REPAIRED: number;
    SCRAP: number;
  };
}

export interface RequestsByCategory {
  category: EquipmentCategory;
  total: number;
  byStatus: {
    NEW: number;
    IN_PROGRESS: number;
    REPAIRED: number;
    SCRAP: number;
  };
}

export interface DurationAnalysis {
  averageHours: number;
  minHours: number;
  maxHours: number;
  totalRequests: number;
  byType?: {
    CORRECTIVE: { avg: number; count: number };
    PREVENTIVE: { avg: number; count: number };
  };
  byCategory?: Record<EquipmentCategory, { avg: number; count: number }>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface EquipmentFormData {
  name: string;
  serialNumber: string;
  category: EquipmentCategory;
  department: Department;
  assignedEmployeeName?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  physicalLocation: string;
  defaultTeamId?: string;
  notes?: string;
}

export interface MaintenanceRequestFormData {
  subject: string;
  description?: string;
  requestType: RequestType;
  equipmentId: string;
  scheduledDate?: string;
}

export interface TeamFormData {
  name: string;
  memberIds: string[];
}
