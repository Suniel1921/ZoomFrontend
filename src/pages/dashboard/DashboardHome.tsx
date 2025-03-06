// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Users as UsersIcon,
//   FileText,
//   Calendar,
//   Clock,
//   Bell,
//   Languages,
// } from "lucide-react";
// import StatsCard from "../reports/components/StatsCard";
// import OngoingTasks from "../reports/components/OngoingTasks";
// import ServiceRequestsList from "./components/ServiceRequestsList";
// import { useAuthGlobally } from "../../context/AuthContext";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { SkeletonSection, SkeletonStatsCard, SkeletonWelcome } from "../../components/skeletonEffect/DashboardHomeSkeleton";

// export default function DashboardHome() {
//   const navigate = useNavigate();
//   const [auth] = useAuthGlobally();
//   const [loading, setLoading] = useState(true);
//   const [clients, setClients] = useState([]);
//   const [totalTask, setTotalTask] = useState([]);
//   const [appointments, setAppointments] = useState([]);
//   const [serviceRequested, setServiceRequested] = useState([]);
//   const [superAdminName, setSuperAdminName] = useState({});

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [clientsRes, tasksRes, appointmentsRes, servicesRes, adminRes] =
//           await Promise.all([
//             axios.get(
//               `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`
//             ),
//             axios.get(
//               `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`
//             ),
//             axios.get(
//               `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`
//             ),
//             axios.get(
//               `${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`
//             ),
//             axios.get(
//               `${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getSuperAdmin/${auth.user.id}`
//             ),
//           ]);

//         setClients(clientsRes.data.clients || []);
//         setTotalTask(tasksRes.data.allData || []);
//         setAppointments(appointmentsRes.data.appointments || []);
//         setServiceRequested(servicesRes.data.data || []);

//         if (adminRes.data.success) {
//           setSuperAdminName(adminRes.data.data);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         if (error.response) {
//           toast.error(error.response.data.message);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [auth.user.id]);

//   // Get active clients and this month's active clients
//   const activeClients = clients.filter((c) => c?.status === "active");
//   const totalClients = clients.length;
//   const activeClientsPercentage =
//     totalClients > 0
//       ? ((activeClients.length / totalClients) * 100).toFixed(1)
//       : "0";

//   // Get this month's active clients and growth rate
//   const currentMonth = new Date().getMonth();
//   const currentYear = new Date().getFullYear();
//   const thisMonthActiveClients = activeClients.filter(client => {
//     const clientDate = new Date(client.createdAt);
//     return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
//   });

//   const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
//   const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
//   const lastMonthActiveClients = activeClients.filter(client => {
//     const clientDate = new Date(client.createdAt);
//     return clientDate.getMonth() === lastMonth && clientDate.getFullYear() === lastMonthYear;
//   });

//   const monthlyGrowthRate = lastMonthActiveClients.length > 0
//     ? (((thisMonthActiveClients.length - lastMonthActiveClients.length) / lastMonthActiveClients.length) * 100).toFixed(1)
//     : "0";

//   // Generate monthly active clients data for the past 6 months
//   const getLast6MonthsData = () => {
//     const data = [];
//     for (let i = 5; i >= 0; i--) {
//       const date = new Date();
//       date.setMonth(date.getMonth() - i);
//       const monthClients = activeClients.filter(client => {
//         const clientDate = new Date(client.createdAt);
//         return clientDate.getMonth() === date.getMonth() && 
//                clientDate.getFullYear() === date.getFullYear();
//       });
//       data.push({
//         name: date.toLocaleString('default', { month: 'short' }),
//         value: monthClients.length,
//         total: clients.filter(client => {
//           const clientDate = new Date(client.createdAt);
//           return clientDate.getMonth() === date.getMonth() && 
//                  clientDate.getFullYear() === date.getFullYear();
//         }).length
//       });
//     }
//     return data;
//   };

