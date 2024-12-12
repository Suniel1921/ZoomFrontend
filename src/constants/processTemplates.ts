import type { ProcessFlowTemplate } from '../types/taskManagement';

// US Visa Process Template
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
      documents: []
    },
    {
      id: 'basic_info',
      name: 'Basic Information Collection',
      description: 'Collect basic information and photo',
      order: 1,
      status: 'pending',
      documents: []
    },
    {
      id: 'ds160_fill',
      name: 'DS-160 Form Filling',
      description: 'Fill out DS-160 form',
      order: 2,
      status: 'pending',
      dependsOn: ['basic_info'],
      documents: []
    },
    {
      id: 'ds160_review',
      name: 'DS-160 Form Review',
      description: 'Review DS-160 form',
      order: 3,
      status: 'pending',
      dependsOn: ['ds160_fill'],
      documents: []
    },
    {
      id: 'ds160_submit',
      name: 'DS-160 Submission',
      description: 'Submit DS-160 form',
      order: 4,
      status: 'pending',
      dependsOn: ['ds160_review'],
      documents: []
    },
    {
      id: 'doc_collection',
      name: 'Document Collection',
      description: 'Collect required documents',
      order: 5,
      status: 'pending',
      documents: []
    },
    {
      id: 'translation',
      name: 'Document Translation',
      description: 'Translate necessary documents',
      order: 6,
      status: 'pending',
      dependsOn: ['doc_collection'],
      documents: []
    },
    {
      id: 'doc_finalize',
      name: 'Documentation Finalizing',
      description: 'Finalize all documents',
      order: 7,
      status: 'pending',
      dependsOn: ['translation'],
      documents: []
    },
    {
      id: 'payment',
      name: 'Payment Confirmation',
      description: 'Confirm all payments',
      order: 8,
      status: 'pending',
      documents: []
    },
    {
      id: 'delivery',
      name: 'Document Delivery',
      description: 'Deliver documents to client',
      order: 9,
      status: 'pending',
      dependsOn: ['doc_finalize', 'payment'],
      documents: []
    }
  ],
  documents: [],
  payments: [
    {
      id: 'service_fee',
      name: 'Service Fee',
      amount: 50000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'ds160_fill'
    }
  ]
};

// Japan Visit Process Template
export const JAPAN_VISA_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'Japan Visit Process',
  serviceType: 'japan_visa',
  description: 'Complete process flow for Japan visit visa',
  steps: [
    {
      id: 'info_collection',
      name: 'Information Collection',
      description: 'Collect client information',
      order: 0,
      status: 'pending',
      documents: []
    },
    {
      id: 'doc_collection',
      name: 'Document Collection',
      description: 'Collect required documents',
      order: 1,
      status: 'pending',
      documents: []
    },
    {
      id: 'translation',
      name: 'Document Translation',
      description: 'Translate documents to Japanese',
      order: 2,
      status: 'pending',
      dependsOn: ['doc_collection'],
      documents: []
    },
    {
      id: 'application',
      name: 'Application Preparation',
      description: 'Prepare visa application',
      order: 3,
      status: 'pending',
      dependsOn: ['translation'],
      documents: []
    },
    {
      id: 'submission',
      name: 'Application Submission',
      description: 'Submit visa application',
      order: 4,
      status: 'pending',
      dependsOn: ['application'],
      documents: []
    }
  ],
  documents: [],
  payments: [
    {
      id: 'service_fee',
      name: 'Service Fee',
      amount: 30000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'application'
    }
  ]
};

// Translation Process Template
export const TRANSLATION_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'Translation Process',
  serviceType: 'translation',
  description: 'Document translation process flow',
  steps: [
    {
      id: 'doc_receive',
      name: 'Document Reception',
      description: 'Receive documents for translation',
      order: 0,
      status: 'pending',
      documents: []
    },
    {
      id: 'assessment',
      name: 'Document Assessment',
      description: 'Assess document complexity',
      order: 1,
      status: 'pending',
      dependsOn: ['doc_receive'],
      documents: []
    },
    {
      id: 'translation',
      name: 'Translation',
      description: 'Translate documents',
      order: 2,
      status: 'pending',
      dependsOn: ['assessment'],
      documents: []
    },
    {
      id: 'review',
      name: 'Quality Check',
      description: 'Review translation quality',
      order: 3,
      status: 'pending',
      dependsOn: ['translation'],
      documents: []
    },
    {
      id: 'delivery',
      name: 'Document Delivery',
      description: 'Deliver translated documents',
      order: 4,
      status: 'pending',
      dependsOn: ['review'],
      documents: []
    }
  ],
  documents: [],
  payments: [
    {
      id: 'translation_fee',
      name: 'Translation Fee',
      amount: 0, // Varies by document
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'translation'
    }
  ]
};

