import { JapaneseYen } from 'lucide-react';
import Button from './Button';

interface PaymentDetails {
  visaApplicationFee?: number;
  translationFee?: number;
  amount?: number;
  paidAmount: number;
  discount: number;
  total?: number;
  advancePaid?: number;
  deliveryCharge?: number;
}

interface HisabKitabModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    clientName: string;
    type?: string;
    country?: string;
    payment?: PaymentDetails;
    paymentStatus: string;
    amount?: number;
    paidAmount?: number;
    discount?: number;
    advancePaid?: number;
    deliveryCharge?: number;
  };
}

export default function HisabKitabModal({ isOpen, onClose, application }: HisabKitabModalProps) {
  if (!isOpen) return null;

  // Handle different payment structures
  let visaApplicationFee = 0;
  let translationFee = 0;
  let paidAmount = 0;
  let discount = 0;
  let deliveryCharge = 0;
  let total = 0;

  // For visa applications
  if (application.payment) {
    visaApplicationFee = application.payment.visaApplicationFee || 0;
    translationFee = application.payment.translationFee || 0;
    paidAmount = application.payment.paidAmount || 0;
    discount = application.payment.discount || 0;
    total = (visaApplicationFee + translationFee) - (paidAmount + discount);
  }
  // For other applications (Japan Visit, Translations, etc.)
  else {
    const amount = application.amount || 0;
    paidAmount = application.paidAmount || application.advancePaid || 0;
    discount = application.discount || 0;
    deliveryCharge = application.deliveryCharge || 0;
    total = (amount + deliveryCharge) - (paidAmount + discount);
  }

  const totalAmount = visaApplicationFee + translationFee + deliveryCharge || application.amount || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Header - Centered */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">HisabKitab (Financial Summary)</h2>
          <p className="text-lg font-medium text-gray-800 mt-2">{application.clientName}</p>
          {application.type && (
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-sm bg-brand-yellow/10 text-brand-black px-3 py-1 rounded-full">
                {application.type}
              </span>
              {application.country && (
                <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {application.country}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="space-y-3">
            {visaApplicationFee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Documentation Fee:</span>
                <span className="font-medium">¥{visaApplicationFee.toLocaleString()}</span>
              </div>
            )}
            {translationFee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Translation Fee:</span>
                <span className="font-medium">¥{translationFee.toLocaleString()}</span>
              </div>
            )}
            {application.amount && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">¥{application.amount.toLocaleString()}</span>
              </div>
            )}
            {deliveryCharge > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Delivery Charge:</span>
                <span className="font-medium">¥{deliveryCharge.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">¥{totalAmount.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Paid Amount:</span>
              <span className="font-medium text-green-600">-¥{paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-green-600">-¥{discount.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-900">Due Amount:</span>
              <span className={total > 0 ? 'text-red-600' : 'text-green-600'}>
                ¥{total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`font-medium ${total > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {application.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Banking Details with Icon */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-4">
          {/* Nepali Instructions */}
          <div className="bg-brand-black p-3 rounded-lg text-center">
            <p className="font-medium text-brand-yellow">कृपया यो खातामा फुरिकोमी गरेर स्लिप पठाइदिनुहोला ।</p>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="font-medium">JP Bank (ゆうちょ銀行)</p>
                <p>カ）ライフスタート</p>
                <p className="font-medium">10150-92896921</p>
              </div>

              <div className="space-y-1">
                <p>Branch Code (आवश्यक परेमा):</p>
                <p className="font-medium">018 (〇一八)</p>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-16 h-16 text-brand-black/10">
              <JapaneseYen className="w-full h-full" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="font-medium">Thank you!</p>
            <p>Zoom Creatives</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}