//   // Categorize tasks and calculate completion rate
//   const ongoingTasks = [];
//   let completedCount = 0;
//   let cancelledCount = 0;

//   Object.values(totalTask)
//     .flat()
//     .forEach((task) => {
//       const statuses = [
//         task?.visaStatus,
//         task?.jobStatus,
//         task?.translationStatus,
//         task?.status,
//         task?.applicationStatus,
//       ];

//       if (statuses.includes("Completed")) {
//         completedCount++;
//       } else if (statuses.includes("Cancelled")) {
//         cancelledCount++;
//       } else {
//         ongoingTasks.push(task);
//       }
//     });

//   const totalTaskCount = ongoingTasks.length + completedCount + cancelledCount;
//   const taskCompletionRate = totalTaskCount > 0
//     ? ((completedCount / totalTaskCount) * 100).toFixed(1)
//     : "0";

//   // Generate appointments data by day of week
//   const getAppointmentsByDay = () => {
//     const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//     const appointmentCounts = new Array(7).fill(0);
    
//     appointments.forEach(appointment => {
//       const date = new Date(appointment.date);
//       appointmentCounts[date.getDay()]++;
//     });

//     return daysOfWeek.map((day, index) => ({
//       name: day,
//       value: appointmentCounts[index],
//       average: Math.round(appointments.length / 7)
//     }));
//   };

//   // Enhanced service request data with trends
//   const getServiceRequestData = () => {
//     const last14Days = Array.from({ length: 14 }, (_, i) => {
//       const date = new Date();
//       date.setDate(date.getDate() - (13 - i));
//       return date.toISOString().split('T')[0];
//     });

//     const timelineData = last14Days.map(date => {
//       const dayRequests = serviceRequested.filter(req => 
//         new Date(req.createdAt).toISOString().split('T')[0] === date
//       );

//       const total = dayRequests.length;
//       const completed = dayRequests.filter(r => r.status === 'completed').length;
//       const pending = dayRequests.filter(r => r.status === 'pending').length;
//       const inProgress = dayRequests.filter(r => r.status === 'in-progress').length;

//       return {
//         name: new Date(date).toLocaleDateString('default', { weekday: 'short' }),
//         total,
//         completed,
//         pending,
//         inProgress,
//       };
//     });

//     const currentPending = serviceRequested.filter(r => r.status === 'pending').length;
//     const currentInProgress = serviceRequested.filter(r => r.status === 'in-progress').length;
//     const currentCompleted = serviceRequested.filter(r => r.status === 'completed').length;

//     const completionRate = serviceRequested.length > 0
//       ? ((currentCompleted / serviceRequested.length) * 100).toFixed(1)
//       : "0";

//     return {
//       timelineData,
//       stats: {
//         pending: currentPending,
//         inProgress: currentInProgress,
//         completed: currentCompleted,
//         completionRate
//       }
//     };
//   };

//   // Chart data
//   const clientChartData = getLast6MonthsData();
//   const taskStatusData = [
//     { name: 'Active', value: ongoingTasks.length },
//     { name: 'Completed', value: completedCount },
//     { name: 'Cancelled', value: cancelledCount }
//   ];
//   const appointmentChartData = getAppointmentsByDay();
//   const serviceRequestData = getServiceRequestData();

//   if (loading) {
//     return (
//       <div className="space-y-4 sm:space-y-6">
//         <SkeletonWelcome />
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
//           {[1, 2, 3, 4].map((i) => (
//             <SkeletonStatsCard key={i} />
//           ))}
//         </div>
//         <SkeletonSection />
//         <SkeletonSection />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* Welcome Section */}
//       <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
//      <div>
//   <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
//     Welcome back, {superAdminName.name}! <span className="inline-block animate-wave">👋</span>
//   </h1>
//   <p className="mt-1 text-sm sm:text-base text-gray-500">
//     Here's what's happening today
//   </p>
// </div>
//           <div className="text-left sm:text-right">
//             <p className="text-xs sm:text-sm text-gray-500">Today's Date</p>
//             <p className="text-base sm:text-lg font-semibold">
//               {new Date().toLocaleDateString("en-US", {
//                 weekday: "long",
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
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
//           trendValue={`${monthlyGrowthRate}%`}
//           chartType="area"
//           chartData={clientChartData}
//           bgColor="#fcda00"
//           subStats={[
//             {
//               label: "This Month",
//               value: thisMonthActiveClients.length,
//               status: "active"
//             },
//             {
//               label: "Total Clients",
//               value: totalClients,
//               status: "total"
//             }
//           ]}
//         />

