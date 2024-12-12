import { z } from 'zod';

export type DocumentStatus = 'pending' | 'submitted' | 'verified' | 'rejected' | 'expired';
export type DocumentPriority = 'critical' | 'high' | 'medium' | 'low';

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  priority: DocumentPriority;
  required: boolean;
  validityPeriod?: number; // in days
  alternatives?: string[];
  validationRules?: {
    type: 'fileType' | 'fileSize' | 'expiration' | 'custom';
    value: string | number;
    message: string;
  }[];
  examples?: string[];
  notes?: string;
}

export interface ConditionalDocument extends DocumentRequirement {
  condition: {
    field: string;
    operator: 'equals' | 'notEquals' | 'includes' | 'excludes';
    value: string | string[];
  };
}

export interface DocumentTemplate {
  id: string;
  name: string;
  visaType: string;
  country: string;
  applicationType: string;
  baseDocuments: DocumentRequirement[];
  conditionalDocuments: ConditionalDocument[];
  version: number;
  lastUpdated: string;
}

export interface DocumentSubmission {
  id: string;
  requirementId: string;
  clientId: string;
  applicationId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  expiresAt?: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export const documentRequirementSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  required: z.boolean(),
  validityPeriod: z.number().optional(),
  alternatives: z.array(z.string()).optional(),
  validationRules: z.array(z.object({
    type: z.enum(['fileType', 'fileSize', 'expiration', 'custom']),
    value: z.union([z.string(), z.number()]),
    message: z.string()
  })).optional(),
  examples: z.array(z.string()).optional(),
  notes: z.string().optional()
});