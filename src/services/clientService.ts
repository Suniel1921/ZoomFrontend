import { useStore } from '../store';
import { Client } from '../types';

export const getClientByEmail = (email: string): Client | null => {
  const { clients } = useStore.getState();
  return clients.find(client => client.email === email) || null;
};

export const getClientApplications = (clientId: string) => {
  const { applications } = useStore.getState();
  return applications.filter(app => app.clientId === clientId);
};

export const getClientAppointments = (clientId: string) => {
  const { appointments } = useStore.getState();
  return appointments.filter(apt => apt.clientId === clientId);
};