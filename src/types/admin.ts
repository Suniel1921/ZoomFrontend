export type AdminRole = 'super_admin' | 'admin' | 'manager';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: 'clients' | 'applications' | 'documents' | 'appointments' | 'reports' | 'settings' | 'admins';
  actions: ('view' | 'create' | 'edit' | 'delete')[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  timeZone?: string;
  language?: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  permissions: Permission[];
  createdBy?: string;
  createdAt: string;
  lastLogin?: string;
  profilePhoto?: string;
}