import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTaskManagementStore } from './taskManagementStore';
import { addAuditLog } from './auditLogStore';
import { generateUUID } from '../utils/cryptoPolyfill';
import type { 
  Appointment, Translation, Client, Application, 
  JapanVisitApplication, GraphicDesignJob, 
  EpassportApplication, OtherService 
} from '../types';

interface Store {
  clients: Client[];
  applications: Application[];
  japanVisitApplications: JapanVisitApplication[];
  translations: Translation[];
  graphicDesignJobs: GraphicDesignJob[];
  epassportApplications: EpassportApplication[];
  otherServices: OtherService[];
  appointments: Appointment[];

  // Client Methods
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Application Methods
  addApplication: (application: Omit<Application, 'id' | 'submissionDate'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;

  // Japan Visit Methods
  addJapanVisitApplication: (application: Omit<JapanVisitApplication, 'id' | 'submissionDate'>) => void;
  updateJapanVisitApplication: (id: string, updates: Partial<JapanVisitApplication>) => void;
  deleteJapanVisitApplication: (id: string) => void;

  // Translation Methods
  addTranslation: (translation: Omit<Translation, 'id' | 'createdAt'>) => void;
  updateTranslation: (id: string, updates: Partial<Translation>) => void;
  deleteTranslation: (id: string) => void;

  // Graphic Design Methods
  addGraphicDesignJob: (job: Omit<GraphicDesignJob, 'id' | 'createdAt'>) => void;
  updateGraphicDesignJob: (id: string, updates: Partial<GraphicDesignJob>) => void;
  deleteGraphicDesignJob: (id: string) => void;

  // ePassport Methods
  addEpassportApplication: (application: Omit<EpassportApplication, 'id'>) => void;
  updateEpassportApplication: (id: string, updates: Partial<EpassportApplication>) => void;
  deleteEpassportApplication: (id: string) => void;

  // Other Services Methods
  addOtherService: (service: Omit<OtherService, 'id' | 'createdAt'>) => void;
  updateOtherService: (id: string, updates: Partial<OtherService>) => void;
  deleteOtherService: (id: string) => void;

  // Appointment Methods
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
}

// Helper function to create process flows
const createProcessFlow = (clientId: string, serviceType: string, amount: number, deadline?: string) => {
  const { templates } = useTaskManagementStore.getState();
  const template = templates.find(t => t.serviceType === serviceType && t.isActive);
  
  if (template) {
    useTaskManagementStore.getState().createClientProcess(
      template.id,
      clientId,
      deadline,
      amount
    );
  }
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      clients: [],
      applications: [],
      japanVisitApplications: [],
      translations: [],
      graphicDesignJobs: [],
      epassportApplications: [],
      otherServices: [],
      appointments: [],

      addClient: (client) => set((state) => {
        const newClient = { ...client, id: generateUUID() };
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'clients',
          details: `Created new client: ${client.name}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });
        return { clients: [...state.clients, newClient] };
      }),

      updateClient: (id, updates) => set((state) => {
        const client = state.clients.find(c => c.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'clients',
          details: `Updated client: ${client?.name}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(client),
            afterState: JSON.stringify({ ...client, ...updates })
          }
        });
        return {
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...updates } : client
          )
        };
      }),

      deleteClient: (id) => set((state) => {
        const client = state.clients.find(c => c.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'delete',
          resource: 'clients',
          details: `Deleted client: ${client?.name}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(client)
          }
        });
        return { clients: state.clients.filter((client) => client.id !== id) };
      }),

      addApplication: (application) => set((state) => {
        const newApplication = {
          ...application,
          id: generateUUID(),
          submissionDate: new Date().toISOString(),
        };

        // Create process flow
        createProcessFlow(
          application.clientId,
          'us_visa',
          application.payment.total,
          application.deadline
        );

        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'applications',
          details: `Created new visa application for: ${application.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });

        return { applications: [...state.applications, newApplication] };
      }),

      updateApplication: (id, updates) => set((state) => {
        const application = state.applications.find(a => a.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'applications',
          details: `Updated visa application for: ${application?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(application),
            afterState: JSON.stringify({ ...application, ...updates })
          }
        });
        return {
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, ...updates } : app
          )
        };
      }),

      deleteApplication: (id) => set((state) => {
        const app = state.applications.find(a => a.id === id);
        if (app) {
          useTaskManagementStore.getState().deleteClientProcessesByTask(app.clientId, 'us_visa');
          addAuditLog({
            userId: 'system',
            userName: 'System',
            userType: 'admin',
            action: 'delete',
            resource: 'applications',
            details: `Deleted visa application for: ${app.clientName}`,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            metadata: {
              beforeState: JSON.stringify(app)
            }
          });
        }
        return { applications: state.applications.filter((app) => app.id !== id) };
      }),

      addJapanVisitApplication: (application) => set((state) => {
        const newApplication = {
          ...application,
          id: generateUUID(),
          submissionDate: new Date().toISOString(),
        };

        // Create process flow
        createProcessFlow(
          application.clientId,
          'japan_visa',
          application.amount,
          application.deadline
        );

        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'japan_visit',
          details: `Created new Japan visit application for: ${application.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });

        return { japanVisitApplications: [...state.japanVisitApplications, newApplication] };
      }),

      updateJapanVisitApplication: (id, updates) => set((state) => {
        const application = state.japanVisitApplications.find(a => a.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'japan_visit',
          details: `Updated Japan visit application for: ${application?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(application),
            afterState: JSON.stringify({ ...application, ...updates })
          }
        });
        return {
          japanVisitApplications: state.japanVisitApplications.map((app) =>
            app.id === id ? { ...app, ...updates } : app
          )
        };
      }),

      deleteJapanVisitApplication: (id) => set((state) => {
        const app = state.japanVisitApplications.find(a => a.id === id);
        if (app) {
          useTaskManagementStore.getState().deleteClientProcessesByTask(app.clientId, 'japan_visa');
          addAuditLog({
            userId: 'system',
            userName: 'System',
            userType: 'admin',
            action: 'delete',
            resource: 'japan_visit',
            details: `Deleted Japan visit application for: ${app.clientName}`,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            metadata: {
              beforeState: JSON.stringify(app)
            }
          });
        }
        return { japanVisitApplications: state.japanVisitApplications.filter((app) => app.id !== id) };
      }),

      addTranslation: (translation) => set((state) => {
        const newTranslation = {
          ...translation,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
        };

        // Create process flow
        createProcessFlow(
          translation.clientId,
          'translation',
          translation.amount,
          translation.deadline
        );

        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'translations',
          details: `Created new translation for: ${translation.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });

        return { translations: [...state.translations, newTranslation] };
      }),

      updateTranslation: (id, updates) => set((state) => {
        const translation = state.translations.find(t => t.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'translations',
          details: `Updated translation for: ${translation?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(translation),
            afterState: JSON.stringify({ ...translation, ...updates })
          }
        });
        return {
          translations: state.translations.map((trans) =>
            trans.id === id ? { ...trans, ...updates } : trans
          )
        };
      }),

      deleteTranslation: (id) => set((state) => {
        const translation = state.translations.find(t => t.id === id);
        if (translation) {
          useTaskManagementStore.getState().deleteClientProcessesByTask(translation.clientId, 'translation');
          addAuditLog({
            userId: 'system',
            userName: 'System',
            userType: 'admin',
            action: 'delete',
            resource: 'translations',
            details: `Deleted translation for: ${translation.clientName}`,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            metadata: {
              beforeState: JSON.stringify(translation)
            }
          });
        }
        return { translations: state.translations.filter((trans) => trans.id !== id) };
      }),

      addGraphicDesignJob: (job) => set((state) => {
        const newJob = {
          ...job,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
        };

        // Create process flow
        createProcessFlow(
          job.clientId,
          'design',
          job.amount,
          job.deadline
        );

        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'designs',
          details: `Created new design job for: ${job.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });

        return { graphicDesignJobs: [...state.graphicDesignJobs, newJob] };
      }),

      updateGraphicDesignJob: (id, updates) => set((state) => {
        const job = state.graphicDesignJobs.find(j => j.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'designs',
          details: `Updated design job for: ${job?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(job),
            afterState: JSON.stringify({ ...job, ...updates })
          }
        });
        return {
          graphicDesignJobs: state.graphicDesignJobs.map((job) =>
            job.id === id ? { ...job, ...updates } : job
          )
        };
      }),

      deleteGraphicDesignJob: (id) => set((state) => {
        const job = state.graphicDesignJobs.find(j => j.id === id);
        if (job) {
          useTaskManagementStore.getState().deleteClientProcessesByTask(job.clientId, 'design');
          addAuditLog({
            userId: 'system',
            userName: 'System',
            userType: 'admin',
            action: 'delete',
            resource: 'designs',
            details: `Deleted design job for: ${job.clientName}`,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            metadata: {
              beforeState: JSON.stringify(job)
            }
          });
        }
        return { graphicDesignJobs: state.graphicDesignJobs.filter((job) => job.id !== id) };
      }),

      addEpassportApplication: (application) => set((state) => {
        const newApplication = {
          ...application,
          id: generateUUID(),
        };

        // Create process flow
        createProcessFlow(
          application.clientId,
          'epassport',
          application.amount,
          application.deadline
        );

        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'epassport',
          details: `Created new ePassport application for: ${application.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });

        return { epassportApplications: [...state.epassportApplications, newApplication] };
      }),

      updateEpassportApplication: (id, updates) => set((state) => {
        const application = state.epassportApplications.find(a => a.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'epassport',
          details: `Updated ePassport application for: ${application?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(application),
            afterState: JSON.stringify({ ...application, ...updates })
          }
        });
        return {
          epassportApplications: state.epassportApplications.map((app) =>
            app.id === id ? { ...app, ...updates } : app
          )
        };
      }),

      deleteEpassportApplication: (id) => set((state) => {
        const app = state.epassportApplications.find(a => a.id === id);
        if (app) {
          useTaskManagementStore.getState().deleteClientProcessesByTask(app.clientId, 'epassport');
          addAuditLog({
            userId: 'system',
            userName: 'System',
            userType: 'admin',
            action: 'delete',
            resource: 'epassport',
            details: `Deleted ePassport application for: ${app.clientName}`,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            metadata: {
              beforeState: JSON.stringify(app)
            }
          });
        }
        return { epassportApplications: state.epassportApplications.filter((app) => app.id !== id) };
      }),

      addOtherService: (service) => set((state) => {
        const newService = {
          ...service,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
        };

        // Create process flow
        createProcessFlow(
          service.clientId,
          'other',
          service.amount,
          service.deadline
        );

        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'other_services',
          details: `Created new service for: ${service.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });

        return { otherServices: [...state.otherServices, newService] };
      }),

      updateOtherService: (id, updates) => set((state) => {
        const service = state.otherServices.find(s => s.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'other_services',
          details: `Updated service for: ${service?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(service),
            afterState: JSON.stringify({ ...service, ...updates })
          }
        });
        return {
          otherServices: state.otherServices.map((service) =>
            service.id === id ? { ...service, ...updates } : service
          )
        };
      }),

      deleteOtherService: (id) => set((state) => {
        const service = state.otherServices.find(s => s.id === id);
        if (service) {
          useTaskManagementStore.getState().deleteClientProcessesByTask(service.clientId, 'other');
          addAuditLog({
            userId: 'system',
            userName: 'System',
            userType: 'admin',
            action: 'delete',
            resource: 'other_services',
            details: `Deleted service for: ${service.clientName}`,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            metadata: {
              beforeState: JSON.stringify(service)
            }
          });
        }
        return { otherServices: state.otherServices.filter((service) => service.id !== id) };
      }),

      addAppointment: (appointment) => set((state) => {
        const newAppointment = {
          ...appointment,
          id: generateUUID(),
        };

        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'create',
          resource: 'appointments',
          details: `Created new appointment for: ${appointment.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent
        });

        return { appointments: [...state.appointments, newAppointment] };
      }),

      updateAppointment: (id, updates) => set((state) => {
        const appointment = state.appointments.find(a => a.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'update',
          resource: 'appointments',
          details: `Updated appointment for: ${appointment?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(appointment),
            afterState: JSON.stringify({ ...appointment, ...updates })
          }
        });
        return {
          appointments: state.appointments.map((apt) =>
            apt.id === id ? { ...apt, ...updates } : apt
          )
        };
      }),

      deleteAppointment: (id) => set((state) => {
        const appointment = state.appointments.find(a => a.id === id);
        addAuditLog({
          userId: 'system',
          userName: 'System',
          userType: 'admin',
          action: 'delete',
          resource: 'appointments',
          details: `Deleted appointment for: ${appointment?.clientName}`,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          metadata: {
            beforeState: JSON.stringify(appointment)
          }
        });
        return { appointments: state.appointments.filter((apt) => apt.id !== id) };
      }),
    }),
    {
      name: 'visa-consultation-store',
    }
  )
);