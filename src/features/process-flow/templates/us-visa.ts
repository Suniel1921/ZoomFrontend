import type { ProcessFlowTemplate } from '../../types/taskManagement';

export const US_VISA_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'US Visit Visa Process',
  serviceType: 'us_visa',
  description: 'Complete process flow for US visit visa application',
  steps: [
    {
      id: 'embassy_appointment',
      name: 'Embassy Appointment Booking',
      description: 'Schedule appointment with US Embassy',
      order: 0,
      status: 'pending',
      documents: [
        {
          id: 'passport_copy',
          name: 'Passport Copy',
          description: 'Clear copy of passport bio page',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'basic_info',
      name: 'Basic Information Collection',
      description: 'Collect basic information and photo',
      order: 1,
      status: 'pending',
      documents: [
        {
          id: 'photo',
          name: 'Passport Photo',
          description: 'US visa specification photo',
          required: true,
          status: 'required'
        },
        {
          id: 'info_form',
          name: 'Basic Information Form',
          description: 'Completed basic information form',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'ds160_fill',
      name: 'DS-160 Form Filling',
      description: 'Complete DS-160 form',
      order: 2,
      status: 'pending',
      dependsOn: ['basic_info'],
      documents: []
    },
    {
      id: 'ds160_review',
      name: 'DS-160 Review',
      description: 'Review DS-160 form for accuracy',
      order: 3,
      status: 'pending',
      dependsOn: ['ds160_fill'],
      documents: [
        {
          id: 'ds160_draft',
          name: 'DS-160 Draft',
          description: 'Draft DS-160 for review',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'ds160_submit',
      name: 'DS-160 Correction & Submission',
      description: 'Make corrections and submit DS-160',
      order: 4,
      status: 'pending',
      dependsOn: ['ds160_review'],
      documents: [
        {
          id: 'ds160_confirmation',
          name: 'DS-160 Confirmation',
          description: 'DS-160 submission confirmation page',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'doc_collection',
      name: 'Document Collection',
      description: 'Collect all required supporting documents',
      order: 5,
      status: 'pending',
      documents: [
        {
          id: 'bank_statement',
          name: 'Bank Statement',
          description: 'Last 6 months bank statements',
          required: true,
          status: 'required'
        },
        {
          id: 'tax_docs',
          name: 'Tax Documents',
          description: 'Recent tax documents',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'translation',
      name: 'Document Translation',
      description: 'Translate required documents',
      order: 6,
      status: 'pending',
      dependsOn: ['doc_collection'],
      documents: []
    },
    {
      id: 'doc_finalize',
      name: 'Documentation Finalizing',
      description: 'Organize and finalize all documents',
      order: 7,
      status: 'pending',
      dependsOn: ['translation'],
      documents: []
    },
    {
      id: 'payment',
      name: 'Payment Confirmation',
      description: 'Confirm all payments are completed',
      order: 8,
      status: 'pending',
      documents: [
        {
          id: 'payment_receipt',
          name: 'Payment Receipt',
          description: 'Visa fee payment receipt',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'delivery',
      name: 'Document Delivery',
      description: 'Deliver final documents to client',
      order: 9,
      status: 'pending',
      dependsOn: ['doc_finalize', 'payment'],
      documents: []
    }
  ],
  documents: [
    {
      id: 'passport',
      name: 'Valid Passport',
      description: 'Passport with at least 6 months validity',
      required: true,
      status: 'required'
    },
    {
      id: 'photos',
      name: 'Passport Photos',
      description: 'Recent passport size photos',
      required: true,
      status: 'required'
    },
    {
      id: 'financial_docs',
      name: 'Financial Documents',
      description: 'Bank statements and other financial proof',
      required: true,
      status: 'required'
    }
  ],
  payments: [
    {
      id: 'initial_payment',
      name: 'Initial Payment',
      amount: 50000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'ds160_fill'
    },
    {
      id: 'final_payment',
      name: 'Final Payment',
      amount: 50000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'doc_finalize'
    }
  ]
};