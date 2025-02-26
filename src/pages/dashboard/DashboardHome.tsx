import { useEffect, useState } from "react";
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
            axios.get(
              `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`
            ),
            axios.get(
              `${
                import.meta.env.VITE_REACT_APP_URL
              }/api/v1/appointment/fetchAllModelData`
            ),
            axios.get(
              `${
                import.meta.env.VITE_REACT_APP_URL
              }/api/v1/appointment/getAllAppointment`
            ),
            axios.get(
              `${
                import.meta.env.VITE_REACT_APP_URL
              }/api/v1/serviceRequest/getAllRequestedService`
            ),
            axios.get(
              `${
                import.meta.env.VITE_REACT_APP_URL
              }/api/v1/superAdmin/getSuperAdmin/${auth.user.id}`
            ),
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

  const activeClients = clients.filter((c) => c?.status === "active");
  const totalClients = clients.length;
  const activeClientsPercentage =
    totalClients > 0
      ? ((activeClients.length / totalClients) * 100).toFixed(1)
      : "0";

  // Categorize tasks
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



  // Chart data definitions
  const clientChartData = [
    { name: 'Jan', value: activeClients.length },
    { name: 'Feb', value: activeClients.length + 2 },
    { name: 'Mar', value: activeClients.length + 4 },
    { name: 'Apr', value: activeClients.length + 1 },
    { name: 'May', value: activeClients.length + 3 }
  ];

  const taskStatusData = [
    { name: 'Active', value: ongoingTasks.length },
    { name: 'Completed', value: completedCount },
    { name: 'Cancelled', value: cancelledCount }
  ];

  const appointmentChartData = [
    { name: 'Mon', value: appointments.length },
    { name: 'Tue', value: appointments.length + 2 },
    { name: 'Wed', value: appointments.length + 4 },
    { name: 'Thu', value: appointments.length + 1 },
    { name: 'Fri', value: appointments.length + 3 }
  ];

  const serviceRequestChartData = [
    { name: 'Pending', value: serviceRequested.filter(s => s.status === 'pending').length },
    { name: 'In Progress', value: serviceRequested.filter(s => s.status === 'in-progress').length },
    { name: 'Completed', value: serviceRequested.filter(s => s.status === 'completed').length }
  ];


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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          label="Active Clients"
          value={activeClients.length}
          icon={UsersIcon}
          trend="up"
          trendValue={`${activeClientsPercentage}%`}
          chartType="area"
          chartData={clientChartData}
          bgColor="bg-blue-50"
        />

        <StatsCard
          label="Ongoing Tasks"
          value={ongoingTasks.length}
          icon={Clock}
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
          trendValue="12%"
          chartType="bar"
          chartData={appointmentChartData}
          bgColor="bg-purple-50"
        />

        <StatsCard
          label="Service Requests"
          value={serviceRequested.length}
          icon={FileText}
          trend="up"
          trendValue="8%"
          chartType="line"
          chartData={serviceRequestChartData}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Ongoing Tasks Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Ongoing Tasks
        </h2>
        <OngoingTasks />
      </div>

      {/* Service Requests Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          Recent Service Requests
        </h2>
        <ServiceRequestsList itemsPerPage={2} />
      </div>
    </div>
  );
}




