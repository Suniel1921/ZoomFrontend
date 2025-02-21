import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users as UsersIcon, FileText, Clock, DollarSign } from "lucide-react";
import StatsCard from "./components/StatsCard";
import OngoingTasks from "./components/OngoingTasks";
import WorkloadDistribution from "./components/WorkloadDistribution";
import SalesReport from "./components/SalesReport";
import axios from "axios";

// Inline CSS for the Google-style three-dot spinner with custom size and colors
const spinnerStyles = `
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px; /* Adjusted gap for smaller dots */
    margin-top: 24px;
  }

  .dot {
    width: 6px; /* Decreased size */
    height: 6px; /* Decreased size */
    border-radius: 50%;
    animation: bounce 1.2s infinite ease-in-out;
  }

  .dot:nth-child(1),
  .dot:nth-child(3) {
    background-color: #000; /* Black for first and third dots */
  }

  .dot:nth-child(2) {
    background-color: #fedc00; /* Yellow for middle dot */
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px); /* Adjusted distance for smaller dots */
    }
  }
`;

export default function ReportsPage() {
  const navigate = useNavigate();
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [clients, setClients] = useState([]);
  const [totalTask, setTotalTask] = useState<any>({}); // Adjust type if you have a specific interface
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data and calculate lifetime earnings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch clients
        const clientsResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`
        );
        setClients(clientsResponse.data.clients || []);

        // Fetch all tasks (applications, translations, etc.)
        const tasksResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`
        );
        const allData = tasksResponse.data.allData || {};
        setTotalTask(allData);

        // Fetch appointments
        const appointmentsResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`
        );
        setAppointments(appointmentsResponse.data.appointments || []);

        // Calculate lifetime total earnings from all models
        const calculateLifetimeEarnings = () => {
          let total = 0;

          const applications = allData.application || [];
          applications.forEach((app) => {
            total += app.payment?.total || 0; // Use total field
          });

          const translations = allData.documentTranslation || [];
          translations.forEach((trans) => {
            total += trans.amount || 0;
          });

          const epassports = allData.epassports || [];
          epassports.forEach((ep) => {
            total += ep.amount || 0;
          });

          const designs = allData.graphicDesigns || [];
          designs.forEach((design) => {
            total += design.amount || 0;
          });

          const japanVisits = allData.japanVisit || [];
          japanVisits.forEach((jv) => {
            total += jv.amount || 0;
          });

          const otherServices = allData.otherServices || [];
          otherServices.forEach((service) => {
            total += service.amount || 0;
          });

          return total;
        };

        setTotalSalesAmount(calculateLifetimeEarnings());
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setClients([]);
        setTotalTask({});
        setAppointments([]);
        setTotalSalesAmount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate active clients percentage change
  const activeClients = clients.filter((c) => c?.status === "active");
  const totalClients = clients.length;
  const activeClientsPercentage =
    totalClients > 0 ? ((activeClients.length / totalClients) * 100).toFixed(1) : "0";

  // Calculate total ongoing tasks
  const totalTasksLength = Object.values(totalTask).reduce(
    (sum, taskArray) => sum + (taskArray?.length || 0),
    0
  );

  // Filter out ongoing tasks
  const activeTasks = {
    applications:
      totalTask.application?.filter((app) => !["Completed", "Approved"].includes(app.visaStatus)) || [],
    translations:
      totalTask.documentTranslation?.filter((t) =>
        !["Completed", "Delivered"].includes(t.translationStatus)
      ) || [],
    otherServices:
      totalTask.otherServices?.filter((service) => service.jobStatus !== "Completed") || [],
  };

  // Google-style three-dot spinner JSX
  const ThreeDotSpinner = () => (
    <div className="spinner-container">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Inject spinner styles */}
      <style>{spinnerStyles}</style>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          label="Active Clients"
          value={loading ? <ThreeDotSpinner /> : activeClients.length}
          icon={UsersIcon}
          trend="up"
          trendValue={`${activeClientsPercentage}% of total`}
        />
        <StatsCard
          label="Ongoing Tasks"
          value={loading ? <ThreeDotSpinner /> : totalTasksLength}
          icon={Clock}
        />
        <StatsCard
          label="Upcoming Appointments"
          value={loading ? <ThreeDotSpinner /> : appointments.length}
          icon={FileText}
        />
        <StatsCard
          label="Lifetime Total Earnings"
          value={loading ? <ThreeDotSpinner /> : `¥${totalSalesAmount.toLocaleString()}`}
          icon={DollarSign}
          className="text-green-600"
        />
      </div>

      {/* Tasks Overview and Workload Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Tasks Overview</h2>
          <OngoingTasks tasks={activeTasks} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Workload Distribution</h2>
          <WorkloadDistribution tasks={activeTasks} handlers={[]} />
        </div>
      </div>

      {/* Sales Report */}
      <SalesReport onTotalSalesUpdate={() => {}} />
    </div>
  );
}