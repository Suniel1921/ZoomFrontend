// ********add new responsiveness**********


import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  FileText, 
  Calendar, 
  Clock,
  Bell,
  Languages // Added for translation icon
} from 'lucide-react';
import StatsCard from '../reports/components/StatsCard';
import OngoingTasks from '../reports/components/OngoingTasks';
import ServiceRequestsList from './components/ServiceRequestsList';
import { useAuthGlobally } from '../../context/AuthContext';
import axios from 'axios'; 
import toast from 'react-hot-toast';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [auth, setAuth] = useAuthGlobally();
  const [clients, setClients] = useState([]); 
  const [totalTask, setTotalTask] = useState([]); 
  const [appointments, setAppointments] = useState([]); 
  const [serviceRequested, setServiceRequested] = useState([]); 
  const [superAdminName, setSuperAdminName] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`);
        setClients(response.data.clients || []); 
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        setClients([]); 
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`);
        setTotalTask(response.data.allData || []); 
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        setTotalTask([]); 
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`);
        setAppointments(response.data.appointments || []);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setAppointments([]); 
      }
    };

    const fetchServiceRequested = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`);
        setServiceRequested(response.data.data || []); 
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setServiceRequested([]); 
      }
    };

    const fetchSuperAdminName = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getSuperAdmin/${auth.user.id}`);
        if(response.data.success){
          setSuperAdminName(response.data.data)
        }
      } catch (error:any) {
        if(error.response){
          toast.error(error.response.data.message)
        }
      }
    }

    fetchClients();
    fetchApplications();
    fetchAppointments();
    fetchServiceRequested();
    fetchSuperAdminName();
  }, []); 

  const activeClients = clients.filter(c => c?.status === 'active');
  const totalClients = clients.length;
  const activeClientsPercentage = totalClients > 0 
    ? ((activeClients.length / totalClients) * 100).toFixed(1)
    : '0';

  const totalTasksLength = Object.values(totalTask)
    .reduce((sum, taskArray) => sum + taskArray?.length, 0); 

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {superAdminName.name}!
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              Here's what's happening today
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-500">Today's Date</p>
            <p className="text-base sm:text-lg font-semibold">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          label="Active Clients"
          value={activeClients.length}
          icon={UsersIcon}
          trend="up"
          trendValue={`${activeClientsPercentage}% of total`}
        />
        <StatsCard
          label="Ongoing Tasks"
          value={totalTasksLength}
          icon={Clock}
        />
        <StatsCard
          label="Upcoming Appointments"
          value={appointments.length}
          icon={Calendar}
        /> 
        <StatsCard
          label="Service Requested"
          value={serviceRequested.length}
          icon={Bell}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <button
          onClick={() => navigate('/dashboard/clients', { state: { openAddModal: true } })}
          className="bg-brand-yellow/20 text-brand-black hover:bg-brand-yellow/30 transition-all duration-200 rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
            <UsersIcon className="h-12 w-12 sm:h-16 sm:w-16" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">New Client</h3>
              <p className="text-xs sm:text-sm opacity-90">Add a new client to the system</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/applications', { state: { openAddModal: true } })}
          className="bg-brand-yellow/30 text-brand-black hover:bg-brand-yellow/40 transition-all duration-200 rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">New Application</h3>
              <p className="text-xs sm:text-sm opacity-90">Create a new visa application</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/appointment', { state: { openAddModal: true } })}
          className="bg-brand-yellow/40 text-brand-black hover:bg-brand-yellow/50 transition-all duration-200 rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Schedule</h3>
              <p className="text-xs sm:text-sm opacity-90">Book a new appointment</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/translations', { state: { openAddModal: true } })}
          className="bg-brand-yellow/40 text-brand-black hover:bg-brand-yellow/50 transition-all duration-200 rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-brand-yellow/10"
        >
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
            <Languages className="h-12 w-12 sm:h-16 sm:w-16" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Translation</h3>
              <p className="text-xs sm:text-sm opacity-90">Start a new translation</p>
            </div>
          </div>
        </button>
      </div>

      {/* Ongoing Tasks */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ongoing Tasks</h2>
        <OngoingTasks />
      </div>

      {/* Service Requests */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Service Requests</h2>
        <ServiceRequestsList itemsPerPage={2} />
      </div>
    </div>
  );
}














//****************showing real time notification when service requested *****************


// import { useEffect, useState } from 'react'; 
// import { useNavigate } from 'react-router-dom';
// import { 
//   Users as UsersIcon, 
//   FileText, 
//   Calendar, 
//   Clock,
//   Bell,
//   Languages // Added for translation icon
// } from 'lucide-react';
// import StatsCard from '../reports/components/StatsCard';
// import OngoingTasks from '../reports/components/OngoingTasks';
// import ServiceRequestsList from './components/ServiceRequestsList';
// import { useAuthGlobally } from '../../context/AuthContext';
// import axios from 'axios'; 
// import toast from 'react-hot-toast';
// import io from 'socket.io-client';

// export default function DashboardHome() {
//   const navigate = useNavigate();
//   const [auth, setAuth] = useAuthGlobally();
//   const [clients, setClients] = useState([]); 
//   const [totalTask, setTotalTask] = useState([]); 
//   const [appointments, setAppointments] = useState([]); 
//   const [serviceRequested, setServiceRequested] = useState([]); 
//   const [superAdminName, setSuperAdminName] = useState([]);
//   const socket = io(import.meta.env.VITE_REACT_APP_URL); // Initialize WebSocket connection

//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`);
//         setClients(response.data.clients || []); 
//       } catch (error) {
//         console.error("Failed to fetch clients:", error);
//         setClients([]); 
//       }
//     };

