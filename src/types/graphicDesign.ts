export type DesignType = 
  | 'All Set Design'
  | 'Logo Design'
  | 'Advertisement Design'
  | 'Menu Design'
  | 'Chirasi Design'
  | 'Meisi Design'
  | 'Flag Design'
  | 'Kanban Design'
  | 'Poster Design'
  | 'Rice Feeding Banner'
  | 'SNS Banner Design'
  | 'Invitation Card Design';

export interface GraphicDesignJob {
  id: string;
  clientId: string;
  clientName: string;
  businessName: string;
  mobileNo: string;
  landlineNo?: string;
  address: string;
  designType: DesignType;
  amount: number;
  advancePaid: number;
  dueAmount: number;
  paymentStatus: 'Due' | 'Paid';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  status: 'In Progress' | 'Completed' | 'Cancelled';
  deadline: string;
  handledBy: string;
}