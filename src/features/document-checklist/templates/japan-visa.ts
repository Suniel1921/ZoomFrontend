import type { DocumentTemplate } from '../types';

export const japanVisaTemplate: Omit<DocumentTemplate, 'id' | 'version' | 'lastUpdated'> = {
  name: 'Japan Visa Documents',
  visaType: 'Visitor Visa',
  country: 'Japan',
  applicationType: 'Tourist',
  baseDocuments: [
    {
      id: 'passport',
      name: 'Valid Passport',
      description: 'Original passport with at least 6 months validity and 2 blank pages',
      priority: 'critical',
      required: true,
      validityPeriod: 180,
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload passport scan in PDF format'
        },
        {
          type: 'fileSize',
          value: 5000000,
          message: 'File size should not exceed 5MB'
        }
      ]
    },
    {
      id: 'photo',
      name: 'Passport-size Photo',
      description: '4.5cm x 4.5cm with white background, taken within last 6 months',
      priority: 'critical',
      required: true,
      validationRules: [
        {
          type: 'fileType',
          value: 'image/jpeg',
          message: 'Please upload photo in JPEG format'
        },
        {
          type: 'fileSize',
          value: 2000000,
          message: 'File size should not exceed 2MB'
        }
      ],
      examples: ['https://example.com/correct-photo-sample.jpg']
    },
    {
      id: 'application-form',
      name: 'Visa Application Form',
      description: 'Completed and signed visa application form',
      priority: 'critical',
      required: true,
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload application form in PDF format'
        }
      ]
    },
    {
      id: 'bank-statement',
      name: 'Bank Statement',
      description: 'Last 6 months bank statements showing sufficient funds',
      priority: 'high',
      required: true,
      validityPeriod: 30,
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload bank statements in PDF format'
        }
      ]
    },
    {
      id: 'itinerary',
      name: 'Travel Itinerary',
      description: 'Detailed day-by-day schedule of your stay in Japan',
      priority: 'high',
      required: true,
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload itinerary in PDF format'
        }
      ]
    },
    {
      id: 'hotel-booking',
      name: 'Hotel Reservations',
      description: 'Confirmed hotel bookings for the entire stay',
      priority: 'medium',
      required: true,
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload hotel bookings in PDF format'
        }
      ]
    },
    {
      id: 'flight-booking',
      name: 'Flight Reservations',
      description: 'Round-trip flight bookings',
      priority: 'medium',
      required: true,
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload flight bookings in PDF format'
        }
      ]
    }
  ],
  conditionalDocuments: [
    {
      id: 'company-registration',
      name: 'Company Registration',
      description: 'Business registration certificate if self-employed',
      priority: 'high',
      required: true,
      condition: {
        field: 'employment_status',
        operator: 'equals',
        value: 'self_employed'
      },
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload company registration in PDF format'
        }
      ]
    },
    {
      id: 'employment-certificate',
      name: 'Employment Certificate',
      description: 'Certificate of employment with salary details',
      priority: 'high',
      required: true,
      condition: {
        field: 'employment_status',
        operator: 'equals',
        value: 'employed'
      },
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload employment certificate in PDF format'
        }
      ]
    },
    {
      id: 'student-id',
      name: 'Student ID',
      description: 'Valid student ID and enrollment certificate',
      priority: 'high',
      required: true,
      condition: {
        field: 'employment_status',
        operator: 'equals',
        value: 'student'
      },
      validationRules: [
        {
          type: 'fileType',
          value: 'pdf',
          message: 'Please upload student documents in PDF format'
        }
      ]
    }
  ]
};