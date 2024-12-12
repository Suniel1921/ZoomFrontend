import type { ProcessFlowTemplate } from '../../types/taskManagement';

export const EPASSPORT_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'ePassport Application Process',
  serviceType: 'epassport',
  description: 'Complete process flow for ePassport application',
  steps: [
    {
      id: 'info_collection',
      name: 'Information Collection',
      description: 'Collect required information and documents',
      order: 0,
      status: 'pending',
      documents: [
        {
          id: 'old_passport',
          name: 'Old Passport',
          description: 'Previous passport if available',
          required: true,
          status: 'required'
        },
        {
          id: 'citizenship',
          name: 'Citizenship',
          description: 'Citizenship certificate',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'form_filling',
      name: 'Form Filling',
      description: 'Complete ePassport application form',
      order: 1,
      status: 'pending',
      dependsOn: ['info_collection'],
      documents: []
    },
    {
      id: 'photo_capture',
      name: 'Photo Capture',
      description: 'Take passport-size photos',
      order: 2,
      status: 'pending',
      documents: [
        {
          id: 'photos',
          name: 'Passport Photos',
          description: 'Digital passport photos',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'payment',
      name: 'Payment Processing',
      description: 'Process application fees',
      order: 3,
      status: 'pending',
      documents: [
        {
          id: 'payment_receipt',
          name: 'Payment Receipt',
          description: 'Application fee payment receipt',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'submission',
      name: 'Application Submission',
      description: 'Submit application online',
      order: 4,
      status: 'pending',
      dependsOn: ['form_filling', 'photo_capture', 'payment'],
      documents: []
    },
    {
      id: 'appointment',
      name: 'Appointment Scheduling',
      description: 'Schedule biometric appointment',
      order: 5,
      status: 'pending',
      dependsOn: ['submission'],
      documents: [
        {
          id: 'appointment_slip',
          name: 'Appointment Slip',
          description: 'Biometric appointment confirmation',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'biometric',
      name: 'Biometric Collection',
      description: 'Complete biometric collection',
      order: 6,
      status: 'pending',
      dependsOn: ['appointment'],
      documents: []
    },
    {
      id: 'tracking',
      name: 'Application Tracking',
      description: 'Track application status',
      order: 7,
      status: 'pending',
      dependsOn: ['biometric'],
      documents: []
    }
  ],
  documents: [
    {
      id: 'citizenship',
      name: 'Citizenship Certificate',
      description: 'Original citizenship certificate',
      required: true,
      status: 'required'
    },
    {
      id: 'old_passport',
      name: 'Old Passport',
      description: 'Previous passport if renewal',
      required: false,
      status: 'required'
    }
  ],
  payments: [
    {
      id: 'application_fee',
      name: 'Application Fee',
      amount: 12000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'submission'
    },
    {
      id: 'service_fee',
      name: 'Service Fee',
      amount: 3000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'form_filling'
    }
  ]
};