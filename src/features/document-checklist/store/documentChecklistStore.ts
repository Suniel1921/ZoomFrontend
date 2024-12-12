import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  DocumentTemplate, 
  DocumentRequirement, 
  DocumentSubmission,
  DocumentStatus 
} from '../types';

interface DocumentChecklistStore {
  templates: DocumentTemplate[];
  submissions: DocumentSubmission[];
  
  // Template Management
  addTemplate: (template: Omit<DocumentTemplate, 'id' | 'version' | 'lastUpdated'>) => void;
  updateTemplate: (id: string, updates: Partial<DocumentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Submission Management
  addSubmission: (submission: Omit<DocumentSubmission, 'id' | 'uploadedAt'>) => void;
  updateSubmission: (id: string, updates: Partial<DocumentSubmission>) => void;
  deleteSubmission: (id: string) => void;
  
  // Document Status Management
  updateDocumentStatus: (id: string, status: DocumentStatus, metadata?: {
    verifiedBy?: string;
    rejectionReason?: string;
    notes?: string;
  }) => void;
  
  // Queries
  getTemplateByVisaType: (visaType: string, country: string) => DocumentTemplate | null;
  getSubmissionsByApplication: (applicationId: string) => DocumentSubmission[];
  getMissingDocuments: (applicationId: string, templateId: string) => DocumentRequirement[];
  getExpiringDocuments: (days: number) => DocumentSubmission[];
}

export const useDocumentChecklistStore = create<DocumentChecklistStore>()(
  persist(
    (set, get) => ({
      templates: [],
      submissions: [],

      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, {
          ...template,
          id: crypto.randomUUID(),
          version: 1,
          lastUpdated: new Date().toISOString()
        }]
      })),

      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id
            ? {
                ...template,
                ...updates,
                version: template.version + 1,
                lastUpdated: new Date().toISOString()
              }
            : template
        )
      })),

      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((template) => template.id !== id)
      })),

      addSubmission: (submission) => set((state) => ({
        submissions: [...state.submissions, {
          ...submission,
          id: crypto.randomUUID(),
          uploadedAt: new Date().toISOString()
        }]
      })),

      updateSubmission: (id, updates) => set((state) => ({
        submissions: state.submissions.map((submission) =>
          submission.id === id
            ? { ...submission, ...updates }
            : submission
        )
      })),

      deleteSubmission: (id) => set((state) => ({
        submissions: state.submissions.filter((submission) => submission.id !== id)
      })),

      updateDocumentStatus: (id, status, metadata) => set((state) => ({
        submissions: state.submissions.map((submission) =>
          submission.id === id
            ? {
                ...submission,
                status,
                ...(status === 'verified'
                  ? {
                      verifiedBy: metadata?.verifiedBy,
                      verifiedAt: new Date().toISOString()
                    }
                  : status === 'rejected'
                  ? {
                      rejectionReason: metadata?.rejectionReason,
                      notes: metadata?.notes
                    }
                  : {})
              }
            : submission
        )
      })),

      getTemplateByVisaType: (visaType, country) => {
        const { templates } = get();
        return (
          templates.find(
            (t) => t.visaType === visaType && t.country === country
          ) || null
        );
      },

      getSubmissionsByApplication: (applicationId) => {
        const { submissions } = get();
        return submissions.filter((s) => s.applicationId === applicationId);
      },

      getMissingDocuments: (applicationId, templateId) => {
        const { templates, submissions } = get();
        const template = templates.find((t) => t.id === templateId);
        if (!template) return [];

        const applicationSubmissions = submissions.filter(
          (s) => s.applicationId === applicationId
        );

        return template.baseDocuments.filter((doc) => {
          const submitted = applicationSubmissions.some(
            (s) =>
              s.requirementId === doc.id &&
              (s.status === 'verified' || s.status === 'submitted')
          );
          return !submitted && doc.required;
        });
      },

      getExpiringDocuments: (days) => {
        const { submissions } = get();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return submissions.filter((submission) => {
          if (!submission.expiresAt) return false;
          const expiryDate = new Date(submission.expiresAt);
          return expiryDate <= futureDate && submission.status !== 'expired';
        });
      },
    }),
    {
      name: 'document-checklist-store'
    }
  )
);