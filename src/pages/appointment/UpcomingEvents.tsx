// import { useState } from 'react';
// import { format, isAfter, startOfDay, addDays, isSameDay } from 'date-fns';
// import { Clock, Video, MapPin } from 'lucide-react';
// import { useStore } from '../../store';
// import { safeParse } from '../../utils/dateUtils';
// import AppointmentActions from './AppointmentActions';
// import type { Appointment } from '../../types';

// interface UpcomingEventsProps {
//   onEdit: (appointment: Appointment) => void;
//   onReschedule: (appointment: Appointment) => void;
// }

// export default function UpcomingEvents({ onEdit, onReschedule }: UpcomingEventsProps) {
//   const { appointments, applications, japanVisitApplications, translations, graphicDesignJobs, updateAppointment } = useStore();
//   const today = startOfDay(new Date());

//   // Get today's appointments (excluding design deadlines)
//   const todayAppointments = appointments.filter(apt => {
//     const aptDate = safeParse(apt.date);
//     return aptDate && 
//            isSameDay(aptDate, today) && 
//            apt.status === 'Scheduled' &&
//            !apt.type.startsWith('Design Deadline:');
//   });

//   // Get upcoming appointments (next 7 days, excluding design deadlines)
//   const upcomingAppointments = appointments.filter(apt => {
//     const aptDate = safeParse(apt.date);
//     return aptDate && 
//            isAfter(aptDate, today) && 
//            !isAfter(aptDate, addDays(today, 7)) && 
//            apt.status === 'Scheduled' &&
//            !apt.type.startsWith('Design Deadline:');
//   });

//   // Get all deadlines with unique IDs
//   const allDeadlines = [
//     ...applications.map(app => ({
//       uniqueId: `visa-${app.id}`,
//       id: app.id,
//       clientName: app.clientName,
//       type: app.type,
//       deadline: app.deadline,
//       section: 'Visa Application'
//     })),
//     ...japanVisitApplications.map(app => ({
//       uniqueId: `japan-${app.id}`,
//       id: app.id,
//       clientName: app.clientName,
//       type: 'Japan Visit',
//       deadline: app.deadline,
//       section: 'Japan Visit'
//     })),
//     ...translations.filter(t => t.translationStatus !== 'Delivered').map(t => ({
//       uniqueId: `trans-${t.id}`,
//       id: t.id,
//       clientName: t.clientName,
//       type: 'Document Translation',
//       deadline: t.deadline,
//       section: 'Translation'
//     })),
//     ...graphicDesignJobs.filter(job => job.status === 'In Progress').map(job => ({
//       uniqueId: `design-${job.id}`,
//       id: job.id,
//       clientName: job.clientName,
//       type: `Design: ${job.designType}`,
//       deadline: job.deadline,
//       section: 'Graphic Design',
//       handledBy: job.handledBy
//     }))
//   ];

//   // Get today's deadlines
//   const todayDeadlines = allDeadlines.filter(deadline => {
//     const deadlineDate = safeParse(deadline.deadline);
//     return deadlineDate && isSameDay(deadlineDate, today);
//   });

//   // Get upcoming deadlines (next 7 days)
//   const upcomingDeadlines = allDeadlines.filter(deadline => {
//     const deadlineDate = safeParse(deadline.deadline);
//     return deadlineDate && isAfter(deadlineDate, today) && !isAfter(deadlineDate, addDays(today, 7));
//   });

//   const handleStatusChange = (appointment: Appointment, status: 'Completed' | 'Cancelled') => {
//     updateAppointment(appointment.id, {
//       ...appointment,
//       status,
//       ...(status === 'Completed' ? { completedAt: new Date().toISOString() } : { cancelledAt: new Date().toISOString() })
//     });
//   };

