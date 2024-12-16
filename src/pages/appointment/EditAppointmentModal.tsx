// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import { X, Clock } from 'lucide-react';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import type { Appointment } from '../../types';
// import toast from 'react-hot-toast';

// const editAppointmentSchema = z.object({
//   date: z.date(),
//   time: z.string().min(1, 'Time is required'),
//   meetingType: z.enum(['physical', 'online']),
//   location: z.string().optional(),
//   meetingLink: z.string().optional(),
//   notes: z.string().optional(),
//   duration: z.number().min(15, 'Minimum duration is 15 minutes'),
// });

// const rescheduleSchema = z.object({
//   date: z.date(),
//   time: z.string().min(1, 'Time is required'),
//   notes: z.string().optional(),
// });

// type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;
// type RescheduleFormData = z.infer<typeof rescheduleSchema>;

// interface EditAppointmentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   appointment: Appointment;
//   mode: 'edit' | 'reschedule';
// }

// export default function EditAppointmentModal({
//   isOpen,
//   onClose,
//   appointment,
//   mode,
// }: EditAppointmentModalProps) {
//   const formSchema = mode === 'edit' ? editAppointmentSchema : rescheduleSchema;
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       date: new Date(appointment.date),
//       time: appointment.time,
//       ...(mode === 'edit'
//         ? {
//             meetingType: appointment.meetingType,
//             location: appointment.location,
//             meetingLink: appointment.meetingLink,
//             notes: appointment.notes,
//             duration: appointment.duration,
//           }
//         : { notes: appointment.notes }),
//     },
//   });

//   const onSubmit = async (data: any) => {
//     const payload = {
//       mode,
//       ...data,
//       date: data.date.toISOString(),
//     };

//     try {
//       const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateAppointment/${appointment._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();
//       if (result.success) {
//         toast(`${mode === 'edit' ? 'Appointment updated' : 'Appointment rescheduled'} successfully`);
//         onClose();
//       } else {
//         toast(result.message || 'An error occurred');
//       }
//     } catch (error) {
//       console.error('Failed to update appointment:', error);
//       toast('Failed to update appointment.');
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">
//             {mode === 'edit' ? 'Edit Appointment' : 'Reschedule Appointment'}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Client</label>
//             <Input value={appointment.clientName} disabled className="mt-1 bg-gray-50" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Type</label>
//             <Input value={appointment.type} disabled className="mt-1 bg-gray-50" />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Date</label>
//             <DatePicker
//               selected={watch('date')}
//               onChange={(date) => setValue('date', date as Date)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               minDate={new Date()}
//               dateFormat="MMMM d, yyyy"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Time</label>
//             <div className="mt-1 relative">
//               <Input
//                 type="time"
//                 {...register('time')}
//                 className="block w-full"
//               />
//               <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             </div>
//             {errors.time && (
//               <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
//             )}
//           </div>

//           {mode === 'edit' && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
//                 <Input
//                   type="number"
//                   min="15"
//                   step="15"
//                   {...register('duration', { valueAsNumber: true })}
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
//                 <select
//                   {...register('meetingType')}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                 >
//                   <option value="physical">Physical Meeting</option>
//                   <option value="online">Online Meeting</option>
//                 </select>
//               </div>

//               {watch('meetingType') === 'physical' ? (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Location</label>
//                   <Input {...register('location')} className="mt-1" />
//                 </div>
//               ) : (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
//                   <Input {...register('meetingLink')} className="mt-1" />
//                 </div>
//               )}
//             </>
//           )}

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
//             <Button type="submit">{mode === 'edit' ? 'Save Changes' : 'Reschedule'}</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }












import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { X, Clock } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import type { Appointment } from '../../types';
import toast from 'react-hot-toast';

const editAppointmentSchema = z.object({
  date: z.date(),
  time: z.string().min(1, 'Time is required'),
  meetingType: z.enum(['physical', 'online']),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
  duration: z.number().min(15, 'Minimum duration is 15 minutes'),
});

const rescheduleSchema = z.object({
  date: z.date(),
  time: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;
type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  mode: 'edit' | 'reschedule';
}

export default function EditAppointmentModal({
  isOpen,
  onClose,
  appointment,
  mode,
}: EditAppointmentModalProps) {
  const formSchema = mode === 'edit' ? editAppointmentSchema : rescheduleSchema;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(appointment.date),
      time: appointment.time,
      ...(mode === 'edit'
        ? {
            meetingType: appointment.meetingType,
            location: appointment.location,
            meetingLink: appointment.meetingLink,
            notes: appointment.notes,
            duration: appointment.duration,
          }
        : { notes: appointment.notes }),
    },
  });

  const onSubmit = async (data: any) => {
    const payload = {
      mode,
      ...data,
      date: data.date.toISOString(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateAppointment/${appointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast(`${mode === 'edit' ? 'Appointment updated' : 'Appointment rescheduled'} successfully`);
        onClose();
      } else {
        toast(result.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast('Failed to update appointment.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Appointment' : 'Reschedule Appointment'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            {/* Displaying the client name */}
            <Input value={appointment.clientName} disabled className="mt-1 bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <Input value={appointment.type} disabled className="mt-1 bg-gray-50" />
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
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
            )}
          </div>

          {mode === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  {...register('duration', { valueAsNumber: true })}
                  className="mt-1"
                />
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

              {watch('meetingType') === 'physical' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <Input {...register('location')} className="mt-1" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                  <Input {...register('meetingLink')} className="mt-1" />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === 'edit' ? 'Save Changes' : 'Reschedule'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
