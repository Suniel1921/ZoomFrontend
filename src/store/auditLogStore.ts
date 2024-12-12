import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { encrypt, decrypt } from '../utils/encryption';
import { generateUUID } from '../utils/cryptoPolyfill';

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'import'
  | 'export'
  | 'view'
  | 'failed_login';

export type UserType = 'super_admin' | 'admin' | 'client';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userType: UserType;
  action: AuditAction;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  metadata?: {
    beforeState?: string;
    afterState?: string;
    browser?: string;
    device?: string;
    os?: string;
  };
}

interface AuditLogState {
  logs: AuditLog[];
  retentionDays: number;
}

interface AuditLogStore extends AuditLogState {
  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  exportLogs: (format: 'csv' | 'pdf') => void;
  setRetentionDays: (days: number) => void;
  clearOldLogs: () => void;
  clearAllLogs: () => void;
}

export const useAuditLogStore = create<AuditLogStore>()(
  persist(
    (set, get) => ({
      logs: [],
      retentionDays: 90,

      addLog: (log) => {
        const encryptedLog = {
          ...log,
          id: generateUUID(),
          timestamp: new Date().toISOString(),
          details: encrypt(log.details),
          metadata: log.metadata ? {
            ...log.metadata,
            beforeState: log.metadata.beforeState ? encrypt(log.metadata.beforeState) : undefined,
            afterState: log.metadata.afterState ? encrypt(log.metadata.afterState) : undefined,
          } : undefined,
        };

        set((state) => ({
          logs: [encryptedLog, ...state.logs]
        }));
      },

      clearOldLogs: () => {
        const { logs, retentionDays } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        set({
          logs: logs.filter(log => 
            new Date(log.timestamp) > cutoffDate
          )
        });
      },

      clearAllLogs: () => {
        set({ logs: [] });
      },

      setRetentionDays: (days) => {
        set({ retentionDays: days });
        get().clearOldLogs();
      },

      exportLogs: (format) => {
        const { logs } = get();
        
        if (format === 'csv') {
          const csvContent = [
            ['Timestamp', 'User', 'Type', 'Action', 'Resource', 'Details', 'IP Address'].join(','),
            ...logs.map(log => [
              log.timestamp,
              log.userName,
              log.userType,
              log.action,
              log.resource,
              decrypt(log.details),
              log.ipAddress
            ].join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
    }),
    {
      name: 'audit-logs',
    }
  )
);

// Export the addLog function for direct usage
export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  useAuditLogStore.getState().addLog(log);
};