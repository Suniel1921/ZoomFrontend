import { Calendar, Clock, Video, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium">{appointment.type}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
          appointment.status === 'Completed' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium">
              {format(parseISO(appointment.date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className="text-sm font-medium">{appointment.time}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {appointment.meetingType === 'online' ? (
            <Video className="h-4 w-4 text-gray-400" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
          <div>
            <p className="text-xs text-gray-500">
              {appointment.meetingType === 'online' ? 'Meeting Link' : 'Location'}
            </p>
            <p className="text-sm font-medium">
              {appointment.meetingType === 'online' 
                ? appointment.meetingLink 
                : appointment.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}