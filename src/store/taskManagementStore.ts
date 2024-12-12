import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TEMPLATES } from '../constants/processTemplates';
import { generateUUID } from '../utils/cryptoPolyfill';
import type { 
  ProcessFlowTemplate, 
  ClientProcess, 
  TaskStep, 
  DocumentRequirement,
  PaymentMilestone,
  TaskStatus 
} from '../types/taskManagement';

interface TaskManagementStore {
  templates: ProcessFlowTemplate[];
  clientProcesses: ClientProcess[];
  
  // Template Management
  addTemplate: (template: Omit<ProcessFlowTemplate, 'id' | 'version' | 'lastUpdated'>) => void;
  updateTemplate: (id: string, updates: Partial<ProcessFlowTemplate>) => void;
  deleteTemplate: (id: string) => void;
  toggleTemplateActive: (id: string) => void;

  // Client Process Management
  createClientProcess: (templateId: string, clientId: string, dueDate?: string, serviceAmount?: number) => void;
  updateClientProcess: (id: string, updates: Partial<ClientProcess>) => void;
  deleteClientProcess: (id: string) => void;
  deleteClientProcessesByTask: (clientId: string, serviceType: string) => void;

  // Task Step Management
  updateTaskStep: (processId: string, stepId: string, updates: Partial<TaskStep>) => void;
  completeTaskStep: (processId: string, stepId: string) => void;

  // Document Status Management
  updateDocument: (processId: string, docId: string, updates: Partial<DocumentRequirement>) => void;
  uploadDocument: (processId: string, docId: string, file: { id: string; name: string; url: string }) => void;

  // Payment Management
  updatePayment: (processId: string, paymentId: string, updates: Partial<PaymentMilestone>) => void;
  recordPayment: (processId: string, paymentId: string, amount: number) => void;

  // Queries
  getTemplateById: (id: string) => ProcessFlowTemplate | undefined;
  getClientProcessById: (id: string) => ClientProcess | undefined;
  getClientProcesses: (clientId: string) => ClientProcess[];
  getActiveTemplates: () => ProcessFlowTemplate[];
}

export const useTaskManagementStore = create<TaskManagementStore>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES.map(template => ({
        ...template,
        id: generateUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      })),
      clientProcesses: [],

      addTemplate(template) {
        set((state) => ({
          templates: [...state.templates, {
            ...template,
            id: generateUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
          }]
        }));
      },

      updateTemplate(id, updates) {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? {
                  ...template,
                  ...updates,
                  updatedAt: new Date().toISOString()
                }
              : template
          )
        }));
      },

      deleteTemplate(id) {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id)
        }));
      },

      toggleTemplateActive(id) {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, isActive: !template.isActive }
              : template
          )
        }));
      },

      createClientProcess(templateId, clientId, dueDate, serviceAmount) {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return;

        const newProcess: ClientProcess = {
          id: generateUUID(),
          templateId,
          clientId,
          currentStep: template.steps[0].id,
          status: 'pending',
          steps: template.steps.map(step => ({
            ...step,
            status: 'pending',
          })),
          documents: template.documents.map(doc => ({
            ...doc,
            status: 'required',
          })),
          payments: template.payments.map(payment => ({
            ...payment,
            amount: serviceAmount || payment.amount,
            status: 'pending',
            paidAmount: 0,
          })),
          startDate: new Date().toISOString(),
          dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          clientProcesses: [...state.clientProcesses, newProcess],
        }));

        return newProcess;
      },

      updateClientProcess(id, updates) {
        set((state) => ({
          clientProcesses: state.clientProcesses.map((process) =>
            process.id === id
              ? {
                  ...process,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : process
          )
        }));
      },

      deleteClientProcess(id) {
        set((state) => ({
          clientProcesses: state.clientProcesses.filter((process) => process.id !== id)
        }));
      },

      deleteClientProcessesByTask(clientId, serviceType) {
        set((state) => ({
          clientProcesses: state.clientProcesses.filter((process) => {
            const template = state.templates.find(t => t.id === process.templateId);
            return !(process.clientId === clientId && template?.serviceType === serviceType);
          })
        }));
      },

      updateTaskStep(processId, stepId, updates) {
        set((state) => ({
          clientProcesses: state.clientProcesses.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  steps: process.steps.map((step) =>
                    step.id === stepId
                      ? { ...step, ...updates }
                      : step
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : process
          )
        }));
      },

      completeTaskStep(processId, stepId) {
        const process = get().clientProcesses.find((p) => p.id === processId);
        if (!process) return;

        const currentStepIndex = process.steps.findIndex((s) => s.id === stepId);
        const nextStep = process.steps[currentStepIndex + 1];

        set((state) => ({
          clientProcesses: state.clientProcesses.map((p) =>
            p.id === processId
              ? {
                  ...p,
                  steps: p.steps.map((step) =>
                    step.id === stepId
                      ? {
                          ...step,
                          status: 'completed',
                          completedAt: new Date().toISOString(),
                        }
                      : step
                  ),
                  currentStep: nextStep?.id || stepId,
                  status: nextStep ? 'in_progress' : 'completed',
                  completedAt: nextStep ? undefined : new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      updateDocument(processId, docId, updates) {
        set((state) => ({
          clientProcesses: state.clientProcesses.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  documents: process.documents.map((doc) =>
                    doc.id === docId
                      ? { ...doc, ...updates }
                      : doc
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : process
          )
        }));
      },

      uploadDocument(processId, docId, file) {
        set((state) => ({
          clientProcesses: state.clientProcesses.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  documents: process.documents.map((doc) =>
                    doc.id === docId
                      ? {
                          ...doc,
                          status: 'received',
                          uploadedFile: {
                            ...file,
                            uploadedAt: new Date().toISOString(),
                          },
                        }
                      : doc
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : process
          )
        }));
      },

      updatePayment(processId, paymentId, updates) {
        set((state) => ({
          clientProcesses: state.clientProcesses.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  payments: process.payments.map((payment) =>
                    payment.id === paymentId
                      ? { ...payment, ...updates }
                      : payment
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : process
          )
        }));
      },

      recordPayment(processId, paymentId, amount) {
        const process = get().clientProcesses.find((p) => p.id === processId);
        const payment = process?.payments.find((p) => p.id === paymentId);
        if (!process || !payment) return;

        const newPaidAmount = payment.paidAmount + amount;
        const newStatus: PaymentMilestone['status'] = 
          newPaidAmount >= payment.amount ? 'completed' :
          newPaidAmount > 0 ? 'partial' : 'pending';

        set((state) => ({
          clientProcesses: state.clientProcesses.map((p) =>
            p.id === processId
              ? {
                  ...p,
                  payments: p.payments.map((pay) =>
                    pay.id === paymentId
                      ? {
                          ...pay,
                          paidAmount: newPaidAmount,
                          status: newStatus,
                          paidAt: new Date().toISOString(),
                        }
                      : pay
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      getTemplateById: (id) => get().templates.find((t) => t.id === id),
      
      getClientProcessById: (id) => get().clientProcesses.find((p) => p.id === id),
      
      getClientProcesses: (clientId) => 
        get().clientProcesses.filter((p) => p.clientId === clientId),
      
      getActiveTemplates: () => 
        get().templates.filter((t) => t.isActive),
    }),
    {
      name: 'task-management-store',
    }
  )
);