// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { X, Clock } from 'lucide-react';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import SearchableSelect from '../../components/SearchableSelect';
// import { useStore } from '../../store';

// const appointmentSchema = z.object({
//   clientId: z.string().min(1, 'Client is required'),
//   type: z.string().min(1, 'Type is required'),
//   date: z.date(),
//   time: z.string().min(1, 'Time is required'),
//   duration: z.number().min(15, 'Minimum duration is 15 minutes'),
//   meetingType: z.enum(['physical', 'online']),
//   location: z.string().optional(),
//   meetingLink: z.string().optional(),
//   notes: z.string().optional(),
//   sendReminder: z.boolean(),
//   reminderType: z.enum(['email', 'sms', 'both']).optional(),
// });

// type AppointmentFormData = z.infer<typeof appointmentSchema>;

// interface AddAppointmentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedDate?: Date | null;
//   selectedTime?: string;
//   appointment?: {
//     clientId: string;
//     type: string;
//     meetingType: 'physical' | 'online';
//     location?: string;
//     meetingLink?: string;
//     notes?: string;
//   } | null;
// }

// export default function AddAppointmentModal({
//   isOpen,
//   onClose,
//   selectedDate,
//   selectedTime,
//   appointment,
// }: AddAppointmentModalProps) {
//   const { clients, addAppointment } = useStore();
//   const [isRecurring, setIsRecurring] = useState(false);
//   const [recurringFrequency, setRecurringFrequency] = useState('weekly');
//   const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<AppointmentFormData>({
//     resolver: zodResolver(appointmentSchema),
//     defaultValues: {
//       date: selectedDate || new Date(),
//       time: selectedTime || '10:00',
//       duration: 60,
//       sendReminder: true,
//       reminderType: 'email',
//       ...(appointment && {
//         clientId: appointment.clientId,
//         type: appointment.type,
//         meetingType: appointment.meetingType,
//         location: appointment.location,
//         meetingLink: appointment.meetingLink,
//         notes: appointment.notes,
//       }),
//     },
//   });

//   const meetingType = watch('meetingType');
//   const sendReminder = watch('sendReminder');

//   const onSubmit = (data: AppointmentFormData) => {
//     const client = clients.find(c => c.id === data.clientId);
//     if (!client) return;

//     const appointmentData = {
//       ...data,
//       clientName: client.name,
//       email: client.email,
//       phone: client.phone,
//       status: 'Scheduled' as const,
//     };

//     if (isRecurring && recurringEndDate) {
//       // Create recurring appointments
//       const dates: Date[] = [];
//       let currentDate = new Date(data.date);

//       while (currentDate <= recurringEndDate) {
//         dates.push(new Date(currentDate));
//         if (recurringFrequency === 'weekly') {
//           currentDate.setDate(currentDate.getDate() + 7);
//         } else if (recurringFrequency === 'biweekly') {
//           currentDate.setDate(currentDate.getDate() + 14);
//         } else {
//           currentDate.setMonth(currentDate.getMonth() + 1);
//         }
//       }

//       dates.forEach(date => {
//         addAppointment({
//           ...appointmentData,
//           date: date.toISOString(),
//           isRecurring: true,
//           recurringFrequency,
//         });
//       });
//     } else {
//       addAppointment({
//         ...appointmentData,
//         date: data.date.toISOString(),
//         isRecurring: false,
//       });
//     }

//     reset();
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Schedule Appointment</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Client</label>
//               <SearchableSelect
//                 options={clients.map(client => ({
//                   value: client.id,
//                   label: client.name
//                 }))}
//                 value={watch('clientId')}
//                 onChange={(value) => setValue('clientId', value)}
//                 placeholder="Select client"
//                 className="mt-1"
//                 error={errors.clientId?.message}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Type</label>
//               <select
//                 {...register('type')}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               >
//                 <option value="">Select type</option>
//                 <option value="Visit Visa Consultation">Visit Visa Consultation</option>
//                 <option value="Student Visa Consultation">Student Visa Consultation</option>
//                 <option value="Document Review">Document Review</option>
//                 <option value="General Consultation">General Consultation</option>
//                 <option value="Follow-up Meeting">Follow-up Meeting</option>
//               </select>
//               {errors.type && (
//                 <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Date</label>
//               <DatePicker
//                 selected={watch('date')}
//                 onChange={(date) => setValue('date', date as Date)}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 minDate={new Date()}
//                 dateFormat="MMMM d, yyyy"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Time</label>
//               <div className="mt-1 relative">
//                 <Input
//                   type="time"
//                   {...register('time')}
//                   className="block w-full"
//                 />
//                 <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               </div>
//               {errors.time && (
//                 <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
//               <select
//                 {...register('duration', { valueAsNumber: true })}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               >
//                 <option value={15}>15 minutes</option>
//                 <option value={30}>30 minutes</option>
//                 <option value={45}>45 minutes</option>
//                 <option value={60}>1 hour</option>
//                 <option value={90}>1.5 hours</option>
//                 <option value={120}>2 hours</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
//               <select
//                 {...register('meetingType')}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               >
//                 <option value="physical">Physical Meeting</option>
//                 <option value="online">Online Meeting</option>
//               </select>
//             </div>

//             {meetingType === 'physical' && (
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700">Location</label>
//                 <Input
//                   {...register('location')}
//                   placeholder="Enter meeting location"
//                   className="mt-1"
//                 />
//               </div>
//             )}

//             {meetingType === 'online' && (
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
//                 <Input
//                   {...register('meetingLink')}
//                   placeholder="Enter meeting link"
//                   className="mt-1"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Recurring Meeting Options */}
//           <div className="space-y-4">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="recurring"
//                 checked={isRecurring}
//                 onChange={(e) => setIsRecurring(e.target.checked)}
//                 className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//               />
//               <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
//                 Recurring Meeting
//               </label>
//             </div>

