import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import type { ClientProcess, PaymentMilestone } from '../../../types/taskManagement';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: ClientProcess;
  payment: PaymentMilestone;
  serviceAmount: number;
  paidAmount: number;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  process,
  payment,
  serviceAmount,
  paidAmount,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const { recordPayment } = useTaskManagementStore();

  const remainingAmount = serviceAmount - paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) return;

    recordPayment(process.id, payment.id, paymentAmount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Record Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-medium">{payment.name}</h3>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Service Amount</p>
                <p className="font-medium">¥{serviceAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Already Paid</p>
                <p className="font-medium text-green-600">
                  ¥{paidAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className="font-medium text-red-600">
                  ¥{remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Amount
            </label>
            <div className="mt-1 relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                placeholder="Enter amount"
                min={0}
                max={remainingAmount}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
            >
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}