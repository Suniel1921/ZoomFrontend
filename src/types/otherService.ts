import { SERVICE_TYPES } from '../constants/serviceTypes';

export type ServiceType = typeof SERVICE_TYPES[number];

export interface OtherService {
  id: string;
  clientId: string;
  clientName: string;
  mobileNo: string;
  serviceTypes: ServiceType[]; // Changed from serviceType to serviceTypes array
  otherServiceDetails?: string;
  contactChannel: 'Viber' | 'Facebook' | 'WhatsApp' | 'Friend' | 'Office Visit';
  deadline: string;
  amount: number;
  paidAmount: number;
  discount: number;
  dueAmount: number;
  paymentStatus: 'Due' | 'Paid';
  paymentMethod?: 'Bank Furicomy' | 'Counter Cash' | 'Credit Card' | 'Paypay' | 'Line Pay';
  handledBy: string;
  jobStatus: 'Details Pending' | 'Under Process' | 'Completed';
  createdAt: string;
  updatedAt: string;
  remarks?: string;
}