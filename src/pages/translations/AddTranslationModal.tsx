import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { X, Copy, Check } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';

const translationSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  sourceLanguage: z.enum(['English', 'Japanese', 'Nepali', 'Hindi']),
  targetLanguage: z.enum(['English', 'Japanese', 'Nepali', 'Hindi']),
  nameInTargetScript: z.string().optional(),
  pages: z.number().min(1, 'Number of pages must be at least 1'),
  amount: z.number().min(0, 'Amount must be positive'),
  paidAmount: z.number().min(0, 'Paid amount must be positive'),
  paymentStatus: z.enum(['Due', 'Paid']),
  paymentMethod: z.enum(['Counter Cash', 'Bank Transfer', 'Credit Card', 'Paypay', 'Line Pay']).optional(),
  handledBy: z.string().min(1, 'Handler is required'),
  deadline: z.date(),
  translationStatus: z.enum(["Processing", "Waiting for Payment", "Completed", "Cancelled"]),
  deliveryType: z.enum(['Office Pickup', 'Sent on Email', 'Sent on Viber', 'Sent on Facebook', 'By Post']),
  notes: z.string().optional(),
});

export default function AddTranslationModal({ isOpen, onClose, getAllTranslations }) {
  const [clients, setClients] = useState([]);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [copied, setCopied] = useState(false);
  const [handlers, setHandlers] = useState([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      sourceLanguage: 'English',
      targetLanguage: 'Japanese',
      nameInTargetScript: "",
      pages: 1,
      amount: 0,
      paidAmount: 0,
      paymentStatus: 'Due',
      translationStatus: 'Processing',
      deliveryType: 'Office Pickup',
      deadline: new Date(),
    },
  });

  const sourceLanguage = watch('sourceLanguage');
  const targetLanguage = watch('targetLanguage');
  const paymentStatus = watch('paymentStatus');
  const nameInTargetScript = watch('nameInTargetScript');

  useEffect(() => {
    if (isOpen) {
      axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
        .then((response) => {
          const clientsData = response?.data?.clients;
          setClients(Array.isArray(clientsData) ? clientsData : [clientsData]);
        })
        .catch((error) => {
          console.error("Error fetching clients:", error);
          setClients([]);
        });

      axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`)
        .then((response) => {
          setHandlers(response.data.admins);
        })
        .catch((error) => {
          console.error('Failed to fetch handlers:', error);
          toast.error(error.response?.data?.message || 'Error fetching handlers');
        });
    }
  }, [isOpen]);

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

  const onSubmit = async (data) => {
    const client = clients.find((c) => c._id === data.clientId);
    if (client) {
      const translationData = {
        ...data,
        clientName: client.name,
        nameInTargetScript: data.nameInTargetScript || "",
      };

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/documentTranslation/createDocumentTranslation`,
          translationData
        );
        if (response.data.success) {
          toast.success(response.data.message);
          reset();
          onClose();
          getAllTranslations();
        }
      } catch (error) {
        console.error('Error creating translation:', error);
        toast.error('Error creating translation');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">New Translation</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <SearchableSelect
                options={clients.map((client) => ({
                  value: client._id,
                  label: client.name,
                  clientData: { ...client, profilePhoto: client.profilePhoto },
                }))}
                value={watch('clientId')}
                onChange={(value) => setValue('clientId', value)}
                placeholder="Select client"
                error={errors.clientId?.message}
              />
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select 
                {...register('sourceLanguage')}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
              >
                <option value="English">English</option>
                <option value="Japanese">Japanese</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select 
                {...register('targetLanguage')}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
              >
                <option value="Japanese">Japanese</option>
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {sourceLanguage === 'English' && targetLanguage === 'Japanese' ? 'Name in Katakana' :
                 sourceLanguage === 'Japanese' && targetLanguage === 'English' ? 'Name in English' :
                 'Name in Target Script'}
              </label>
              <div className="relative">
                <Input 
                  {...register('nameInTargetScript')} 
                  className="pr-10 w-full"
                />
                <button 
                  type="button" 
                  onClick={handleCopyName}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
              <Input
                type="number"
                min="1"
                {...register('pages', { valueAsNumber: true })}
                className="w-full"
              />
              {errors.pages && (
                <p className="mt-1 text-sm text-red-600">{errors.pages.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (¥)</label>
              <Input
                type="number"
                min="0"
                {...register('amount', { valueAsNumber: true })}
                className="w-full"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (¥)</label>
              <Input
                type="number"
                min="0"
                {...register("paidAmount", { valueAsNumber: true })}
                className="w-full"
              />
              {errors.paidAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.paidAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select 
                {...register('paymentStatus')}
                onChange={(e) => {
                  register('paymentStatus').onChange(e);
                  setShowPaymentMethod(e.target.value === 'Paid');
                }}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
              >
                <option value="Due">Due</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {showPaymentMethod && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select 
                  {...register('paymentMethod')}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
                >
                  <option value="Counter Cash">Counter Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Paypay">Paypay</option>
                  <option value="Line Pay">Line Pay</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Handled By</label>
              <select 
                {...register('handledBy')}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
              >
                <option value="">Select handler</option>
                {handlers.map((handler) => (
                  <option key={handler.id} value={handler.name}>{handler.name}</option>
                ))}
              </select>
              {errors.handledBy && (
                <p className="mt-1 text-sm text-red-600">{errors.handledBy.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <DatePicker
                selected={watch('deadline')}
                onChange={(date) => setValue('deadline', date)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Status</label>
              <select 
                {...register('translationStatus')}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
              >
                <option value="Processing">Processing</option>
                <option value="Waiting for Payment">Waiting for Payment</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
              <select 
                {...register('deliveryType')}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200"
              >
                <option value="Office Pickup">Office Pickup</option>
                <option value="Sent on Email">Sent on Email</option>
                <option value="Sent on Viber">Sent on Viber</option>
                <option value="Sent on Facebook">Sent on Facebook</option>
                <option value="By Post">By Post</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-3">Notes</h3>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-colors duration-200 placeholder:text-gray-400"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-yellow-500 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 transition-colors duration-200"
            >
              Create Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}