import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import { DESIGN_TYPES } from '../../constants/designTypes';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AddDesignJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchGraphicDesignJobs: () => void;
}

export default function AddDesignJobModal({
  isOpen,
  onClose,
  fetchGraphicDesignJobs,
}: AddDesignJobModalProps) {
  const { clients, addGraphicDesignJob, addAppointment } = useStore();
  const { admins } = useAdminStore();
  const [clientsList, setClientsList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: 0,
      advancePaid: 0,
      status: 'Processing',
      deadline: new Date(),
    },
  });

  const amount = watch('amount') || 0;
  const advancePaid = watch('advancePaid') || 0;
  const dueAmount = amount - advancePaid;

  const clientId = watch('clientId');
  const selectedClient = clientsList.find(c => c._id === clientId);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`);
        setHandlers(response.data.admins); 
      } catch (error: any) {
        console.error('Failed to fetch handlers:', error);
        toast.error(error.response.data.message);
      }
    };
    fetchHandlers();
  }, []);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
        .then((response) => {
          const clientsData = response?.data?.clients;
          setClientsList(Array.isArray(clientsData) ? clientsData : [clientsData]); // Always treat as array, even if single client
        })
        .catch((error) => {
          console.error("Error fetching clients:", error);
          setClientsList([]); // Set clients to an empty array in case of error
        });
    }
  }, [isOpen]);

  const subAdmins = admins.filter(admin => admin.role !== 'super_admin');

  const onSubmit = async (data: any) => {
    const client = clientsList.find(c => c._id === data.clientId);
  
    if (client) {
      const designJob = {
        ...data,
        clientName: client.name,
        dueAmount: dueAmount,
        paymentStatus: dueAmount > 0 ? 'Due' : 'Paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      try {
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/graphicDesign/createGraphicDesign`, designJob, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.data.success) {
          toast.success(response.data.message);
          fetchGraphicDesignJobs();
        } else {
          toast.error('Failed to create design job. Please try again.');
        }
  
        const appointment = {
          clientId: client._id,
          clientName: client.name,
          type: `Design Deadline: ${data.designType}`,
          date: data.deadline.toISOString(),
          time: '23:59',
          duration: 0,
          status: 'Scheduled',
          meetingType: 'physical',
          location: 'Office',
          notes: `Design deadline for ${data.designType} - ${data.businessName}`,
          isRecurring: false,
          handledBy: data.handledBy,
        };
  
        await addAppointment(appointment);
  
        reset();
        onClose();
  
      } catch (error) {
        console.error('Error creating graphic design job or appointment:', error);
        toast.error('An error occurred while creating the design job or appointment. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Design Job</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <SearchableSelect
                options={clientsList.map(client => ({
                  value: client._id,
                  label: client.name,
                  clientData: { ...client, profilePhoto: client.profilePhoto }, 
                }))}
                value={watch('clientId')}
                onChange={(value) => {
                  setValue('clientId', value);
                  const client = clientsList.find(c => c._id === value);
                  if (client) {
                    setValue('mobileNo', client.phone);
                  }
                }}
                placeholder="Select client"
                className="mt-1"
              />
              {errors.clientId && <p className="mt-1 text-sm text-red-600">Client is required</p>}
            </div>

            {/* Handled By */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Handled By</label>
              <select
                {...register('handledBy', { required: 'This field is required' })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="">Select handler</option>
                {handlers.map((handler) => (
                  <option key={handler.id} value={handler.name}>
                    {handler.name}
                  </option>
                ))}
              </select>
              {errors.handledBy && (
                <p className="mt-1 text-sm text-red-600">{errors.handledBy.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <Input {...register('businessName', { required: 'Business Name is required' })} className="mt-1" />
              {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile No</label>
              <Input {...register('mobileNo', { required: 'Mobile No is required' })} className="mt-1" />
              {errors.mobileNo && <p className="mt-1 text-sm text-red-600">{errors.mobileNo.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Landline No</label>
              <Input {...register('landlineNo')} className="mt-1" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <Input {...register('address', { required: 'Address is required' })} className="mt-1" />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>

            <div>
  <label className="block text-sm font-medium text-gray-700">Design Type</label>
  <select
    {...register('designType', { required: 'Design type is required' })}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
  >
    <option value="">Select Design Type</option>
    {DESIGN_TYPES.map((designType) => (
      <option key={designType} value={designType}>
        {designType}
      </option>
    ))}
  </select>
  {errors.designType && (
    <p className="mt-1 text-sm text-red-600">{errors.designType.message}</p>
  )}
</div>


            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <Input
                type="number"
                {...register('amount', { required: 'Amount is required', valueAsNumber: true })}
                className="mt-1"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Paid</label>
              <Input
                type="number"
                {...register('advancePaid', { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Amount</label>
              <Input
                type="number"
                value={dueAmount}
                readOnly
                className="mt-1 bg-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <Input {...register('remarks')} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Status</label>
              <select
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                  <option value="Processing">Processing</option>
                  <option value="Waiting for Payment">Waiting for Payment</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <DatePicker
                selected={watch('deadline')}
                onChange={(date) => setValue('deadline', date)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                minDate={new Date()}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
}


