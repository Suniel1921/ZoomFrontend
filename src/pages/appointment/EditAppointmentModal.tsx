import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store';
import type { Appointment } from '../../types';

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
  const { updateAppointment } = useStore();

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    watch: editWatch,
    formState: { errors: editErrors },
  } = useForm<EditAppointmentFormData>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      date: new Date(appointment.date),
      time: appointment.time,
      meetingType: appointment.meetingType,
      location: appointment.location,
      meetingLink: appointment.meetingLink,
      notes: appointment.notes,
      duration: appointment.duration,
    },
  });

  const {
    register: rescheduleRegister,
    handleSubmit: handleRescheduleSubmit,
    setValue: setRescheduleValue,
    watch: rescheduleWatch,
    formState: { errors: rescheduleErrors },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: new Date(appointment.date),
      time: appointment.time,
      notes: appointment.notes,
    },
  });

  const onEditSubmit = (data: EditAppointmentFormData) => {
    updateAppointment(appointment.id, {
      ...appointment,
      ...data,
      date: data.date.toISOString(),
    });
    onClose();
  };

  const onRescheduleSubmit = (data: RescheduleFormData) => {
    updateAppointment(appointment.id, {
      ...appointment,
      date: data.date.toISOString(),
      time: data.time,
      notes: data.notes,
    });
    onClose();
  };

  if (!isOpen) return null;

  if (mode === 'reschedule') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Reschedule Appointment</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleRescheduleSubmit(onRescheduleSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <Input value={appointment.clientName} disabled className="mt-1 bg-gray-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <Input value={appointment.type} disabled className="mt-1 bg-gray-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <DatePicker
                selected={rescheduleWatch('date')}
                onChange={(date) => setRescheduleValue('date', date as Date)}
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
                  {...rescheduleRegister('time')}
                  className="block w-full"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {rescheduleErrors.time && (
                <p className="mt-1 text-sm text-red-600">{rescheduleErrors.time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...rescheduleRegister('notes')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                placeholder="Add any additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Reschedule</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <Input value={appointment.clientName} disabled className="mt-1 bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <Input value={appointment.type} disabled className="mt-1 bg-gray-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <DatePicker
              selected={editWatch('date')}
              onChange={(date) => setEditValue('date', date as Date)}
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
                {...editRegister('time')}
                className="block w-full"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {editErrors.time && (
              <p className="mt-1 text-sm text-red-600">{editErrors.time.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <Input
              type="number"
              min="15"
              step="15"
              {...editRegister('duration', { valueAsNumber: true })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
            <select
              {...editRegister('meetingType')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="physical">Physical Meeting</option>
              <option value="online">Online Meeting</option>
            </select>
          </div>

          {editWatch('meetingType') === 'physical' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <Input {...editRegister('location')} className="mt-1" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
              <Input {...editRegister('meetingLink')} className="mt-1" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...editRegister('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              placeholder="Add any additional notes..."
            />
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