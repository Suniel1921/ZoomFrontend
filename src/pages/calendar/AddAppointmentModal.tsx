import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Users, Video, MapPin, Clock, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store';

const appointmentSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  type: z.enum(['Visit Visa Consultation', 'Student Visa Consultation', 'Document Review', 'General Consultation', 'Follow-up Meeting']),
  date: z.date(),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(15, 'Minimum duration is 15 minutes'),
  meetingType: z.enum(['physical', 'online']),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
  sendReminder: z.boolean(),
  reminderType: z.enum(['email', 'sms', 'both']).optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date | null;
  selectedTime?: string;
}

export default function AddAppointmentModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
}: AddAppointmentModalProps) {
  const { clients, addAppointment } = useStore();
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: selectedDate || new Date(),
      time: selectedTime || '10:00',
      duration: 60,
      sendReminder: true,
      reminderType: 'email',
    },
  });

  const meetingType = watch('meetingType');
  const sendReminder = watch('sendReminder');

  const onSubmit = (data: AppointmentFormData) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) return;

    const appointment = {
      ...data,
      clientName: client.name,
      email: client.email,
      phone: client.phone,
      status: 'Scheduled' as const,
    };

    if (isRecurring && recurringEndDate) {
      // Create recurring appointments
      const dates: Date[] = [];
      let currentDate = new Date(data.date);

      while (currentDate <= recurringEndDate) {
        dates.push(new Date(currentDate));
        if (recurringFrequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (recurringFrequency === 'biweekly') {
          currentDate.setDate(currentDate.getDate() + 14);
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      dates.forEach(date => {
        addAppointment({
          ...appointment,
          date: date.toISOString(),
          isRecurring: true,
          recurringFrequency,
        });
      });
    } else {
      addAppointment({
        ...appointment,
        date: data.date.toISOString(),
        isRecurring: false,
      });
    }

    reset();
    onClose();
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
              <select
                {...register('clientId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                {...register('type')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="">Select type</option>
                <option value="Visit Visa Consultation">Visit Visa Consultation</option>
                <option value="Student Visa Consultation">Student Visa Consultation</option>
                <option value="Document Review">Document Review</option>
                <option value="General Consultation">General Consultation</option>
                <option value="Follow-up Meeting">Follow-up Meeting</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="mt-1 relative">
                <DatePicker
                  selected={watch('date')}
                  onChange={(date) => setValue('date', date as Date)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
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
                <div className="mt-1 relative">
                  <Input
                    {...register('location')}
                    placeholder="Enter meeting location"
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {meetingType === 'online' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                <div className="mt-1 relative">
                  <Input
                    {...register('meetingLink')}
                    placeholder="Enter meeting link"
                  />
                  <Video className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Recurring Meeting Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
              <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                Recurring Meeting
              </label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <DatePicker
                    selected={recurringEndDate}
                    onChange={(date) => setRecurringEndDate(date)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    minDate={watch('date')}
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reminder Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendReminder"
                {...register('sendReminder')}
                className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
              <label htmlFor="sendReminder" className="ml-2 block text-sm text-gray-700">
                Send Reminder
              </label>
            </div>

            {sendReminder && (
              <div className="pl-6">
                <label className="block text-sm font-medium text-gray-700">Reminder Type</label>
                <select
                  {...register('reminderType')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both Email & SMS</option>
                </select>
              </div>
            )}
          </div>

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
            <Button type="submit">Schedule Appointment</Button>
          </div>
        </form>
      </div>
    </div>
  );
}