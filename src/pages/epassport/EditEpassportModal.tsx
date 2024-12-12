// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { X } from 'lucide-react';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import SearchableSelect from '../../components/SearchableSelect';
// import { useStore } from '../../store';
// import { useAdminStore } from '../../store/adminStore';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import { PREFECTURES } from '../../constants/prefectures';
// import type { EpassportApplication } from '../../types';
// import axios from 'axios';

// const epassportSchema = z.object({
//   clientId: z.string().min(1, 'Client is required'),
//   mobileNo: z.string(),
//   contactChannel: z.enum(['Viber', 'Facebook', 'WhatsApp', 'Friend', 'Office Visit']),
//   applicationType: z.enum([
//     'Newborn Child',
//     'Passport Renewal',
//     'Lost Passport',
//     'Damaged Passport',
//     'Travel Document',
//     'Birth Registration'
//   ]),
//   ghumtiService: z.boolean(),
//   prefecture: z.string().optional(),
//   amount: z.number().min(0, 'Amount must be positive'),
//   paidAmount: z.number().min(0, 'Paid amount must be positive'),
//   discount: z.number().min(0, 'Discount must be positive'),
//   paymentStatus: z.enum(['Due', 'Paid']),
//   paymentMethod: z.enum(['Bank Furicomy', 'Counter Cash', 'Credit Card', 'Paypay', 'Line Pay']).optional(),
//   applicationStatus: z.enum([
//     'Details Pending',
//     'Ready to Process',
//     'Under Progress',
//     'Cancelled',
//     'Completed'
//   ]),
//   dataSentStatus: z.enum(['Not Sent', 'Sent']),
//   handledBy: z.string().min(1, 'Handler is required'),
//   date: z.date(),
//   deadline: z.date(),
//   remarks: z.string().optional(),
// });

// type EpassportFormData = z.infer<typeof epassportSchema>;

// interface EditEpassportModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   application: EpassportApplication;
// }

// export default function EditEpassportModal({
//   isOpen,
//   onClose,
//   application,
// }: EditEpassportModalProps) {
//   // const { clients, updateEpassportApplication } = useStore();
//   const { admins } = useAdminStore();
//   const [showPrefecture, setShowPrefecture] = useState(application.ghumtiService);
//   const [clients, setClients] = useState<any[]>([]);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm<EpassportFormData>({
//     resolver: zodResolver(epassportSchema),
//     defaultValues: {
//       ...application,
//       date: new Date(application.date),
//       deadline: new Date(application.deadline),
//     },
//   });


//   const ghumtiService = watch('ghumtiService');
//   const amount = watch('amount') || 0;
//   const paidAmount = watch('paidAmount') || 0;
//   const discount = watch('discount') || 0;
//   const dueAmount = amount - (paidAmount + discount);

//   // Auto-populate mobile number when client is selected
//   // const selectedClient = clients.find(c => c.id === clientId);
//   // if (selectedClient && selectedClient.phone !== watch('mobileNo')) {
//   //   setValue('mobileNo', selectedClient.phone);
//   // }

//   const handlers = admins.filter(admin => admin.role !== 'super_admin');



//   const clientId = watch('clientId');
//   const selectedClient = clients.find(c => c._id === clientId);

//   useEffect(() => {
//     if (isOpen) {
//       axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
//         .then((response) => {
//           if (Array.isArray(response.data)) {
//             setClients(response.data);
//           } else {
//             console.error('Expected an array, received:', response.data);
//             setClients([]);
//           }
//         })
//         .catch((error) => {
//           console.error('Error fetching clients:', error);
//           setClients([]);
//         });
//     }
//   }, [isOpen]);



//   const onSubmit = (data: EpassportFormData) => {
//     const client = clients.find(c => c._id === data.clientId);
//     if (client) {
//       axios.put(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/updateEpassport/${application._id}`,
//           {
//             ...data,
//             clientName: client.name,
//             date: data.date.toISOString(),
//             deadline: data.deadline.toISOString(),
//           }
//         )
//         .then((response) => {
//           console.log('ePassport updated successfully', response.data);
//           onClose();  // Close the modal after successful update
//         })
//         .catch((error) => {
//           console.error('Error updating ePassport:', error);
//         });
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Edit ePassport Application</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//           {/* Client Information */}
//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Client Information</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700">Client</label>
//                 <SearchableSelect
//                   options={clients.map(client => ({
//                     value: client._id,
//                     label: client.name
//                   }))}
//                   value={watch('clientId')}
//                   onChange={(value) => {
//                     setValue('clientId', value);
//                     const client = clients.find(c => c._id === value);
//                     if (client) {
//                       // console.log('client is',client)
//                       setValue('mobileNo', client.phone);
//                     }
//                   }}
//                   placeholder="Select client"
//                   className="mt-1"
//                   error={errors.clientId?.message}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
//                 <Input 
//                   value={selectedClient?.phone || ''}
//                   className="mt-1 bg-gray-50" 
//                   disabled 
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Contact Channel</label>
//                 <select
//                   {...register('contactChannel')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="Viber">Viber</option>
//                   <option value="Facebook">Facebook</option>
//                   <option value="WhatsApp">WhatsApp</option>
//                   <option value="Friend">Friend</option>
//                   <option value="Office Visit">Office Visit</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Application Details */}
//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Application Details</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Application Type</label>
//                 <select
//                   {...register('applicationType')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="Newborn Child">Newborn Child</option>
//                   <option value="Passport Renewal">Passport Renewal</option>
//                   <option value="Lost Passport">Lost Passport</option>
//                   <option value="Damaged Passport">Damaged Passport</option>
//                   <option value="Travel Document">Travel Document</option>
//                   <option value="Birth Registration">Birth Registration</option>
//                 </select>
//               </div>

