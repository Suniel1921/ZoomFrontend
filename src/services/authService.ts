import { useStore } from '../store';
import { useAdminStore } from '../store/adminStore';
import { addAuditLog } from '../store/auditLogStore';

export const validateClientCredentials = (email: string, password: string) => {
  const store = useStore.getState();
  const client = store.clients.find(c => c.email === email);
  
  if (!client) {
    addAuditLog({
      userId: email,
      userName: email,
      userType: 'client',
      action: 'failed_login',
      resource: 'auth',
      details: 'Failed login attempt for client account',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    });
    return null;
  }
  
  // In a real app, you would hash the password and compare with stored hash
  if (client.credentials?.password === password) {
    addAuditLog({
      userId: client.id,
      userName: client.name,
      userType: 'client',
      action: 'login',
      resource: 'auth',
      details: 'Successful client login',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    });
    return client;
  }
  
  addAuditLog({
    userId: email,
    userName: email,
    userType: 'client',
    action: 'failed_login',
    resource: 'auth',
    details: 'Failed login attempt - invalid password',
    ipAddress: '127.0.0.1',
    userAgent: navigator.userAgent
  });
  return null;
};

export const validateAdminCredentials = (username: string, password: string) => {
  const { admins } = useAdminStore.getState();
  const admin = admins.find(a => a.email === username);

  if (!admin) {
    addAuditLog({
      userId: username,
      userName: username,
      userType: 'admin',
      action: 'failed_login',
      resource: 'auth',
      details: 'Failed login attempt - admin not found',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    });
    return null;
  }

  // For super admin
  if (username === 'zoom@admin.com' && password === 'Pokhara123') {
    addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userType: 'super_admin',
      action: 'login',
      resource: 'auth',
      details: 'Successful super admin login',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    });
    return admin;
  }

  // For sub-admins, check status and password
  if (admin.status === 'inactive') {
    addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userType: 'admin',
      action: 'failed_login',
      resource: 'auth',
      details: 'Failed login attempt - account inactive',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    });
    throw new Error('Your account is inactive. Please contact the administrator.');
  }

  if (admin.password === password) {
    addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userType: 'admin',
      action: 'login',
      resource: 'auth',
      details: 'Successful admin login',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    });
    return admin;
  }

  addAuditLog({
    userId: admin.id,
    userName: admin.name,
    userType: 'admin',
    action: 'failed_login',
    resource: 'auth',
    details: 'Failed login attempt - invalid password',
    ipAddress: '127.0.0.1',
    userAgent: navigator.userAgent
  });
  return null;
}