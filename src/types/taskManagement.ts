import { z } from 'zod';

// Task Status Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'completed';
export type DocumentStatus = 'required' | 'received' | 'verified' | 'rejected';

// Document Requirement
export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  uploadedFile?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  };
  verifiedAt?: string;
  rejectionReason?: string;
}

// Task Step
export interface TaskStep {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  order: number;
  dependsOn?: string[]; // IDs of tasks this step depends on
  documents: DocumentRequirement[];
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

// Payment Milestone
export interface PaymentMilestone {
  id: string;
  name: string;
  amount: number;
  dueDate?: string;
  status: PaymentStatus;
  paidAmount: number;
  paidAt?: string;
  requiredForStep?: string; // Step ID that requires this payment
}

// Process Flow Template
export interface ProcessFlowTemplate {
  id: string;
  name: string;
  serviceType: 'us_visa' | 'japan_visa' | 'translation' | 'epassport' | 'design' | 'other';
  description: string;
  steps: TaskStep[];
  documents: DocumentRequirement[];
  payments: PaymentMilestone[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Client Process Instance
export interface ClientProcess {
  id: string;
  templateId: string;
  clientId: string;
  currentStep: string;
  status: TaskStatus;
  steps: TaskStep[];
  documents: DocumentRequirement[];
  payments: PaymentMilestone[];
  startDate: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Validation Schemas
export const documentRequirementSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  required: z.boolean(),
});

export const taskStepSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  order: z.number().min(0),
  dependsOn: z.array(z.string()).optional(),
  documents: z.array(documentRequirementSchema),
  dueDate: z.string().optional(),
});

export const paymentMilestoneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0),
  dueDate: z.string().optional(),
  requiredForStep: z.string().optional(),
});

export const processFlowTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  serviceType: z.enum(['us_visa', 'japan_visa', 'translation', 'epassport', 'design', 'other']),
  description: z.string(),
  steps: z.array(taskStepSchema),
  documents: z.array(documentRequirementSchema),
  payments: z.array(paymentMilestoneSchema),
});