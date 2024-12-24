import { Calendar, Clock, Video, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Appointment } from '../../types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthGlobally } from '../../context/AuthContext';



export default function AppointmentsSection() {
  const [appointmentsData, setAppointmentsData] = useState([]);
  console.log('appointment is ', appointmentsData)  
  const [auth] = useAuthGlobally();

  // Fetch all appointments for the user
  const getAllAppointmentsByUser = async () => {
    try {
      // const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`);
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointmentByID/${auth?.user?.id}`);
      console.log('appoint res is', response) 
      if (response?.data?.success) {
        setAppointmentsData(response?.data?.appointments);
        toast.success(response.data.message)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch appointments.');
    }
  };

  useEffect(() => {
    getAllAppointmentsByUser();
  }, []);

  // Filter appointments
  const scheduledAppointments = appointmentsData.filter(
    (apt) => apt.status === 'Scheduled' && !apt.type.startsWith('Design Deadline:')
  );

  return (
    <div className="space-y-4">
      {scheduledAppointments.length === 0 ? (
        <p className="text-gray-500 text-center">No appointments scheduled.</p>
      ) : (
        scheduledAppointments.map((apt) => (
          <div key={apt.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{apt.type}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(apt.date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {apt.time}
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  apt.status === 'Scheduled'
                    ? 'bg-blue-100 text-blue-700'
                    : apt.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {apt.status}
              </span>
            </div>

            {apt.meetingType === 'online' ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Video className="h-4 w-4" />
                <a
                  href={apt.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-black hover:text-brand-yellow"
                >
                  Join Online Meeting
                </a>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{apt.location}</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