//     const fetchApplications = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`);
//         setTotalTask(response.data.allData || []); 
//       } catch (error) {
//         console.error("Failed to fetch applications:", error);
//         setTotalTask([]); 
//       }
//     };

//     const fetchAppointments = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`);
//         setAppointments(response.data.appointments || []);
//       } catch (error) {
//         console.error("Failed to fetch appointments:", error);
//         setAppointments([]); 
//       }
//     };

//     const fetchServiceRequested = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`);
//         setServiceRequested(response.data.data || []); 
//       } catch (error) {
//         console.error("Failed to fetch service requests:", error);
//         setServiceRequested([]); 
//       }
//     };

//     const fetchSuperAdminName = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getSuperAdmin/${auth.user.id}`);
//         if(response.data.success){
//           setSuperAdminName(response.data.data)
//         }
//       } catch (error) {
//         if(error.response){
//           toast.error(error.response.data.message)
//         }
//       }
//     }

//     fetchClients();
//     fetchApplications();
//     fetchAppointments();
//     fetchServiceRequested();
//     fetchSuperAdminName();

//     // WebSocket event listener for new service request
//     socket.on('newServiceRequest', (newRequest) => {
//       setServiceRequested((prevRequests) => [newRequest, ...prevRequests]); // Add the new request
//       new Audio('/notification.mp3').play(); // Play notification sound when a new request comes in
//     });

//     return () => {
//       socket.off('newServiceRequest'); // Cleanup on component unmount
//     };

//   }, [auth.user.id]); // Ensure fetching only for the logged-in user

//   const activeClients = clients.filter(c => c?.status === 'active');
//   const totalClients = clients.length;
//   const activeClientsPercentage = totalClients > 0 
//     ? ((activeClients.length / totalClients) * 100).toFixed(1)
//     : '0';

//   const totalTasksLength = Object.values(totalTask)
//     .reduce((sum, taskArray) => sum + taskArray?.length, 0); 

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Welcome Section */}
//       <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
//               Welcome back, {superAdminName.name}!
//             </h1>
//             <p className="mt-1 text-sm sm:text-base text-gray-500">
//               Here's what's happening today
//             </p>
//           </div>
//           <div className="text-left sm:text-right">
//             <p className="text-xs sm:text-sm text-gray-500">Today's Date</p>
//             <p className="text-base sm:text-lg font-semibold">
//               {new Date().toLocaleDateString('en-US', { 
//                 weekday: 'long', 
//                 year: 'numeric', 
//                 month: 'long', 
//                 day: 'numeric' 
//               })}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
//         <StatsCard
//           label="Active Clients"
//           value={activeClients.length}
//           icon={UsersIcon}
//           trend="up"
//           trendValue={`${activeClientsPercentage}% of total`}
//         />
//         <StatsCard
//           label="Ongoing Tasks"
//           value={totalTasksLength}
//           icon={Clock}
//         />
//         <StatsCard
//           label="Upcoming Appointments"
//           value={appointments.length}
//           icon={Calendar}
//         /> 
//         <StatsCard
//           label="Service Requested"
//           value={serviceRequested.length}
//           icon={Bell}
//         />
//       </div>

//       {/* Ongoing Tasks */}
//       <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//         <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ongoing Tasks</h2>
//         <OngoingTasks />
//       </div>

//       {/* Service Requests */}
//       <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//         <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Service Requests</h2>
//         <ServiceRequestsList itemsPerPage={2} />
//       </div>
//     </div>
//   );
// }
