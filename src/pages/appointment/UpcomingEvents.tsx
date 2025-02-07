import { useState, useEffect } from 'react';
import { format, isAfter, startOfDay, addDays, isSameDay } from 'date-fns';
import { Clock, Video, MapPin } from 'lucide-react';
import { useStore } from '../../store';
import { safeParse } from '../../utils/dateUtils';
import AppointmentActions from './AppointmentActions';
import type { Appointment } from '../../types';
import axios from 'axios';
import { useAppointmentGlobally } from '../../context/AppointmentContext';

interface UpcomingEventsProps {
  onEdit: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
  fetchAppointments : ()=> void;
}

export default function UpcomingEvents({ onEdit, onReschedule, fetchAppointments }: UpcomingEventsProps) {
  const { appointments, applications, japanVisitApplications, translations, graphicDesignJobs, updateAppointment } = useStore();
  const today = startOfDay(new Date());
  // const [fetchedAppointments, setFetchedAppointments] = useState<Appointment[]>([]);
  const {appointmentData} = useAppointmentGlobally();
  console.log('app data is', appointmentData)

    // Check if appointmentData is an array before proceeding
    const safeAppointmentData = Array.isArray(appointmentData) ? appointmentData : [];

  
  // Get today's appointments (excluding design deadlines)
  const todayAppointments = safeAppointmentData.filter(apt => {
    const aptDate = safeParse(apt.date);
    return aptDate &&  isSameDay(aptDate, today) &&  apt.status === 'Scheduled' && !apt.type.startsWith('Design Deadline:');
  });



  // Get upcoming appointments (next 7 days, excluding design deadlines)
  const upcomingAppointments = safeAppointmentData.filter(apt => {
    const aptDate = safeParse(apt.date);
    return aptDate && 
           isAfter(aptDate, today) && 
           !isAfter(aptDate, addDays(today, 7)) && 
           apt.status === 'Scheduled' &&
           !apt.type.startsWith('Design Deadline:');
  });

  const handleStatusChange = (appointment: Appointment, status: 'Completed' | 'Cancelled') => {
    updateAppointment(appointment.id, {
      ...appointment,
      status,
      ...(status === 'Completed' ? { completedAt: new Date().toISOString() } : { cancelledAt: new Date().toISOString() })
    });
  };

  const renderAppointment = (apt: Appointment) => (
    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-medium">{apt.clientId?.name || 'Unknown Client'}</h3> {/* Show client name from populated clientId */}
        <p className="text-sm text-gray-500 mt-1">{apt.type}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(safeParse(apt.date) || new Date(), 'MMM d, yyyy')} at {apt.time}
          </div>
          {apt.meetingType === 'online' ? (
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <a href={apt.meetingLink} className="text-brand-black hover:text-brand-yellow">
                Join Meeting
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {apt.location}
            </div>
          )}
        </div>
      </div>
      <AppointmentActions
        appointment={apt}
        onEdit={() => onEdit(apt)}
        onReschedule={() => onReschedule(apt)}
        onStatusChange={handleStatusChange}
        fetchAppointments = {fetchAppointments}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Today's Schedule</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Appointments</h3>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No appointments scheduled for today</p>
            ) : (
              <div className="space-y-2">
                {todayAppointments.map(renderAppointment)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Upcoming Events</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Appointments</h3>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming appointments</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map(renderAppointment)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





