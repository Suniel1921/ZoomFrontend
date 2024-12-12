import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/Button';
import { useAdminStore } from '../../../store/adminStore';
import type { Admin, Permission } from '../../../types/admin';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
}

export default function PermissionsModal({
  isOpen,
  onClose,
  admin,
}: PermissionsModalProps) {
  const { permissions: allPermissions, updatePermissions } = useAdminStore();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    admin.permissions || []
  );

  const handleTogglePermission = (permission: Permission, action: string) => {
    setSelectedPermissions((current) => {
      const existingPermission = current.find((p) => p.id === permission.id);
      
      if (existingPermission) {
        if (existingPermission.actions.includes(action as any)) {
          // Remove action
          const updatedActions = existingPermission.actions.filter((a) => a !== action);
          if (updatedActions.length === 0) {
            // Remove entire permission if no actions left
            return current.filter((p) => p.id !== permission.id);
          }
          return current.map((p) =>
            p.id === permission.id ? { ...p, actions: updatedActions } : p
          );
        } else {
          // Add action
          return current.map((p) =>
            p.id === permission.id
              ? { ...p, actions: [...p.actions, action as any] }
              : p
          );
        }
      } else {
        // Add new permission with single action
        return [...current, { ...permission, actions: [action as any] }];
      }
    });
  };

  const handleSave = () => {
    updatePermissions(admin.id, selectedPermissions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Permissions for {admin.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Create
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allPermissions.map((permission) => {
                const currentPermission = selectedPermissions.find(
                  (p) => p.id === permission.id
                );
                return (
                  <tr key={permission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {permission.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {permission.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={currentPermission?.actions.includes('view') || false}
                        onChange={() => handleTogglePermission(permission, 'view')}
                        className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                        disabled={admin.role === 'super_admin'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={currentPermission?.actions.includes('create') || false}
                        onChange={() => handleTogglePermission(permission, 'create')}
                        className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                        disabled={admin.role === 'super_admin'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={currentPermission?.actions.includes('edit') || false}
                        onChange={() => handleTogglePermission(permission, 'edit')}
                        className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                        disabled={admin.role === 'super_admin'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={currentPermission?.actions.includes('delete') || false}
                        onChange={() => handleTogglePermission(permission, 'delete')}
                        className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                        disabled={admin.role === 'super_admin'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={admin.role === 'super_admin'}>
              Save Permissions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}