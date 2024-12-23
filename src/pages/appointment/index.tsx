import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, History, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import AddAppointmentModal from './AddAppointmentModal';
import EditAppointmentModal from './EditAppointmentModal';
import AppointmentHistory from './AppointmentHistory';
import UpcomingEvents from './UpcomingEvents';
import type { Appointment } from '../../types';
import { useAppointmentGlobally } from '../../context/AppointmentContext';
import axios from 'axios';

export default function AppointmentPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useState<'edit' | 'reschedule'>('edit');

  const {appointmentData, setAppointmentData} = useAppointmentGlobally();
  // console.log('apt data is ', appointmentData)




  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`);
      if (response?.data?.success) {
        setAppointmentData(response?.data?.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);



  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setMode('edit');
    setIsEditModalOpen(true);
  };




  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setMode('reschedule');
    setIsEditModalOpen(true);
  };

  if (showHistory) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appointments"
          icon={CalendarIcon}
          action={{
            label: 'Back to Calendar',
            onClick: () => setShowHistory(false),
            icon: CalendarIcon,
          }}
        />
        <AppointmentHistory />
      </div>
    );
  }









  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        icon={CalendarIcon}
        actions={[
          {
            label: 'View History',
            onClick: () => setShowHistory(true),
            icon: History,
            variant: 'outline',
          },
          {
            label: 'Add Appointment',
            onClick: () => {
              setSelectedDate(new Date());
              setIsAddModalOpen(true);
            },
            icon: Plus,
          },
        ]}
      />

      <UpcomingEvents
        onEdit={handleEditAppointment}
        onReschedule={handleRescheduleAppointment}
        fetchAppointments = {fetchAppointments}
      />

      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedDate(null);
          setSelectedAppointment(null);
        }}
        selectedDate={selectedDate}
        appointment={selectedAppointment}
        fetchAppointments = {fetchAppointments}
      />

      {selectedAppointment && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          fetchAppointments = {fetchAppointments}
          mode={mode}
        />
      )}
      
    </div>
  );
}