//             {isRecurring && (
//               <div className="grid grid-cols-2 gap-4 pl-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Frequency</label>
//                   <select
//                     value={recurringFrequency}
//                     onChange={(e) => setRecurringFrequency(e.target.value)}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                   >
//                     <option value="weekly">Weekly</option>
//                     <option value="biweekly">Bi-weekly</option>
//                     <option value="monthly">Monthly</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">End Date</label>
//                   <DatePicker
//                     selected={recurringEndDate}
//                     onChange={(date) => setRecurringEndDate(date)}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                     minDate={watch('date')}
//                     dateFormat="MMMM d, yyyy"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Reminder Settings */}
//           <div className="space-y-4">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="sendReminder"
//                 {...register('sendReminder')}
//                 className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//               />
//               <label htmlFor="sendReminder" className="ml-2 block text-sm text-gray-700">
//                 Send Reminder
//               </label>
//             </div>

//             {sendReminder && (
//               <div className="pl-6">
//                 <label className="block text-sm font-medium text-gray-700">Reminder Type</label>
//                 <select
//                   {...register('reminderType')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="email">Email</option>
//                   <option value="sms">SMS</option>
//                   <option value="both">Both Email & SMS</option>
//                 </select>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Notes</label>
//             <textarea
//               {...register('notes')}
//               rows={3}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               placeholder="Add any additional notes..."
//             />
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit">Schedule Appointment</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

























// *****************NEW CODE****************

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';
import axios from 'axios';
import toast from 'react-hot-toast';

type AppointmentFormData = {
  clientId: string;
  type: string;
  date: Date;
  time: string;
  duration: number;
  meetingType: 'physical' | 'online';
  location?: string;
  meetingLink?: string;
  notes?: string;
  sendReminder: boolean;
  reminderType?: 'email' | 'sms' | 'both';
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly';
  recurringEndDate?: Date;
};

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  selectedTime?: string;
  appointment?: {
    clientId: string;
    type: string;
    meetingType: 'physical' | 'online';
    location?: string;
    meetingLink?: string;
    notes?: string;
  } | null;
}

export default function AddAppointmentModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  appointment,
  fetchAppointments
}: AddAppointmentModalProps) {
  const [clients, setClients] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    defaultValues: {
      date: selectedDate || new Date(),
      time: selectedTime || '10:00',
      duration: 60,
      sendReminder: true,
      reminderType: 'email',
      isRecurring: false,
      ...(appointment && {
        clientId: appointment.clientId,
        type: appointment.type,
        meetingType: appointment.meetingType,
        location: appointment.location,
        meetingLink: appointment.meetingLink,
        notes: appointment.notes,
      }),
    },
  });

  const meetingType = watch('meetingType');
  const sendReminder = watch('sendReminder');
  const isRecurring = watch('isRecurring');
  const recurringFrequency = watch('recurringFrequency');
  const recurringEndDate = watch('recurringEndDate');

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

  const onSubmit = async (data: AppointmentFormData) => {
    if (!data.clientId) {
      return; // If clientId is not selected, prevent form submission
    }

    const client = clients.find(c => c._id === data.clientId);
    if (!client) return;

    const appointmentData = {
      ...data,
      clientName: client.name,
      email: client.email,
      phone: client.phone,
      status: 'Scheduled',
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/createAppointment`, {
        ...appointmentData,
        date: data.date.toISOString(),
        isRecurring: data.isRecurring,
        recurringFrequency: data.isRecurring ? data.recurringFrequency : null,
        recurringEndDate: data.isRecurring ? data.recurringEndDate?.toISOString() : null,
      });

      if (response.data.success) {
        reset();
        onClose();
        toast.success(response.data.message);
      } else {
        console.error('Failed to create appointment:', response.data.message);
      }
    } catch (error:any) {
      console.error('Error creating appointment:', error);
      if(error.response){
        toast.error(error.response.data.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
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
                className="mt-1"
              />
              {errors.clientId && (
                <p className="text-sm text-red-500 mt-1">Client is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                {...register('type')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="">Select type</option>
                <option value="Visit Visa Consultation">Visit Visa Consultation</option>
                <option value="Student Visa Consultation">Student Visa Consultation</option>
                <option value="Document Review">Document Review</option>
                <option value="General Consultation">General Consultation</option>
                <option value="Follow-up Meeting">Follow-up Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <DatePicker
                selected={watch('date')}
                onChange={(date) => setValue('date', date as Date)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                minDate={new Date()}
                dateFormat="MMMM d, yyyy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <div className="mt-1 relative">
                <Input
                  type="time"
                  {...register('time')}
                  className="block w-full"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <select
                {...register('duration', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
              <select
                {...register('meetingType')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="physical">Physical Meeting</option>
                <option value="online">Online Meeting</option>
              </select>
            </div>

            {meetingType === 'physical' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <Input
                  {...register('location')}
                  placeholder="Enter meeting location"
                  className="mt-1"
                />
              </div>
            )}

            {meetingType === 'online' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                <Input
                  {...register('meetingLink')}
                  placeholder="Enter online meeting link"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register('notes')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                rows={3}
              />
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                {...register('sendReminder')}
                className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">Send reminder</label>
            </div>

            {sendReminder && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Reminder Type</label>
                <select
                  {...register('reminderType')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both</option>
                </select>
              </div>
            )}

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                {...register('isRecurring')}
                className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">Recurring Appointment</label>
            </div>

            {isRecurring && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <select
                    {...register('recurringFrequency')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <DatePicker
                    selected={recurringEndDate}
                    onChange={(date) => setValue('recurringEndDate', date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
