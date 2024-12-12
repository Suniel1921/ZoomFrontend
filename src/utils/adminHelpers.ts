import { useAdminStore } from '../store/adminStore';

interface Handler {
  id: string;
  name: string;
}

export const getHandlers = (): Handler[] => {
  const { admins } = useAdminStore.getState();
  return admins
    .filter(admin => admin.role !== 'super_admin' && admin.status === 'active')
    .map(admin => ({
      id: admin.id,
      name: admin.name
    }));
};