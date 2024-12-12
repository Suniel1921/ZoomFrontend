import type { ProcessFlowTemplate } from '../../types/taskManagement';

export const OTHER_SERVICES_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'Other Services Process',
  serviceType: 'other',
  description: 'Generic process flow for other services',
  steps: [
    {
      id: 'requirement',
      name: 'Requirement Collection',
      description: 'Collect service requirements',
      order: 0,
      status: 'pending',
      documents: [
        {
          id: 'requirement_doc',
          name: 'Requirements Document',
          description: 'Detailed service requirements',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'assessment',
      name: 'Service Assessment',
      description: 'Assess requirements and feasibility',
      order: 1,
      status: 'pending',
      dependsOn: ['requirement'],
      documents: []
    },
    {
      id: 'quote',
      name: 'Quote Preparation',
      description: 'Prepare service quote',
      order: 2,
      status: 'pending',
      dependsOn: ['assessment'],
      documents: []
    },
    {
      id: 'payment',
      name: 'Payment Processing',
      description: 'Process service payment',
      order: 3,
      status: 'pending',
      documents: [
        {
          id: 'payment_proof',
          name: 'Payment Receipt',
          description: 'Service fee payment receipt',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'execution',
      name: 'Service Execution',
      description: 'Execute requested service',
      order: 4,
      status: 'pending',
      dependsOn: ['payment'],
      documents: []
    },
    {
      id: 'review',
      name: 'Service Review',
      description: 'Review completed service',
      order: 5,
      status: 'pending',
      dependsOn: ['execution'],
      documents: []
    },
    {
      id: 'delivery',
      name: 'Service Delivery',
      description: 'Deliver completed service',
      order: 6,
      status: 'pending',
      dependsOn: ['review'],
      documents: [
        {
          id: 'delivery_confirmation',
          name: 'Delivery Confirmation',
          description: 'Service delivery confirmation',
          required: true,
          status: 'required'
        }
      ]
    }
  ],
  documents: [
    {
      id: 'requirements',
      name: 'Service Requirements',
      description: 'Detailed service requirements document',
      required: true,
      status: 'required'
    }
  ],
  payments: [
    {
      id: 'service_fee',
      name: 'Service Fee',
      amount: 0, // Amount varies by service
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'execution'
    }
  ]
};