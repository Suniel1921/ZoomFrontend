import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import Input from '../../../components/Input';

interface PaymentDetailsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
}

export default function PaymentDetails({ register, watch, setValue, errors }: PaymentDetailsProps) {
  const payment = watch('payment');
  const visaApplicationFee = payment.visaApplicationFee || 0;
  const translationFee = payment.translationFee || 0;
  const paidAmount = payment.paidAmount || 0;
  const discount = payment.discount || 0;
  const total = (visaApplicationFee + translationFee) - (paidAmount + discount);

  return (
    <div className="space-y-6">
      {/* Payment Input Fields */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visa Application Fee (¥)
          </label>
          <Input
            type="number"
            {...register('payment.visaApplicationFee', { valueAsNumber: true })}
            className="mt-1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Translation Fee (¥)
          </label>
          <Input
            type="number"
            {...register('payment.translationFee', { valueAsNumber: true })}
            className="mt-1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Paid Amount (¥)
          </label>
          <Input
            type="number"
            {...register('payment.paidAmount', { valueAsNumber: true })}
            className="mt-1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Discount (¥)
          </label>
          <Input
            type="number"
            {...register('payment.discount', { valueAsNumber: true })}
            className="mt-1"
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      {/* HisabKitab (Financial Summary) */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">HisabKitab (Financial Summary)</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Documentation Fee:</span>
            <span className="font-medium">¥{visaApplicationFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Translation Fee:</span>
            <span className="font-medium">¥{translationFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">¥{(visaApplicationFee + translationFee).toLocaleString()}</span>
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
              {total <= 0 ? 'Paid' : 'Due'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}