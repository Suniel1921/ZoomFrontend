import Input from '../../../components/Input';
import Select from '../../../components/Select';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useEffect } from 'react';

interface PaymentSectionProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
}

export default function PaymentSection({ register, watch, setValue, errors }: PaymentSectionProps) {
  const amount = watch('amount') || 0;
  const paidAmount = watch('paidAmount') || 0;
  const discount = watch('discount') || 0;
  const modeOfDelivery = watch('modeOfDelivery');
  const paymentStatus = watch('paymentStatus');

  // Calculate delivery charge based on mode
  const getDeliveryCharge = (mode: string) => {
    switch (mode) {
      case 'Blue Letterpack':
        return 430;
      case 'Red Letterpack':
        return 600;
      default:
        return 0;
    }
  };

  const deliveryCharge = getDeliveryCharge(modeOfDelivery);
  const baseAmount = amount + deliveryCharge;
  const dueAmount = baseAmount - (paidAmount + discount);

  // Update delivery charge and payment status
  useEffect(() => {
    setValue('deliveryCharge', deliveryCharge);
    setValue('dueAmount', dueAmount);
    setValue('paymentStatus', dueAmount <= 0 ? 'Paid' : 'Due');
  }, [deliveryCharge, dueAmount, setValue]);

  return (
    <div className="space-y-8">
      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Documentation Fee (¥)</label>
          <Input
            type="number"
            min="0"
            {...register('amount', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery Method</label>
          <select
            {...register('modeOfDelivery')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
          >
            <option value="Office Pickup">Office Pickup (¥0)</option>
            <option value="PDF">PDF/Email (¥0)</option>
            <option value="Normal Delivery">Normal Post (¥0)</option>
            <option value="Blue Letterpack">Blue Letterpack (¥430)</option>
            <option value="Red Letterpack">Red Letterpack (¥600)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Paid Amount (¥)</label>
          <Input
            type="number"
            min="0"
            {...register('paidAmount', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Discount (¥)</label>
          <Input
            type="number"
            min="0"
            {...register('discount', { valueAsNumber: true })}
            className="mt-1"
            placeholder="0"
          />
        </div>

        {paymentStatus === 'Paid' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              {...register('paymentMethod')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="Bank Furicomy">Bank Furicomy</option>
              <option value="Counter Cash">Counter Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Paypay">Paypay</option>
              <option value="Line Pay">Line Pay</option>
            </select>
          </div>
        )}
      </div>

      {/* HisabKitab (Financial Summary) */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">HisabKitab (Financial Summary)</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Documentation Fee:</span>
            <span className="font-medium">¥{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Delivery Charge:</span>
            <span className="font-medium">¥{deliveryCharge.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">¥{baseAmount.toLocaleString()}</span>
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
            <span className={dueAmount > 0 ? 'text-red-600' : 'text-green-600'}>
              ¥{dueAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Payment Status:</span>
            <span className={`font-medium ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
