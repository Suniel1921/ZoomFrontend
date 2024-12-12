import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUUID } from '../utils/cryptoPolyfill';
import { ensureISOString } from '../utils/dateUtils';
import type { Admin, Permission } from '../types/admin';

// Default permissions
const defaultPermissions: Permission[] = [
  {
    id: 'clients',
    name: 'Client Management',
    description: 'Manage client information and profiles',
    module: 'clients',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'applications',
    name: 'Application Management',
    description: 'Manage visa applications',
    module: 'applications',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'documents',
    name: 'Document Management',
    description: 'Manage client documents',
    module: 'documents',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'appointments',
    name: 'Appointment Management',
    description: 'Manage client appointments',
    module: 'appointments',
    actions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'reports',
    name: 'Reports Access',
    description: 'Access to reports and analytics',
    module: 'reports',
    actions: ['view'],
  },
  {
    id: 'settings',
    name: 'Settings Management',
    description: 'Manage system settings',
    module: 'settings',
    actions: ['view', 'edit'],
  },
  {
    id: 'admins',
    name: 'Admin Management',
    description: 'Manage admin users',
    module: 'admins',
    actions: ['view', 'create', 'edit', 'delete'],
  },
];

// Create sample admins with proper timestamps
const sampleAdmins: Admin[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    email: 'zoom@admin.com',
    password: 'Pokhara123',
    role: 'super_admin',
    status: 'active',
    permissions: defaultPermissions,
    createdAt: ensureISOString(new Date()),
    lastLogin: null,
    phone: '',
    timeZone: 'Asia/Tokyo',
    language: 'en',
    profilePhoto: undefined
  }
];

interface AdminStore {
  currentAdmin: Admin | null;
  admins: Admin[];
  permissions: Permission[];
  setCurrentAdmin: (admin: Admin | null) => void;
  addAdmin: (admin: Omit<Admin, 'id' | 'createdAt'>) => void;
  updateAdmin: (id: string, updates: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;
  updatePermissions: (adminId: string, permissions: Permission[]) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      currentAdmin: null,
      admins: sampleAdmins,
      permissions: defaultPermissions,
      
      setCurrentAdmin: (admin) => set({ currentAdmin: admin }),
      
      addAdmin: (admin) => set((state) => ({
        admins: [...state.admins, {
          ...admin,
          id: generateUUID(),
          createdAt: ensureISOString(new Date()),
          lastLogin: null,
          createdBy: state.currentAdmin?.id,
          permissions: [],
        }],
      })),
      
      updateAdmin: (id, updates) => set((state) => {
        const updatedAdmins = state.admins.map((admin) =>
          admin.id === id ? {
            ...admin,
            ...updates,
            lastLogin: updates.lastLogin ? ensureISOString(updates.lastLogin) : admin.lastLogin
          } : admin
        );
        
        const updatedCurrentAdmin = state.currentAdmin?.id === id
          ? { ...state.currentAdmin, ...updates }
          : state.currentAdmin;
        
        return {
          admins: updatedAdmins,
          currentAdmin: updatedCurrentAdmin,
        };
      }),
      
      deleteAdmin: (id) => set((state) => ({
        admins: state.admins.filter((admin) => admin.id !== id),
      })),
      
      updatePermissions: (adminId, permissions) => set((state) => ({
        admins: state.admins.map((admin) =>
          admin.id === adminId ? { ...admin, permissions } : admin
        ),
      })),
    }),
    {
      name: 'admin-store',
    }
  )
);