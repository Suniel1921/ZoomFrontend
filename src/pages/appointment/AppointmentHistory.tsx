import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import Input from '../../components/Input';
import AppointmentActions from './AppointmentActions';
import EditAppointmentModal from './EditAppointmentModal';

const ITEMS_PER_PAGE = 50;

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Scheduled');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mode, setMode] = useState('edit');

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`);
      setAppointments(data.appointments);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch appointments.');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle delete appointment
  const handleDelete = async (_id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/deleteAppointment/${_id}`);
        toast.success('Appointment deleted successfully.');
        fetchAppointments();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete appointment.');
      }
    }
  };

  // Handle status change (Completed/Cancelled)
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateappointmentStatus/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}.`);
      fetchAppointments();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update appointment status.');
    }
  };

  // Open edit or reschedule modal
  const handleEdit = (appointment, mode) => {
    setSelectedAppointment(appointment);
    setMode(mode);
    setIsEditModalOpen(true);
  };

  // Filter appointments
// Filter appointments
const filteredAppointments = appointments
  .filter((apt) => {
    const matchesSearch =
      (apt.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (apt.type?.toLowerCase().includes(searchQuery.toLowerCase()) || '');
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  // Paginate appointments
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Appointment History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {paginatedAppointments.map((apt) => (
            <div key={apt.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{apt.clientId?.name}</h3>
                  <p className="text-sm text-gray-500">{apt.type}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      {format(new Date(apt.date), 'MMM d, yyyy')} at {apt.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      apt.status === 'Scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : apt.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {apt.status}
                  </span>
                  {/* <AppointmentActions
                    appointment={apt}
                    onEdit={() => handleEdit(apt, 'edit')}
                    onReschedule={() => handleEdit(apt, 'reschedule')}
                    onStatusChange={(status) => handleStatusChange(apt.id, status)}
                  /> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(apt._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-4 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit/Reschedule Modal */}
      {selectedAppointment && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          mode={mode}
        />
      )}
    </div>
  );
}
