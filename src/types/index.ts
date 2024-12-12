export interface JapanVisitApplication {
  id: string;
  clientId: string;
  clientName: string;
  mobileNo: string;
  contactChannel: 'Viber' | 'Facebook' | 'WhatsApp' | 'Friend' | 'Office Visit';
  applicationType: 'Newborn Child' | 'Passport Renewal' | 'Lost Passport' | 'Damaged Passport' | 'Travel Document' | 'Birth Registration';
  ghumtiService: boolean;
  prefecture?: string;
  amount: number;
  paidAmount: number;
  discount: number;
  paymentStatus: 'Due' | 'Paid';
  paymentMethod?: 'Bank Furicomy' | 'Counter Cash' | 'Credit Card' | 'Paypay' | 'Line Pay';
  applicationStatus: 'Details Pending' | 'Ready to Process' | 'Under Progress' | 'Cancelled' | 'Completed';
  dataSentStatus: 'Not Sent' | 'Sent';
  remarks?: string;
  createdAt: string;
  pdfFile?: PDFFile;
  handledBy: string;
  date: string;
  deadline: string;
}

export interface EpassportApplication {
  id: string;
  clientId: string;
  clientName: string;
  mobileNo: string;
  contactChannel: 'Viber' | 'Facebook' | 'WhatsApp' | 'Friend' | 'Office Visit';
  applicationType: 'Newborn Child' | 'Passport Renewal' | 'Lost Passport' | 'Damaged Passport' | 'Travel Document' | 'Birth Registration';
  ghumtiService: boolean;
  prefecture?: string;
  amount: number;
  paidAmount: number;
  discount: number;
  paymentStatus: 'Due' | 'Paid';
  paymentMethod?: 'Bank Furicomy' | 'Counter Cash' | 'Credit Card' | 'Paypay' | 'Line Pay';
  applicationStatus: 'Details Pending' | 'Ready to Process' | 'Under Progress' | 'Cancelled' | 'Completed';
  dataSentStatus: 'Not Sent' | 'Sent';
  remarks?: string;
  createdAt: string;
  pdfFile?: PDFFile;
  handledBy: string;
  date: string;
  deadline: string;
}

export interface PDFFile {
  url: string;
  name: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  category: ClientCategory;
  status: 'active' | 'inactive';
  profilePhoto?: string;
  address: {
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building?: string;
  };
  socialMedia: {
    facebook?: string;
  };
  modeOfContact: ('Direct Call' | 'Viber' | 'WhatsApp' | 'Facebook Messenger')[];
  dateJoined: string;
  timeline: TimelineEvent[];
  credentials?: {
    password: string;
  };
}

export type ClientCategory =
  | 'Visit Visa Applicant'
  | 'Japan Visit Visa Applicant'
  | 'Document Translation'
  | 'Student Visa Applicant'
  | 'Epassport Applicant'
  | 'Japan Visa'
  | 'General Consultation';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'application' | 'document' | 'appointment' | 'note' | 'interaction';
}

export interface Application {
  id: string;
  clientId: string;
  clientName: string;
  type: 'Visitor Visa' | 'Student Visa';
  country: string;
  submissionDate: string;
  deadline: string;
  documentStatus: 'Not Yet' | 'Few Received' | 'Fully Received';
  documentsToTranslate: number;
  translationStatus: 'Under Process' | 'Completed';
  visaStatus: 'Under Review' | 'Under Process' | 'Waiting for Payment' | 'Completed' | 'Approved' | 'Rejected';
  handledBy: string;
  translationHandler: string;
  payment: {
    visaApplicationFee: number;
    translationFee: number;
    paidAmount: number;
    discount: number;
    total: number;
  };
  paymentStatus: 'Due' | 'Paid';
  notes?: string;
  familyMembers: FamilyMember[];
  todos: Todo[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  includedInApplication: boolean;
}

export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetingType: 'physical' | 'online';
  location?: string;
  meetingLink?: string;
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
  completedAt?: string;
  cancelledAt?: string;
  reminderSent?: boolean;
  reminderType?: 'email' | 'sms' | 'both';
  handledBy?: string;
}

export interface Document {
  id: string;
  clientId: string;
  name: string;
  type: 'Visa' | 'Financial' | 'Translation' | 'Contract' | 'Other';
  category: 'Application' | 'Personal' | 'Financial' | 'Legal';
  url: string;
  size: number;
  uploadDate: string;
  lastModified: string;
  status: 'Active' | 'Archived' | 'Deleted';
  tags: string[];
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
  comments: Comment[];
  metadata?: {
    language?: string;
  };
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}