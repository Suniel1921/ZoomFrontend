import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
import { useAdminStore } from '../../store/adminStore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SERVICE_TYPES } from '../../constants/serviceTypes';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchServices: () => void;
}

export default function AddServiceModal({
  isOpen,
  onClose,
  fetchServices,
}: AddServiceModalProps) {
  const { admins } = useAdminStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      serviceTypes: [],
      amount: 0,
      paidAmount: 0,
      discount: 0,
      jobStatus: 'Processing',
      deadline: new Date(),
    },
  });

  const amount = watch('amount') || 0;
  const paidAmount = watch('paidAmount') || 0;
  const discount = watch('discount') || 0;
  const dueAmount = parseFloat(amount) - (parseFloat(paidAmount) + parseFloat(discount)); // Ensuring numeric calculation
  const selectedTypes = watch('serviceTypes') || [];

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const clientId = watch('clientId');
  const selectedClient = clients.find((c) => c._id === clientId);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  // Fetch the handlers (admins) from the API
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins);
      } catch (error: any) {
        console.error('Failed to fetch handlers:', error);
        toast.error(error.response.data.message);
      }
    };

    fetchHandlers();
  }, []);

   //get all clients list in drop down 
   useEffect(() => {
    if (isOpen) {
      axios
        .get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
        .then((response) => {
          const clientsData = response?.data?.clients;
          setClients(Array.isArray(clientsData) ? clientsData : [clientsData]); 
        })
        .catch((error) => {
          console.error("Error fetching clients:", error);
          setClients([]); // Set clients to an empty array in case of error
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setLoading(true); // Disable button when submitting
    const client = clients.find((c) => c._id === data.clientId);

    if (!client) {
      console.error('Client not found.');
      setLoading(false); // Re-enable button if client not found
      return;
    }

    const addOtherService = {
      ...data,
      clientName: client.name,
      mobileNo: client.phone,
      dueAmount,
      paymentStatus: dueAmount > 0 ? 'Due' : 'Paid',
      deadline: data.deadline?.toISOString(),
    };

    try {
      console.log('Sending POST request:', addOtherService);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/otherServices/createOtherServices`,
        addOtherService
      );

      if (response.data.success) {
        toast.success(response.data.message);
        reset();
        onClose();
        fetchServices();
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
    } finally {
      setLoading(false); // Re-enable button after request is finished
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <SearchableSelect
                options={clients.map((client) => ({
                  value: client._id,
                  label: client.name,
                }))}
                value={watch('clientId')}
                onChange={(value) => {
                  setValue('clientId', value);
                  const client = clients.find((c) => c._id === value);
                  if (client) {
                    setValue('mobileNo', client.phone);
                  }
                }}
                placeholder="Select client"
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <Input
                value={selectedClient?.phone || ''}
                className="mt-1 bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Channel</label>
              <select
                {...register('contactChannel')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="Viber">Viber</option>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Friend">Friend</option>
                <option value="Office Visit">Office Visit</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Service Types</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SERVICE_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={type}
                      {...register('serviceTypes')}
                      className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedTypes.includes('Other') && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Service Details</label>
                <Input
                  {...register('otherServiceDetails')}
                  placeholder="Please specify the service"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <DatePicker
                selected={watch('deadline')}
                onChange={(date) => setValue('deadline', date as Date)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            {/* Handled By */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Handled By</label>
              <select
                {...register('handledBy')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="">Select handler</option>
                {handlers.map((handler) => (
                  <option key={handler.id} value={handler.name}>
                    {handler.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (¥)</label>
              <Input type="number" {...register('amount')} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Paid Amount (¥)</label>
              <Input type="number" {...register('paidAmount')} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount (¥)</label>
              <Input type="number" {...register('discount')} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Amount (¥)</label>
              <Input type="number" value={dueAmount} className="mt-1 bg-gray-50" disabled />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                {...register('paymentMethod')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="Bank Furicomy">Bank Furicomy</option>
                <option value="Counter Cash">Counter Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Paypay">Paypay</option>
                <option value="Line Pay">Line Pay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Status</label>
              <select
                {...register('jobStatus')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="Processing">Processing</option>
                  <option value="Waiting for Payment">Waiting for Payment</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                {...register('remarks')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Service</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