//               {/* <div>
//                 <label className="block text-sm font-medium text-gray-700">Handled By</label>
//                 <select
//                   {...register('handledBy')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="">Select handler</option>
//                   {handlers.map((admin) => (
//                     <option key={admin.id} value={admin.name}>
//                       {admin.name}
//                     </option>
//                   ))}
//                 </select>
//               </div> */}

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Application Status</label>
//                 <select
//                   {...register('applicationStatus')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="Details Pending">Details Pending</option>
//                   <option value="Ready to Process">Ready to Process</option>
//                   <option value="Under Progress">Under Progress</option>
//                   <option value="Cancelled">Cancelled</option>
//                   <option value="Completed">Completed</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Data Sent Status</label>
//                 <select
//                   {...register('dataSentStatus')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="Not Sent">Not Sent</option>
//                   <option value="Sent">Sent</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Date</label>
//                 <DatePicker
//                   selected={watch('date')}
//                   onChange={(date) => setValue('date', date as Date)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                   dateFormat="yyyy-MM-dd"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Deadline</label>
//                 <DatePicker
//                   selected={watch('deadline')}
//                   onChange={(date) => setValue('deadline', date as Date)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                   dateFormat="yyyy-MM-dd"
//                 />
//               </div>

//               <div className="col-span-2">
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     {...register('ghumtiService')}
//                     onChange={(e) => {
//                       setValue('ghumtiService', e.target.checked);
//                       setShowPrefecture(e.target.checked);
//                       if (!e.target.checked) {
//                         setValue('prefecture', undefined);
//                       }
//                     }}
//                     className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//                   />
//                   <span className="text-sm text-gray-700">Ghumti Service</span>
//                 </label>
//               </div>

//               {ghumtiService && (
//                 <div className="col-span-2">
//                   <label className="block text-sm font-medium text-gray-700">Prefecture</label>
//                   <select
//                     {...register('prefecture')}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                   >
//                     <option value="">Select prefecture</option>
//                     {PREFECTURES.map((prefecture) => (
//                       <option key={prefecture} value={prefecture}>
//                         {prefecture}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment Details */}
//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Payment Details</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Amount (¥)</label>
//                 <Input
//                   type="number"
//                   min="0"
//                   {...register('amount', { valueAsNumber: true })}
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Paid Amount (¥)</label>
//                 <Input
//                   type="number"
//                   min="0"
//                   {...register('paidAmount', { valueAsNumber: true })}
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Discount (¥)</label>
//                 <Input
//                   type="number"
//                   min="0"
//                   {...register('discount', { valueAsNumber: true })}
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Due Amount (¥)</label>
//                 <Input
//                   type="number"
//                   value={dueAmount}
//                   className="mt-1 bg-gray-50"
//                   disabled
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Payment Status</label>
//                 <select
//                   {...register('paymentStatus')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="Due">Due</option>
//                   <option value="Paid">Paid</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Payment Method</label>
//                 <select
//                   {...register('paymentMethod')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="Bank Furicomy">Bank Furicomy</option>
//                   <option value="Counter Cash">Counter Cash</option>
//                   <option value="Credit Card">Credit Card</option>
//                   <option value="Paypay">Paypay</option>
//                   <option value="Line Pay">Line Pay</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="space-y-4">
//             <h3 className="font-medium border-b pb-2">Notes</h3>
//             <div>
//               <textarea
//                 {...register('remarks')}
//                 rows={3}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 placeholder="Add any additional notes..."
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit">Save Changes</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
















import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
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
  const dueAmount = amount - (paidAmount + discount);

  const handlers = admins.filter(admin => admin.role !== 'super_admin');
  const clientId = watch('clientId');
  const selectedClient = clients.find(c => c._id === clientId);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
        .then((response) => {
          if (Array.isArray(response.data)) {
            setClients(response.data);
          } else {
            console.error('Expected an array, received:', response.data);
            setClients([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching clients:', error);
          setClients([]);
        });
    }
  }, [isOpen]);

  const onSubmit = (data: any) => {
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <SearchableSelect
                  options={clients.map(client => ({
                    value: client._id,
                    label: client.name
                  }))}
                  value={watch('clientId')}
                  onChange={(value) => {
                    setValue('clientId', value);
                    const client = clients.find(c => c._id === value);
                    if (client) {
                      setValue('mobileNo', client.phone);
                    }
                  }}
                  placeholder="Select client"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                <label className="block text-sm font-medium text-gray-700">Application Status</label>
                <select
                  {...register('applicationStatus')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="Details Pending">Details Pending</option>
                  <option value="Ready to Process">Ready to Process</option>
                  <option value="Under Progress">Under Progress</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data Sent Status</label>
                <select
                  {...register('dataSentStatus')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="Not Sent">Not Sent</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <DatePicker
                  selected={watch('date')}
                  onChange={(date) => setValue('date', date as Date)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <DatePicker
                  selected={watch('deadline')}
                  onChange={(date) => setValue('deadline', date as Date)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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

              {showPrefecture && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prefecture</label>
                  <select
                    {...register('prefecture')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  >
                    {PREFECTURES.map((prefecture) => (
                      <option key={prefecture.value} value={prefecture.value}>
                        {prefecture.label}
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
                  value={dueAmount}
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>
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