//   const renderAppointment = (apt: Appointment) => (
//     <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//       <div>
//         <h3 className="font-medium">{apt.clientName}</h3>
//         <p className="text-sm text-gray-500 mt-1">{apt.type}</p>
//         <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
//           <div className="flex items-center gap-1">
//             <Clock className="h-4 w-4" />
//             {format(safeParse(apt.date) || new Date(), 'MMM d, yyyy')} at {apt.time}
//           </div>
//           {apt.meetingType === 'online' ? (
//             <div className="flex items-center gap-1">
//               <Video className="h-4 w-4" />
//               <a href={apt.meetingLink} className="text-brand-black hover:text-brand-yellow">
//                 Join Meeting
//               </a>
//             </div>
//           ) : (
//             <div className="flex items-center gap-1">
//               <MapPin className="h-4 w-4" />
//               {apt.location}
//             </div>
//           )}
//         </div>
//       </div>
//       <AppointmentActions
//         appointment={apt}
//         onEdit={() => onEdit(apt)}
//         onReschedule={() => onReschedule(apt)}
//         onStatusChange={handleStatusChange}
//       />
//     </div>
//   );

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {/* Today's Schedule */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         <div className="p-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold">Today's Schedule</h2>
//         </div>
//         <div className="p-4 space-y-4">
//           <div>
//             <h3 className="text-sm font-medium text-gray-700 mb-2">Appointments</h3>
//             {todayAppointments.length === 0 ? (
//               <p className="text-sm text-gray-500">No appointments scheduled for today</p>
//             ) : (
//               <div className="space-y-2">
//                 {todayAppointments.map(renderAppointment)}
//               </div>
//             )}
//           </div>

//           <div>
//             <h3 className="text-sm font-medium text-gray-700 mb-2">Deadlines</h3>
//             {todayDeadlines.length === 0 ? (
//               <p className="text-sm text-gray-500">No deadlines for today</p>
//             ) : (
//               <div className="space-y-2">
//                 {todayDeadlines.map((deadline) => (
//                   <div key={deadline.uniqueId} className="p-2 bg-red-50 rounded">
//                     <p className="font-medium">{deadline.clientName}</p>
//                     <p className="text-sm text-red-600">{deadline.type}</p>
//                     {deadline.handledBy && (
//                       <p className="text-sm text-gray-500">Handler: {deadline.handledBy}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* All Upcoming Events */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         <div className="p-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold">All Upcoming Events</h2>
//         </div>
//         <div className="p-4 space-y-4">
//           <div>
//             <h3 className="text-sm font-medium text-gray-700 mb-2">Appointments</h3>
//             {upcomingAppointments.length === 0 ? (
//               <p className="text-sm text-gray-500">No upcoming appointments</p>
//             ) : (
//               <div className="space-y-2">
//                 {upcomingAppointments.map(renderAppointment)}
//               </div>
//             )}
//           </div>

//           <div>
//             <h3 className="text-sm font-medium text-gray-700 mb-2">Deadlines</h3>
//             {upcomingDeadlines.length === 0 ? (
//               <p className="text-sm text-gray-500">No upcoming deadlines</p>
//             ) : (
//               <div className="space-y-2">
//                 {upcomingDeadlines.map((deadline) => (
//                   <div key={deadline.uniqueId} className="p-2 bg-red-50 rounded">
//                     <div className="flex justify-between">
//                       <p className="font-medium">{deadline.clientName}</p>
//                       <p className="text-sm text-red-600">
//                         {format(safeParse(deadline.deadline) || new Date(), 'MMM d, yyyy')}
//                       </p>
//                     </div>
//                     <p className="text-sm text-gray-600">{deadline.type}</p>
//                     {deadline.handledBy && (
//                       <p className="text-sm text-gray-500">Handler: {deadline.handledBy}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { format, isAfter, startOfDay, addDays, isSameDay } from 'date-fns';
import { Clock, Video, MapPin } from 'lucide-react';
import { useStore } from '../../store';
import { safeParse } from '../../utils/dateUtils';
import AppointmentActions from './AppointmentActions';
import type { Appointment } from '../../types';
import axios from 'axios';

interface UpcomingEventsProps {
  onEdit: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
}

export default function UpcomingEvents({ onEdit, onReschedule }: UpcomingEventsProps) {
  const { appointments, applications, japanVisitApplications, translations, graphicDesignJobs, updateAppointment } = useStore();
  const today = startOfDay(new Date());
  const [fetchedAppointments, setFetchedAppointments] = useState<Appointment[]>([]);

  // Fetch appointments data from the API
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`);
      if (response.data.success) {
        setFetchedAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Get today's appointments (excluding design deadlines)
  const todayAppointments = fetchedAppointments.filter(apt => {
    const aptDate = safeParse(apt.date);
    return aptDate && 
           isSameDay(aptDate, today) && 
           apt.status === 'Scheduled' &&
           !apt.type.startsWith('Design Deadline:');
  });

  // Get upcoming appointments (next 7 days, excluding design deadlines)
  const upcomingAppointments = fetchedAppointments.filter(apt => {
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