// ePassport Process Template
export const EPASSPORT_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'ePassport Process',
  serviceType: 'epassport',
  description: 'ePassport application process flow',
  steps: [
    {
      id: 'info_collection',
      name: 'Information Collection',
      description: 'Collect applicant information',
      order: 0,
      status: 'pending',
      documents: []
    },
    {
      id: 'form_filling',
      name: 'Form Filling',
      description: 'Complete application form',
      order: 1,
      status: 'pending',
      dependsOn: ['info_collection'],
      documents: []
    },
    {
      id: 'payment',
      name: 'Payment Processing',
      description: 'Process application fees',
      order: 2,
      status: 'pending',
      documents: []
    },
    {
      id: 'submission',
      name: 'Application Submission',
      description: 'Submit application',
      order: 3,
      status: 'pending',
      dependsOn: ['form_filling', 'payment'],
      documents: []
    },
    {
      id: 'tracking',
      name: 'Application Tracking',
      description: 'Track application status',
      order: 4,
      status: 'pending',
      dependsOn: ['submission'],
      documents: []
    }
  ],
  documents: [],
  payments: [
    {
      id: 'service_fee',
      name: 'Service Fee',
      amount: 15000,
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'submission'
    }
  ]
};

// Graphic Design Process Template
export const GRAPHIC_DESIGN_TEMPLATE: Omit<ProcessFlowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: 'Graphic Design Process',
  serviceType: 'design',
  description: 'Graphic design project process flow',
  steps: [
    {
      id: 'brief',
      name: 'Design Brief',
      description: 'Collect design requirements',
      order: 0,
      status: 'pending',
      documents: []
    },
    {
      id: 'concept',
      name: 'Concept Development',
      description: 'Develop initial concepts',
      order: 1,
      status: 'pending',
      dependsOn: ['brief'],
      documents: []
    },
    {
      id: 'initial_design',
      name: 'Initial Design',
      description: 'Create first design draft',
      order: 2,
      status: 'pending',
      dependsOn: ['concept'],
      documents: []
    },
    {
      id: 'review',
      name: 'Client Review',
      description: 'Get client feedback',
      order: 3,
      status: 'pending',
      dependsOn: ['initial_design'],
      documents: []
    },
    {
      id: 'revisions',
      name: 'Revisions',
      description: 'Make requested changes',
      order: 4,
      status: 'pending',
      dependsOn: ['review'],
      documents: []
    },
    {
      id: 'delivery',
      name: 'Final Delivery',
      description: 'Deliver final files',
      order: 5,
      status: 'pending',
      dependsOn: ['revisions'],
      documents: []
    }
  ],
  documents: [],
  payments: [
    {
      id: 'advance',
      name: 'Advance Payment',
      amount: 0, // Varies by project
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'initial_design'
    }
  ]
};

// Other Services Process Template
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
      documents: []
    },
    {
      id: 'assessment',
      name: 'Service Assessment',
      description: 'Assess requirements',
      order: 1,
      status: 'pending',
      dependsOn: ['requirement'],
      documents: []
    },
    {
      id: 'execution',
      name: 'Service Execution',
      description: 'Execute requested service',
      order: 2,
      status: 'pending',
      dependsOn: ['assessment'],
      documents: []
    },
    {
      id: 'review',
      name: 'Service Review',
      description: 'Review completed service',
      order: 3,
      status: 'pending',
      dependsOn: ['execution'],
      documents: []
    },
    {
      id: 'delivery',
      name: 'Service Delivery',
      description: 'Deliver completed service',
      order: 4,
      status: 'pending',
      dependsOn: ['review'],
      documents: []
    }
  ],
  documents: [],
  payments: [
    {
      id: 'service_fee',
      name: 'Service Fee',
      amount: 0, // Varies by service
      status: 'pending',
      paidAmount: 0,
      requiredForStep: 'execution'
    }
  ]
};

export const DEFAULT_TEMPLATES = [
  US_VISA_TEMPLATE,
  JAPAN_VISA_TEMPLATE,
  TRANSLATION_TEMPLATE,
  EPASSPORT_TEMPLATE,
  GRAPHIC_DESIGN_TEMPLATE,
  OTHER_SERVICES_TEMPLATE
];