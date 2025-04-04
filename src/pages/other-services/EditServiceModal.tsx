
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SERVICE_TYPES } from '../../constants/serviceTypes';
import type { OtherService } from '../../types/otherService';
import axios from 'axios';
import toast from 'react-hot-toast';
import OtherServicesPage from '.';

type ServiceFormData = {
  clientId: string;
  serviceTypes: string[];
  otherServiceDetails?: string;
  contactChannel: string;
  deadline: Date;
  amount: number;
  paidAmount: number;
  discount: number;
  paymentMethod?: string;
  handledBy: string;
  jobStatus: string;
  remarks?: string;
};

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchServices : () => void;
  service?: OtherService;  // Allow the service prop to be optional (handle undefined)
}

export default function EditServiceModal({
  isOpen,
  onClose,
  service,
  fetchServices
}: EditServiceModalProps) {
  const { clients, updateOtherService } = useStore();
  const { admins } = useAdminStore();
  const [clientsList, setClients] = useState<any[]>([]);

  const formDefaultValues = service ? {
    ...service,
    deadline: new Date(service.deadline),  
  } : {
    clientId: '',
    serviceTypes: [],
    contactChannel: 'Viber', 
    deadline: new Date(), 
    amount: 0,
    paidAmount: 0,
    discount: 0,
    handledBy: '',
    jobStatus: 'Details Pending',
    remarks: '',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    defaultValues: formDefaultValues,
  });

  const amount = watch('amount') || 0;
  const paidAmount = watch('paidAmount') || 0;
  const discount = watch('discount') || 0;
  const dueAmount = amount - (paidAmount + discount);

  const clientId = watch('clientId');
  const selectedClient = clientsList.find(c => c.id === clientId);
  const selectedTypes = watch('serviceTypes') || [];
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

    

  const onSubmit = async (data: ServiceFormData) => {
    const updateData = {
      ...data,
      dueAmount,
      paymentStatus: dueAmount > 0 ? 'Due' : 'Paid',
      deadline: data.deadline.toISOString(),
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/otherServices/updateOtherServices/${service?._id}`,
        updateData
      );

      if (response.data.success) {
        toast.success('Service updated successfully!');
        fetchServices();
        onClose();
      } else {
        toast.error('Something went wrong');
      }
    } catch (error: any) {
      toast.error(error.response?.data.message || 'Failed to update service');
    }
  };





  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700">
                  Service Details
                </label>
                <Input
                  {...register('otherServiceDetails')}
                  className="mt-1"
                  placeholder="Service details"
                />
              </div>
            )}


            {/* Handled By */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
              Handled By
              </label>
              <select
                {...register("handledBy")}
                value={watch("handledBy") || OtherServicesPage.handledBy} // Ensure the initial value is set
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
            

            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <DatePicker
                selected={watch('deadline') || new Date()}
                onChange={(date: Date) => setValue('deadline', date)}
                dateFormat="yyyy/MM/dd"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (¥)</label>
              <Input
                type="number"
                min="0"
                {...register('amount', { valueAsNumber: true })}
                className="mt-1"
              />
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
              />
            </div>

            <div className="">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                placeholder="Additional remarks"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <Button onClick={onClose} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
