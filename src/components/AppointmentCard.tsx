import { Calendar, Clock, Video, MapPin, Palette, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import Button from './Button';
import type { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onStatusChange?: (appointment: Appointment, status: 'Completed' | 'Cancelled') => void;
}

export default function AppointmentCard({ 
  appointment,
  onEdit,
  onReschedule,
  onStatusChange 
}: AppointmentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const isDesignDeadline = appointment.type.startsWith('Design Deadline:');

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
      setShowActions(false);
    }
  };

  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule(appointment);
      setShowActions(false);
    }
  };

  const handleStatusChange = (status: 'Completed' | 'Cancelled') => {
    if (onStatusChange) {
      onStatusChange(appointment, status);
      setShowActions(false);
    }
  };

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
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
            appointment.status === 'Completed' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {appointment.status}
          </span>
          {(onEdit || onReschedule || onStatusChange) && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {appointment.status === 'Scheduled' && (
                      <>
                        {onReschedule && (
                          <button
                            onClick={handleReschedule}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Reschedule
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={handleEdit}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit Details
                          </button>
                        )}
                        {onStatusChange && (
                          <>
                            <button
                              onClick={() => handleStatusChange('Completed')}
                              className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                            >
                              Mark as Completed
                            </button>
                            <button
                              onClick={() => handleStatusChange('Cancelled')}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Cancel Appointment
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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