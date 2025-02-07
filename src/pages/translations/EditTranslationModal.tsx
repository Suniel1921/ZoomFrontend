
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Copy, Check } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { Translation } from '../../types';
import axios from 'axios';
import toast from 'react-hot-toast';

interface EditTranslationModalProps {
  isOpen: boolean;
  getAllTranslations : ()=> void;
  onClose: () => void;
  translation: Translation;
}

export default function EditTranslationModal({
  isOpen,
  onClose,
  getAllTranslations,
  translation,
}: EditTranslationModalProps) {
  const { clients, updateTranslation } = useStore();
  const { admins } = useAdminStore();
  const [showPaymentMethod, setShowPaymentMethod] = useState(translation.paymentStatus === 'Paid');
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ...translation,
      deadline: new Date(translation.deadline),
    },
  });

  const paymentStatus = watch('paymentStatus');
  const sourceLanguage = watch('sourceLanguage');
  const targetLanguage = watch('targetLanguage');
  const nameInTargetScript = watch('nameInTargetScript');

  // const handlers = admins.filter(admin => admin.role !== 'super_admin');

    
   // Fetch the handlers (admins) from the API
   const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);
   useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`);
        setHandlers(response.data.admins); 
      } catch (error:any) {
        console.error('Failed to fetch handlers:', error);
        toast.error(error.response.data.message);
      }
    };

    fetchHandlers();
  }, []);


  useEffect(() => {
    setShowPaymentMethod(paymentStatus === 'Paid');
  }, [paymentStatus]);

  const handleCopyName = () => {
    if (nameInTargetScript) {
      navigator.clipboard.writeText(nameInTargetScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onSubmit = async (data: any) => {
    console.log('Form submitted with data:', data); // Debugging line
    try {
      const response = await axios.put(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/documentTranslation/udpateDocumentTranslation/${translation._id}`, data);
      if (response.data.success) {
        console.log('Success:', response.data);
        toast.success('Translation updated successfully!');
        onClose();
        getAllTranslations();
      } else {
        console.error('Response Error:', response.data.message);
        toast.error(response.data.message || 'Failed to update translation.');
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error('An error occurred while updating the translation.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Translation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <select
                {...register('sourceLanguage')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="English">English</option>
                <option value="Japanese">Japanese</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <select
                {...register('targetLanguage')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="Japanese">Japanese</option>
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            {/* Name in Target Script */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {sourceLanguage === 'English' && targetLanguage === 'Japanese'
                  ? 'Name in Katakana'
                  : sourceLanguage === 'Japanese' && targetLanguage === 'English'
                  ? 'Name in English'
                  : 'Name in Target Script'}
              </label>
              <div className="mt-1 relative">
                <Input {...register('nameInTargetScript')} className="pr-10" />
                <button
                  type="button"
                  onClick={handleCopyName}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Pages */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pages</label>
              <Input
                type="number"
                min="1"
                {...register('pages', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (¥)</label>
              <Input
                type="number"
                min="0"
                {...register('amount', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>


            {/* paid amount */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                  Paid Amount (¥)
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("paidAmount", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

            

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status</label>
              <select
                {...register('paymentStatus')}
                onChange={(e) => {
                  register('paymentStatus').onChange(e);
                  setShowPaymentMethod(e.target.value === 'Paid');
                }}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="Due">Due</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Payment Method */}
            {showPaymentMethod && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  {...register('paymentMethod')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Counter Cash">Counter Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Paypay">Paypay</option>
                  <option value="Line Pay">Line Pay</option>
                </select>
              </div>
            )}

            {/* Handled By */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
              Handled By
              </label>
              <select
                {...register("handledBy")}
                value={watch("handledBy") || getAllTranslations.handledBy} // Ensure the initial value is set
                onChange={(e) => setValue("handledBy", e.target.value)} // Sync changes with the form
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="">Select handler</option>
                {handlers.map((handler) => (
                  <option key={handler.id} value={handler.id}>
                    {handler.name}
                  </option>
                ))}
              </select>
            </div>


            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <DatePicker
                selected={watch('deadline')}
                onChange={(date) => setValue('deadline', date as Date)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            {/* Translation Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Status</label>
              <select
                {...register('translationStatus')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
               <option value="Processing">Processing</option>
                  <option value="Waiting for Payment">Waiting for Payment</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Delivery Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Type</label>
              <select
                {...register('deliveryType')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="Office Pickup">Office Pickup</option>
                <option value="Sent on Email">Sent on Email</option>
                <option value="Sent on Viber">Sent on Viber</option>
                <option value="Sent on Facebook">Sent on Facebook</option>
                <option value="By Post">By Post</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
 