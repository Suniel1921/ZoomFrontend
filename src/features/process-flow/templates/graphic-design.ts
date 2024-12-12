import type { ProcessFlowTemplate } from '../../types/taskManagement';

export const GRAPHIC_DESIGN_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'Graphic Design Process',
  serviceType: 'design',
  description: 'Complete process flow for graphic design projects',
  steps: [
    {
      id: 'requirement',
      name: 'Requirement Gathering',
      description: 'Collect design requirements and preferences',
      order: 0,
      status: 'pending',
      documents: [
        {
          id: 'brief',
          name: 'Design Brief',
          description: 'Detailed design requirements',
          required: true,
          status: 'required'
        },
        {
          id: 'reference',
          name: 'Reference Materials',
          description: 'Sample designs or references',
          required: false,
          status: 'required'
        }
      ]
    },
    {
      id: 'quote',
      name: 'Quote Preparation',
      description: 'Prepare and send design quote',
      order: 1,
      status: 'pending',
      dependsOn: ['requirement'],
      documents: []
    },
    {
      id: 'payment',
      name: 'Initial Payment',
      description: 'Process advance payment',
      order: 2,
      status: 'pending',
      documents: [
        {
          id: 'payment_proof',
          name: 'Payment Receipt',
          description: 'Advance payment receipt',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'initial_design',
      name: 'Initial Design',
      description: 'Create first design draft',
      order: 3,
      status: 'pending',
      dependsOn: ['payment'],
      documents: []
    },
    {
      id: 'review',
      name: 'Client Review',
      description: 'Get client feedback on design',
      order: 4,
      status: 'pending',
      dependsOn: ['initial_design'],
      documents: []
    },
    {
      id: 'revision',
      name: 'Design Revision',
      description: 'Make requested changes',
      order: 5,
      status: 'pending',
      dependsOn: ['review'],
      documents: []
    },
    {
      id: 'final_approval',
      name: 'Final Approval',
      description: 'Get final approval from client',
      order: 6,
      status: 'pending',
      dependsOn: ['revision'],
      documents: []
    },
    {
      id: 'final_payment',
      name: 'Final Payment',
      description: 'Process remaining payment',
      order: 7,
      status: 'pending',
      dependsOn: ['final_approval'],
      documents: [
        {
          id: 'final_receipt',
          name: 'Final Payment Receipt',
          description: 'Final payment confirmation',
          required: true,
          status: 'required'
        }
      ]
    },
    {
      id: 'delivery',
      name: 'File Delivery',
      description: 'Deliver final design files',
      order: 8,
      status: 'pending',
      dependsOn: ['final_payment'],
      documents: []
    }
  ],
  documents: [
    {
      id: 'design_brief',
      name: 'Design Brief',
      description: 'Detailed project requirements',
      required: true,
      status: 'required'
    },
    {
      id: 'brand_assets',
      name: 'Brand Assets',
      description: 'Logo, colors, and brand guidelines',
      required: false,
      status: 'required'
    }
  ],
  payments: [
    {
      id: 'advance',
      name: 'Advance Payment',
      amount: 0, // Amount varies by project
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'initial_design'
    },
    {
      id: 'final',
      name: 'Final Payment',
      amount: 0, // Amount varies by project
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'delivery'
    }
  ]
};