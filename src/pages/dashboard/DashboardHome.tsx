import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  FileText, 
  Plane, 
  Languages, 
  Calendar, 
  Clock,
  Bell 
} from 'lucide-react';
import { useStore } from '../../store';
// import { useAdminStore } from '../../store/adminStore';
import StatsCard from '../reports/components/StatsCard';
import OngoingTasks from '../reports/components/OngoingTasks';
import { useServiceRequestStore } from '../../store/serviceRequestStore';
import ServiceRequestsList from './components/ServiceRequestsList';
import Button from '../../components/Button';
import { useAuthGlobally } from '../../context/AuthContext';

export default function DashboardHome() {
  const navigate = useNavigate();
  // const { currentAdmin } = useAdminStore();
  // const isSuper = currentAdmin?.role === 'super_admin';
  const [auth, setAuth] = useAuthGlobally();

  const { 
    clients, 
    applications, 
    japanVisitApplications, 
    translations, 
    graphicDesignJobs,
    epassportApplications,
    otherServices,
    appointments 
  } = useStore();

  const { requests: serviceRequests } = useServiceRequestStore();
  const pendingRequests = serviceRequests.filter(req => req.status === 'pending');

  // Filter out completed tasks
  const activeTasks = {
    applications: applications.filter(app => !['Completed', 'Approved'].includes(app.visaStatus)),
    japanVisit: japanVisitApplications.filter(app => app.applicationStatus !== 'Completed'),
    translations: translations.filter(t => !['Completed', 'Delivered'].includes(t.translationStatus)),
    designs: graphicDesignJobs.filter(job => job.status === 'In Progress'),
    epassport: epassportApplications.filter(app => app.applicationStatus !== 'Completed'),
    otherServices: otherServices.filter(service => service.jobStatus !== 'Completed')
  };

  // Get upcoming appointments
  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'Scheduled' && new Date(apt.date) > new Date()
  );

  // Calculate active clients percentage change
  const activeClients = clients.filter(c => c.status === 'active');
  const totalClients = clients.length;
  const activeClientsPercentage = totalClients > 0 
    ? ((activeClients.length / totalClients) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {auth.user?.fullName}!
            </h1>
            <p className="mt-1 text-gray-500">
              Here's what's happening today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          label="Active Clients"
          value={activeClients.length}
          icon={UsersIcon}
          trend="up"
          trendValue={`${activeClientsPercentage}% of total`}
        />
        <StatsCard
          label="Ongoing Tasks"
          value={Object.values(activeTasks).reduce((sum, tasks) => sum + tasks.length, 0)}
          icon={Clock}
        />
        <StatsCard
          label="Upcoming Appointments"
          value={upcomingAppointments.length}
          icon={Calendar}
        />
        <StatsCard
          label="Service Requests"
          value={pendingRequests.length}
          icon={Bell}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => navigate('/dashboard/clients', { state: { openAddModal: true } })}
          className="bg-brand-yellow/20 text-brand-black hover:bg-brand-yellow/30 transition-all duration-200 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <UsersIcon className="h-16 w-16" />
            <div>
              <h3 className="text-2xl font-bold mb-2">New Client</h3>
              <p className="text-sm opacity-90">Add a new client to the system</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/applications', { state: { openAddModal: true } })}
          className="bg-brand-yellow/30 text-brand-black hover:bg-brand-yellow/40 transition-all duration-200 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <FileText className="h-16 w-16" />
            <div>
              <h3 className="text-2xl font-bold mb-2">New Application</h3>
              <p className="text-sm opacity-90">Create a new visa application</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/appointment', { state: { openAddModal: true } })}
          className="bg-brand-yellow/40 text-brand-black hover:bg-brand-yellow/50 transition-all duration-200 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <Calendar className="h-16 w-16" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Schedule Appointment</h3>
              <p className="text-sm opacity-90">Book a new appointment</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/translations', { state: { openAddModal: true } })}
          className="bg-brand-yellow/50 text-brand-black hover:bg-brand-yellow/60 transition-all duration-200 rounded-lg p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <Languages className="h-16 w-16" />
            <div>
              <h3 className="text-2xl font-bold mb-2">New Translation</h3>
              <p className="text-sm opacity-90">Start a new translation project</p>
            </div>
          </div>
        </button>
      </div>

      {/* Ongoing Tasks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Ongoing Tasks</h2>
        <OngoingTasks />
      </div>

      {/* Service Requests */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Recent Service Requests</h2>
        <ServiceRequestsList itemsPerPage={2} />
      </div>
    </div>
  );
}