//         <StatsCard
//           label="Tasks Overview"
//           value={ongoingTasks.length}
//           icon={Clock}
//           trend="up"
//           trendValue={`${taskCompletionRate}%`}
//           chartType="pie"
//           chartData={taskStatusData}
//           bgColor="bg-green-50"
//           subStats={[
//             { 
//               label: "Completed", 
//               value: completedCount,
//               status: "completed"
//             },
//             { 
//               label: "Cancelled", 
//               value: cancelledCount,
//               status: "cancelled"
//             }
//           ]}
//         />

//         <StatsCard
//           label="Upcoming Appointments"
//           value={appointments.length}
//           icon={Calendar}
//           trend="up"
//           trendValue={`${((appointments.length / 7) * 100).toFixed(1)}%`}
//           chartType="bar"
//           chartData={appointmentChartData}
//           bgColor="#FCDA00"
//           subStats={[
//             {
//               label: "Daily Average",
//               value: Math.round(appointments.length / 7),
//               status: "active"
//             },
//             {
//               label: "This Week",
//               value: appointments.length,
//               status: "total"
//             }
//           ]}
//         />

//         <StatsCard
//           label="Service Requests"
//           value={serviceRequested.length}
//           icon={FileText}
//           trend="up"
//           trendValue={`${serviceRequestData.stats.completionRate}%`}
//           chartType="graph"
//           chartData={serviceRequestData.timelineData}
//           bgColor="bg-orange-50"
//           subStats={[
//             {
//               label: "Pending",
//               value: serviceRequestData.stats.pending,
//               status: "pending"
//             },
//             {
//               label: "In Progress",
//               value: serviceRequestData.stats.inProgress,
//               status: "in-progress"
//             }
//           ]}
//         />
//       </div>

//       {/* Ongoing Tasks Section */}
//       <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//         <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
//           Ongoing Tasks
//         </h2>
//         <OngoingTasks />
//       </div>

//       {/* Service Requests Section */}
//       <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
//         <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
//           Recent Service Requests
//         </h2>
//         <ServiceRequestsList itemsPerPage={2} />
//       </div>
//     </div>
//   );
// }








// // point to be fixed LATER⚠️ : 

// // in first card show this month client data lenght on createdAt if and client is less then show the red color with down icon and increase then show the grow icon with green color text with % incrase and in card no. three upcoming apointment use chart color #fcda00 and make sure even  appontment is only three then atleat show 4 chart 






