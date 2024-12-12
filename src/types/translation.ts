export type Language = 'English' | 'Japanese' | 'Nepali' | 'Hindi';

export type TranslationStatus = 'Not Started' | 'Processing' | 'Completed' | 'Delivered';

export type DeliveryType = 'Office Pickup' | 'Sent on Email' | 'Sent on Viber' | 'Sent on Facebook' | 'By Post';

export type PaymentMethod = 'Counter Cash' | 'Bank Transfer' | 'Credit Card' | 'Paypay' | 'Line Pay';

export interface Translation {
  id: string;
  clientId: string;
  clientName: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  nameInTargetScript?: string;
  pages: number;
  amount: number;
  paymentStatus: 'Due' | 'Paid';
  paymentMethod?: PaymentMethod;
  handledBy: string;
  deadline: string;
  status: TranslationStatus;
  deliveryType: DeliveryType;
  createdAt: string;
  updatedAt: string;
}