
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAdminStore } from '../../store/adminStore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PREFECTURES } from '../../constants/prefectures';
import type { EpassportApplication } from '../../types';
import axios from 'axios';
import toast from 'react-hot-toast';

interface EditEpassportModalProps {
  isOpen: boolean;
  getAllEPassportApplication: () => void; 
  onClose: () => void;
  application: EpassportApplication;
}

export default function EditEpassportModal({
  isOpen,
  onClose,
  application,
  getAllEPassportApplication,
}: EditEpassportModalProps) {
  const { admins } = useAdminStore();
  const [showPrefecture, setShowPrefecture] = useState(application.ghumtiService);
  const [clients, setClients] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      ...application,
      date: new Date(application.date),
      deadline: new Date(application.deadline),
    },
  });

  const ghumtiService = watch('ghumtiService');
  const amount = watch('amount') || 0;
  const paidAmount = watch('paidAmount') || 0;
  const discount = watch('discount') || 0;
  // const dueAmount = (amount - discount) - paidAmount;
    // Dynamically calculate the due amount
    const dueAmount = amount - discount - paidAmount;
  





  // const handlers = admins.filter(admin => admin.role !== 'super_admin');
  const clientId = watch('clientId');
  const selectedClient = clients.find(c => c._id === clientId);




  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);



  // Fetch the handlers (admins) from the API
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

  const onSubmit = (data: any) => {
    const dueAmount = (data.amount || 0) - (data.discount || 0) - (data.paidAmount || 0); 
    let clientName = '';
    
    // Check if the client is selected
    const client = clients.find(c => c._id === data.clientId);
    if (client) {
      clientName = client.name;
    }
  
    // Update the application, even without a selected client
    axios.put(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/updateEpassport/${application._id}`,
      {
        ...data,
        clientName: clientName || 'Default Client', // If no client selected, use a default value
        dueAmount,
        date: data.date.toISOString(),
        deadline: data.deadline.toISOString(),
      }
    )
    .then((response) => {
      console.log('ePassport updated successfully', response.data);
      toast.success(response.data.message);
      onClose();  // Close the modal after successful update
      getAllEPassportApplication();
    })
    .catch((error: any) => {
      console.error('Error updating ePassport:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again later.';
      toast.error(errorMessage);
    });
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit ePassport Application</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Client Information</h3>
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
            </div>
          </div>  

          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Application Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Type</label>
                <select
                  {...register('applicationType')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Newborn Child">Newborn Child</option>
                  <option value="Passport Renewal">Passport Renewal</option>
                  <option value="Lost Passport">Lost Passport</option>
                  <option value="Damaged Passport">Damaged Passport</option>
                  <option value="Travel Document">Travel Document</option>
                  <option value="Birth Registration">Birth Registration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Status</label>
                <select
                  {...register('applicationStatus')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Processing">Processing</option>
                  <option value="Waiting for Payment">Waiting for Payment</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data Sent Status</label>
                <select
                  {...register('dataSentStatus')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Not Sent">Not Sent</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>


           {/* Handled By */}
           <div>
              <label className="block text-sm font-medium text-gray-700">
              Handled By
              </label>
              <select
                {...register("handledBy")}
                value={watch("handledBy") || application.handledBy} // Ensure the initial value is set
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
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <DatePicker
                  selected={watch('date')}
                  onChange={(date) => setValue('date', date as Date)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <DatePicker
                  selected={watch('deadline')}
                  onChange={(date) => setValue('deadline', date as Date)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('ghumtiService')}
                    onChange={(e) => {
                      setValue('ghumtiService', e.target.checked);
                      setShowPrefecture(e.target.checked);
                      if (!e.target.checked) {
                        setValue('prefecture', undefined);
                      }
                    }}
                    className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm text-gray-700">Ghumti Service</span>
                </label>
              </div>

              {ghumtiService && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Prefecture</label>
                  <select
                    {...register('prefecture')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  >
                    <option value="">Select prefecture</option>
                    {PREFECTURES.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <Input
                  type="number"
                  {...register('amount')}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                <Input
                  type="number"
                  {...register('paidAmount')}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Discount</label>
                <Input
                  type="number"
                  {...register('discount')}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Amount</label>
                <Input
                {...register('dueAmount')}
                  value={dueAmount}
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
            </div>
          </div>

             {/* Notes */}
             <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Notes</h3>
            <div>
              <textarea
                {...register('remarks')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
            <Button type="submit">Update Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}






