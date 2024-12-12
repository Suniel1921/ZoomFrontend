import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import Button from '../../../components/Button';
import type { PaymentMilestone } from '../../../types/taskManagement';

interface PaymentCardProps {
  payment: PaymentMilestone;
  onRecordPayment: () => void;
}

export default function PaymentCard({ payment, onRecordPayment }: PaymentCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{payment.name}</h4>
          {payment.requiredForStep && (
            <p className="text-sm text-gray-500">
              Required for: {payment.requiredForStep}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium">¥{payment.amount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            Paid: ¥{payment.paidAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payment Status and Actions */}
      <div className="mt-4 flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          payment.status === 'completed'
            ? 'bg-green-100 text-green-700'
            : payment.status === 'partial'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {payment.status === 'completed'
            ? 'Paid'
            : payment.status === 'partial'
            ? 'Partially Paid'
            : 'Pending'}
        </span>

        {payment.status !== 'completed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRecordPayment}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        )}
      </div>

      {/* Payment History */}
      {payment.paidAt && (
        <div className="mt-2 text-sm text-gray-500">
          Last payment on {new Date(payment.paidAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}