// DashboardHome.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users as UsersIcon,
  FileText,
  Calendar,
  Clock,
  Bell,
  Languages,
} from "lucide-react";
import StatsCard from "../reports/components/StatsCard";
import OngoingTasks from "../reports/components/OngoingTasks";
import ServiceRequestsList from "./components/ServiceRequestsList";
import { useAuthGlobally } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { SkeletonSection, SkeletonStatsCard, SkeletonWelcome } from "../../components/skeletonEffect/DashboardHomeSkeleton";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [auth] = useAuthGlobally();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [totalTask, setTotalTask] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [serviceRequested, setServiceRequested] = useState([]);
  const [superAdminName, setSuperAdminName] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, tasksRes, appointmentsRes, servicesRes, adminRes] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getSuperAdmin/${auth.user.id}`),
          ]);

        setClients(clientsRes.data.clients || []);
        setTotalTask(tasksRes.data.allData || []);
        setAppointments(appointmentsRes.data.appointments || []);
        setServiceRequested(servicesRes.data.data || []);

        if (adminRes.data.success) {
          setSuperAdminName(adminRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response) {
          toast.error(error.response.data.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.user.id]);

  // Get active clients and this month's active clients
  const activeClients = clients.filter((c) => c?.status === "active");
  const totalClients = clients.length;

  // Get this month's active clients and growth rate
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthActiveClients = activeClients.filter(client => {
    const clientDate = new Date(client.createdAt);
    return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
  });

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthActiveClients = activeClients.filter(client => {
    const clientDate = new Date(client.createdAt);
    return clientDate.getMonth() === lastMonth && clientDate.getFullYear() === lastMonthYear;
  });

  const monthlyGrowthRateValue = lastMonthActiveClients.length > 0
    ? (((thisMonthActiveClients.length - lastMonthActiveClients.length) / lastMonthActiveClients.length) * 100).toFixed(1)
    : thisMonthActiveClients.length > 0 ? "100" : "0";
  const monthlyGrowthRate = Math.abs(monthlyGrowthRateValue);
  const clientTrend = parseFloat(monthlyGrowthRateValue) >= 0 ? "up" : "down";

  // Generate monthly active clients data for the past 6 months
  const getLast6MonthsData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthClients = activeClients.filter(client => {
        const clientDate = new Date(client.createdAt);
        return clientDate.getMonth() === date.getMonth() && 
               clientDate.getFullYear() === date.getFullYear();
      });
      data.push({
        name: date.toLocaleString('default', { month: 'short' }),
        value: monthClients.length,
        total: clients.filter(client => {
          const clientDate = new Date(client.createdAt);
          return clientDate.getMonth() === date.getMonth() && 
                 clientDate.getFullYear() === date.getFullYear();
        }).length
      });
    }
    return data;
  };

  // Categorize tasks and calculate completion rate
  const ongoingTasks = [];
  let completedCount = 0;
  let cancelledCount = 0;

  Object.values(totalTask)
    .flat()
    .forEach((task) => {
      const statuses = [
        task?.visaStatus,
        task?.jobStatus,
        task?.translationStatus,
        task?.status,
        task?.applicationStatus,
      ];

      if (statuses.includes("Completed")) {
        completedCount++;
      } else if (statuses.includes("Cancelled")) {
        cancelledCount++;
      } else {
        ongoingTasks.push(task);
      }
    });

  const totalTaskCount = ongoingTasks.length + completedCount + cancelledCount;
  const taskCompletionRate = totalTaskCount > 0
    ? ((completedCount / totalTaskCount) * 100).toFixed(1)
    : "0";

  // Modified to ensure minimum 4 bars
  const getAppointmentsByDay = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const appointmentCounts = new Array(7).fill(0);
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.date);
      appointmentCounts[date.getDay()]++;
    });

    let result = daysOfWeek.map((day, index) => ({
      name: day,
      value: appointmentCounts[index],
      average: Math.round(appointments.length / 7)
    }));

    // Ensure at least 4 bars are shown
    const daysWithData = result.filter(d => d.value > 0).length;
    if (daysWithData === 0) {
      // If no appointments, show first 4 days
      result = result.slice(0, 4);
    } else if (daysWithData < 4) {
      // If less than 4 days have data, ensure 4 bars total
      const neededBars = 4 - daysWithData;
      const availableZeroDays = result.filter(d => d.value === 0);
      result = [
        ...result.filter(d => d.value > 0),
        ...availableZeroDays.slice(0, neededBars)
      ];
    } else {
      // If 4 or more days have data, show all days with data
      result = result.filter(d => d.value > 0);
    }

    return result;
  };

  // Enhanced service request data with trends
  const getServiceRequestData = () => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });

    const timelineData = last14Days.map(date => {
      const dayRequests = serviceRequested.filter(req => 
        new Date(req.createdAt).toISOString().split('T')[0] === date
      );

      const total = dayRequests.length;
      const completed = dayRequests.filter(r => r.status === 'completed').length;
      const pending = dayRequests.filter(r => r.status === 'pending').length;
      const inProgress = dayRequests.filter(r => r.status === 'in-progress').length;

      return {
        name: new Date(date).toLocaleDateString('default', { weekday: 'short' }),
        total,
        completed,
        pending,
        inProgress,
      };
    });

    const currentPending = serviceRequested.filter(r => r.status === 'pending').length;
    const currentInProgress = serviceRequested.filter(r => r.status === 'in-progress').length;
    const currentCompleted = serviceRequested.filter(r => r.status === 'completed').length;

    const completionRate = serviceRequested.length > 0
      ? ((currentCompleted / serviceRequested.length) * 100).toFixed(1)
      : "0";

    return {
      timelineData,
      stats: {
        pending: currentPending,
        inProgress: currentInProgress,
        completed: currentCompleted,
        completionRate
      }
    };
  };

  // Chart data
  const clientChartData = getLast6MonthsData();
  const taskStatusData = [
    { name: 'Active', value: ongoingTasks.length },
    { name: 'Completed', value: completedCount },
    { name: 'Cancelled', value: cancelledCount }
  ];
  const appointmentChartData = getAppointmentsByDay();
  const serviceRequestData = getServiceRequestData();

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SkeletonWelcome />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
        <SkeletonSection />
        <SkeletonSection />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {superAdminName.name}! <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">
              Here's what's happening today
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-500">Today's Date</p>
            <p className="text-base sm:text-lg font-semibold">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          label="Active Clients"
          value={activeClients.length}
          icon={UsersIcon}
          trend={clientTrend}
          trendValue={`${monthlyGrowthRate}%`}
          chartType="area"
          chartData={clientChartData}
          bgColor="#fcda00"
          subStats={[
            {
              label: "This Month",
              value: thisMonthActiveClients.length,
              status: "active"
            },
            {
              label: "Total Clients",
              value: totalClients,
              status: "total"
            }
          ]}
        />

        <StatsCard
          label="Tasks Overview"
          value={ongoingTasks.length}
          icon={Clock}
          trend="up"
          trendValue={`${taskCompletionRate}%`}
          chartType="pie"
          chartData={taskStatusData}
          bgColor="bg-green-50"
          subStats={[
            { 
              label: "Completed", 
              value: completedCount,
              status: "completed"
            },
            { 
              label: "Cancelled", 
              value: cancelledCount,
              status: "cancelled"
            }
          ]}
        />

        <StatsCard
          label="Upcoming Appointments"
          value={appointments.length}
          icon={Calendar}
          trend="up"
          trendValue={`${((appointments.length / 7) * 100).toFixed(1)}%`}
          chartType="bar"
          chartData={appointmentChartData}
          bgColor="#FCDA00"
          chartColor="#FCDA00"
          subStats={[
            {
              label: "Daily Average",
              value: Math.round(appointments.length / 7),
              status: "active"
            },
            {
              label: "This Week",
              value: appointments.length,
              status: "total"
            }
          ]}
        />

        <StatsCard
          label="Service Requests"
          value={serviceRequested.length}
          icon={FileText}
          trend="up"
          trendValue={`${serviceRequestData.stats.completionRate}%`}
          chartType="graph"
          chartData={serviceRequestData.timelineData}
          bgColor="bg-orange-50"
          subStats={[
            {
              label: "Pending",
              value: serviceRequestData.stats.pending,
              status: "pending"
            },
            {
              label: "In Progress",
              value: serviceRequestData.stats.inProgress,
              status: "in-progress"
            }
          ]}
        />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Ongoing Tasks
        </h2>
        <OngoingTasks />
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Recent Service Requests
        </h2>
        <ServiceRequestsList itemsPerPage={2} />
      </div>
    </div>
  );
}
