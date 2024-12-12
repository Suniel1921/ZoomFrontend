import type { ProcessFlowTemplate } from '../../types/taskManagement';

export const JAPAN_VISA_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'Japan Visit Visa Process',
  serviceType: 'japan_visa',
  description: 'Complete process flow for Japan visit visa application',
  steps: [
    {
      id: 'basic_info',
      name: 'Basic Information Collection',
      description: 'Collect basic applicant information and requirements',
      order: 0,
      status: 'pending',
      documents: [
        {
          id: 'passport',
          name: 'Valid Passport',
          description: 'Passport with at least 6 months validity',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'schedule',
      name: 'Schedule Preparation',
      description: 'Prepare detailed travel schedule',
      order: 1,
      status: 'pending',
      documents: [
        {
          id: 'schedule',
          name: 'Travel Schedule',
          description: 'Day-by-day travel itinerary',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'doc_collection',
      name: 'Document Collection',
      description: 'Collect all required supporting documents',
      order: 2,
      status: 'pending',
      documents: [
        {
          id: 'bank_statement',
          name: 'Bank Statement',
          description: 'Last 3 months bank statements',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'translation',
      name: 'Document Translation',
      description: 'Translate required documents to Japanese',
      order: 3,
      status: 'pending',
      dependsOn: ['doc_collection'],
      documents: []
    },
    {
      id: 'application_form',
      name: 'Application Form',
      description: 'Complete and review visa application form',
      order: 4,
      status: 'pending',
      documents: [
        {
          id: 'visa_form',
          name: 'Visa Application Form',
          description: 'Completed visa application form',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'payment',
      name: 'Payment Processing',
      description: 'Process visa application fees',
      order: 5,
      status: 'pending',
      documents: [
        {
          id: 'payment_proof',
          name: 'Payment Receipt',
          description: 'Visa fee payment receipt',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'submission',
      name: 'Application Submission',
      description: 'Submit application to embassy',
      order: 6,
      status: 'pending',
      dependsOn: ['application_form', 'payment'],
      documents: []
    }
  ],
  documents: [
    {
      id: 'passport',
      name: 'Valid Passport',
      description: 'Original passport with at least 6 months validity',
      required: true,
      status: 'required'
    },
    {
      id: 'photos',
      name: 'Passport Photos',
      description: '4.5cm x 4.5cm photos with white background',
      required: true,
      status: 'required'
    },
    {
      id: 'bank_docs',
      name: 'Bank Documents',
      description: 'Bank statements and balance certificate',
      required: true,
      status: 'required'
    }
  ],
  payments: [
    {
      id: 'initial_payment',
      name: 'Initial Payment',
      amount: 30000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'application_form'
    },
    {
      id: 'final_payment',
      name: 'Final Payment',
      amount: 20000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'submission'
    }
  ]
};