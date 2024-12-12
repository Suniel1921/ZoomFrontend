import type { ProcessFlowTemplate } from '../../types/taskManagement';

export const TRANSLATION_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'Document Translation Process',
  serviceType: 'translation',
  description: 'Complete process flow for document translation service',
  steps: [
    {
      id: 'doc_receive',
      name: 'Document Reception',
      description: 'Receive original documents for translation',
      order: 0,
      status: 'pending',
      documents: [
        {
          id: 'original_docs',
          name: 'Original Documents',
          description: 'Documents to be translated',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'initial_review',
      name: 'Initial Document Review',
      description: 'Review documents and assess complexity',
      order: 1,
      status: 'pending',
      dependsOn: ['doc_receive'],
      documents: []
    },
    {
      id: 'quote',
      name: 'Quote Preparation',
      description: 'Prepare and send translation quote',
      order: 2,
      status: 'pending',
      dependsOn: ['initial_review'],
      documents: []
    },
    {
      id: 'payment',
      name: 'Payment Processing',
      description: 'Process translation payment',
      order: 3,
      status: 'pending',
      documents: [
        {
          id: 'payment_proof',
          name: 'Payment Receipt',
          description: 'Translation fee payment receipt',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'translation',
      name: 'Translation Process',
      description: 'Translate documents',
      order: 4,
      status: 'pending',
      dependsOn: ['payment'],
      documents: []
    },
    {
      id: 'review',
      name: 'Quality Review',
      description: 'Review translated documents',
      order: 5,
      status: 'pending',
      dependsOn: ['translation'],
      documents: []
    },
    {
      id: 'delivery',
      name: 'Document Delivery',
      description: 'Deliver translated documents',
      order: 6,
      status: 'pending',
      dependsOn: ['review'],
      documents: [
        {
          id: 'delivery_receipt',
          name: 'Delivery Receipt',
          description: 'Document delivery confirmation',
          required: true,
          status: 'required'
        }
      ]
    }
  ],
  documents: [
    {
      id: 'source_docs',
      name: 'Source Documents',
      description: 'Original documents for translation',
      required: true,
      status: 'required'
    }
  ],
  payments: [
    {
      id: 'translation_fee',
      name: 'Translation Fee',
      amount: 0, // Amount varies based on document
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'translation'
    }
  ]
};