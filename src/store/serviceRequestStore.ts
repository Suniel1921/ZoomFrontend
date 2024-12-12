import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUUID } from '../utils/cryptoPolyfill';

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  phoneNumber: string;
  serviceId: string;
  serviceName: string;
  message?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestedAt: string;
  updatedAt: string;
}

interface ServiceRequestStore {
  requests: ServiceRequest[];
  addRequest: (request: Omit<ServiceRequest, 'id' | 'requestedAt' | 'updatedAt' | 'status'>) => void;
  updateRequest: (id: string, updates: Partial<ServiceRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestsByClient: (clientId: string) => ServiceRequest[];
  getPendingRequests: () => ServiceRequest[];
}

export const useServiceRequestStore = create<ServiceRequestStore>()(
  persist(
    (set, get) => ({
      requests: [],
      
      addRequest: (request) =>
        set((state) => ({
          requests: [
            ...state.requests,
            {
              ...request,
              id: generateUUID(),
              status: 'pending',
              requestedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      
      updateRequest: (id, updates) =>
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id
              ? {
                  ...request,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : request
          ),
        })),
      
      deleteRequest: (id) =>
        set((state) => ({
          requests: state.requests.filter((request) => request.id !== id),
        })),
      
      getRequestsByClient: (clientId) => {
        const { requests } = get();
        return requests.filter((request) => request.clientId === clientId);
      },
      
      getPendingRequests: () => {
        const { requests } = get();
        return requests.filter((request) => request.status === 'pending');
      },
    }),
    {
      name: 'service-requests-store',
    }
  )
);