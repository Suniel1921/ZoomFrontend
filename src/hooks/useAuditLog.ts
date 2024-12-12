import { useCallback } from 'react';
import { addAuditLog, type AuditAction } from '../store/auditLogStore';

export function useAuditLog() {
  const logActivity = useCallback((
    userId: string,
    userName: string,
    userType: 'super_admin' | 'admin' | 'client',
    action: AuditAction,
    resource: string,
    details: string,
    metadata?: {
      beforeState?: any;
      afterState?: any;
    }
  ) => {
    // Get client IP address (in a real app, this would come from the server)
    const ipAddress = '127.0.0.1';

    // Get browser and device info
    const userAgent = window.navigator.userAgent;
    const browser = detectBrowser(userAgent);
    const device = detectDevice(userAgent);
    const os = detectOS(userAgent);

    addAuditLog({
      userId,
      userName,
      userType,
      action,
      resource,
      details,
      ipAddress,
      userAgent,
      metadata: {
        ...metadata,
        browser,
        device,
        os,
      },
    });
  }, []);

  return { logActivity };
}

// Browser detection helper
function detectBrowser(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

// Device detection helper
function detectDevice(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}

// OS detection helper
function detectOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}</content>