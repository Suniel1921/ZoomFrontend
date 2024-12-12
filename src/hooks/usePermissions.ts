import { useAdminStore } from '../store/adminStore';

export function usePermissions(module: string) {
  const { currentAdmin } = useAdminStore();

  if (!currentAdmin) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    };
  }

  // Super admin has all permissions
  if (currentAdmin.role === 'super_admin') {
    return {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    };
  }

  const modulePermissions = currentAdmin.permissions.find((p) => p.module === module);

  return {
    canView: modulePermissions?.actions.includes('view') || false,
    canCreate: modulePermissions?.actions.includes('create') || false,
    canEdit: modulePermissions?.actions.includes('edit') || false,
    canDelete: modulePermissions?.actions.includes('delete') || false,
  };
}