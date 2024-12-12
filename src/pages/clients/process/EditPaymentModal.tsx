import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import type { ClientProcess, PaymentMilestone } from '../../../types/taskManagement';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: ClientProcess;
  payment: PaymentMilestone;
  serviceAmount: number;
  paidAmount: number;
}

export default function EditPaymentModal({
  isOpen,
  onClose,
  process,
  payment,
  serviceAmount,
  paidAmount,
}: EditPaymentModalProps) {
  const [paidAmountInput, setPaidAmountInput] = useState(payment.paidAmount.toString());
  const [notes, setNotes] = useState(payment.notes || '');
  const { updatePayment } = useTaskManagementStore();

  const remainingAmount = serviceAmount - paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paidAmountInput);
    if (isNaN(amount)) return;

    const status = 
      amount >= payment.amount ? 'completed' :
      amount > 0 ? 'partial' : 'pending';

    updatePayment(process.id, payment.id, {
      paidAmount: amount,
      status,
      notes,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Payment</h2>
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
                <p className="text-gray-500">Total Paid</p>
                <p className="font-medium">¥{paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className="font-medium text-red-600">
                  ¥{remainingAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Current Status</p>
                <p className="font-medium">{payment.status}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paid Amount (¥)
            </label>
            <Input
              type="number"
              value={paidAmountInput}
              onChange={(e) => setPaidAmountInput(e.target.value)}
              min="0"
              max={serviceAmount}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              placeholder="Add any payment notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isNaN(parseFloat(paidAmountInput)) || parseFloat(paidAmountInput) < 0}
            >
              Update Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}