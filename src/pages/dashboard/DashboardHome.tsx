// use a graph for better UI in four card like active client ongoing Upcoming Appointments, service request and make sure in ongoing task use light bg color with growht icon in compted and in cancaled use light red bg color with down icon and make sure dont created another card for compoted and cannceed use in ongoing task and if possible then imnmprove more skeleton effect 
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

// Skeleton components
const SkeletonWelcome = () => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-36"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

const SkeletonStatsCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-3 w-full">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const SkeletonSection = () => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
          trendValue={`${activeClientsPercentage}% of total`}
        />
        <StatsCard
          label="Ongoing Tasks"
          value={ongoingTasks.length}
          icon={Clock}
          subStats={[
            { label: "Completed", value: completedCount },
            { label: "Cancelled", value: cancelledCount },
          ]}
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



