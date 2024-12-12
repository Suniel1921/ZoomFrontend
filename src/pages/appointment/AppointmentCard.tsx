import { Calendar, Clock, Video, MapPin, Palette } from 'lucide-react';
import type { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const isDesignDeadline = appointment.type.startsWith('Design Deadline:');

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            {appointment.type}
            {isDesignDeadline && <Palette className="h-4 w-4 text-brand-yellow" />}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(appointment.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {appointment.time}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
          appointment.status === 'Completed' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {appointment.status}
        </span>
      </div>

      {appointment.meetingType === 'online' ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Video className="h-4 w-4" />
          <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" 
             className="text-brand-black hover:text-brand-yellow">
            Join Online Meeting
          </a>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{appointment.location}</span>
        </div>
      )}

      {isDesignDeadline && (
        <div className="mt-2 text-sm text-gray-600">
          Handled by: {appointment.handledBy}
        </div>
      )}
    </div>
  );
}