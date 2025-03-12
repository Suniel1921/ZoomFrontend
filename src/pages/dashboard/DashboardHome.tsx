import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users as UsersIcon,
  FileText,
  Calendar,
  Clock,
  Sun,
  Sunset,
  Moon,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import StatsCard from "../reports/components/StatsCard";
import OngoingTasks from "../reports/components/OngoingTasks";
import ServiceRequestsList from "./components/ServiceRequestsList";
import { useAuthGlobally } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { SkeletonSection, SkeletonStatsCard, SkeletonWelcome } from "../../components/skeletonEffect/DashboardHomeSkeleton";
import TaskAlerts from "../../components/notification/TaskAlerts";

interface TaskAlert {
  taskId: string;
  taskModel: string;
  message: string;
  priority?: "high" | "urgent";
  clientName?: string;
  dueAmount?: number;
  handledBy: string;
}

interface TaskWithModel extends Record<string, any> {
  _id: string;
  deadline: string;
  handledBy?: string;
  clientId?: string | { _id: string; name: string };
  applicationStatus?: string;
  paymentStatus?: string;
  dueAmount?: number;
  applicationType?: string;
  taskModel: string;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [auth] = useAuthGlobally();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [totalTask, setTotalTask] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [serviceRequested, setServiceRequested] = useState<any[]>([]);
  const [superAdminName, setSuperAdminName] = useState<any>({});
  const [deadlineAlerts, setDeadlineAlerts] = useState<TaskAlert[]>([]);
  const [paymentFollowUps, setPaymentFollowUps] = useState<TaskAlert[]>([]);

  const motivationalQuotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The only way to do great work is to love what you do.",
    "Every day is a new opportunity to change the world.",
    "Hard work beats talent when talent doesn’t work hard.",
    "Believe you can and you're halfway there.",
  ];

  const getDailyMotivation = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  };

  const fetchClientName = async (clientId: string): Promise<string> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient/${clientId}`);
      console.log(`Fetched client for ${clientId}:`, response.data);
      return response.data.client?.name || "Unknown Client";
    } catch (error) {
      console.error(`Error fetching client ${clientId}:`, error.response?.data || error.message);
      return "Unknown Client";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, tasksRes, appointmentsRes, servicesRes, adminRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`),
          axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`),
          axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`),
          axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`),
          axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getSuperAdmin/${auth.user.id}`),
        ]);

        console.log("Clients Response:", clientsRes.data);
        const clientsData = clientsRes.data.clients || [];
        setClients(clientsData);
        console.log("Clients Array:", clientsData);
        const tasks = tasksRes.data.allData || tasksRes.data || [];
        const normalizedTasks = Array.isArray(tasks) ? tasks : tasks ? [tasks] : [];
        console.log("Normalized Tasks:", normalizedTasks);
        setTotalTask(normalizedTasks);
        setAppointments(appointmentsRes.data.appointments || []);
        setServiceRequested(servicesRes.data.data || []);

        if (adminRes.data.success) {
          setSuperAdminName(adminRes.data.data);
        }

        console.log("Auth User:", auth.user);
        await processTaskAlerts(normalizedTasks, clientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.user.id]);

  const processTaskAlerts = async (tasks: any[], clients: any[]) => {
    const currentDate = new Date(); // March 11, 2025
    const deadlineAlerts: TaskAlert[] = [];
    const paymentAlerts: TaskAlert[] = [];

    if (!Array.isArray(tasks)) {
      console.error("Tasks is not an array:", tasks);
      return;
    }

    const allTasks: TaskWithModel[] = tasks.reduce((acc, taskGroup) => {
      const taskArrays = [
        { array: taskGroup.application || [], model: "Application" },
        { array: taskGroup.epassports || [], model: "ePassport" },
        { array: taskGroup.documentTranslation || [], model: "Document Translation" },
        { array: taskGroup.japanVisit || [], model: "Japan Visit" },
        { array: taskGroup.otherServices || [], model: "Other Service" },
        { array: taskGroup.graphicDesigns || [], model: "Graphic Design" },
      ];
      return acc.concat(
        ...taskArrays.map(({ array, model }) =>
          array.map((task: any) => ({ ...task, taskModel: model }))
        )
      );
    }, []);

    console.log("Flattened Tasks with Models:", allTasks);

    for (const task of allTasks) {
      console.log("Processing Task:", task);
      const deadline = new Date(task.deadline);
      const daysRemaining = Math.ceil((deadline - currentDate) / (1000 * 60 * 60 * 24));
      const handledBy = task.handledBy || "Unknown";
      let clientName = "Unknown Client";

      if (task.clientId && typeof task.clientId === "object" && task.clientId.name) {
        clientName = task.clientId.name;
        console.log(`Client name from task.clientId: ${clientName}`);
      } else {
        const client = clients.find((c) => c._id === task.clientId);
        if (client) {
          clientName = client.name;
          console.log(`Client name from clients array: ${clientName}`);
        } else if (task.clientId) {
          console.warn(`No client found in array for clientId: ${task.clientId}, Task ID: ${task._id}. Fetching via API...`);
          clientName = await fetchClientName(task.clientId);
        }
      }

      const taskModel = task.applicationType || task.taskModel;

      // Deadline Alerts
      if (daysRemaining <= 2 && daysRemaining >= 0) {
        const alert = {
          taskId: task._id,
          taskModel,
          message: `${clientName}'s ${taskModel} has ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining. Prioritize now!`,
          priority: "high" as const,
          handledBy,
        };
        deadlineAlerts.push(alert);
        console.log("Added Deadline Alert:", alert);
      } else if (daysRemaining < 0) {
        const alert = {
          taskId: task._id,
          taskModel,
          message: `${clientName}'s ${taskModel} deadline has passed by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"}. Immediate action required!`,
          priority: "urgent" as const,
          handledBy,
        };
        deadlineAlerts.push(alert);
        console.log("Added Deadline Alert:", alert);
      }

      // Payment Follow-ups 


      const isTaskCompleted = task.applicationStatus || task.translationStatus || task.visaStatus || task.status || task.jobStatus === "Completed";
      const isPaymentPending = task.paymentStatus === "Due";
      const isPaymentCompleted = task.paymentStatus === "Paid";
      const isTaskNotCompleted = task.applicationStatus || task.translationStatus || task.visaStatus || task.status || task.jobStatus !== "Completed" && task.applicationStatus !== "Cancelled";

      // Case 1: Task completed, payment still due
      if (isTaskCompleted && isPaymentPending) {
        const alert = {
          taskId: task._id,
          taskModel,
          message: `Task for ${clientName}'s ${taskModel} is completed, but payment is still pending (¥${task.dueAmount || task.amount} due). Follow up with the client.`,
          clientName,
          dueAmount: task.dueAmount || 0,
          handledBy,
        };
        paymentAlerts.push(alert);
        console.log("Added Payment Alert (Task Completed, Payment Due):", alert);
      }

      // Case 2: Payment completed, task not completed
      if (isPaymentCompleted && isTaskNotCompleted) {
        const alert = {
          taskId: task._id,
          taskModel,
          message: `Payment for ${clientName}'s ${taskModel} is paid, but the task is not finished. Review the status.`,
          clientName,
          dueAmount: 0,
          handledBy,
        };
        paymentAlerts.push(alert);
        console.log("Added Payment Alert (Payment Completed, Task Not Completed):", alert);
      }
    }

    console.log("All Deadline Alerts Before Filter:", deadlineAlerts);
    console.log("All Payment Alerts Before Filter:", paymentAlerts);

    // Filter by handledBy (re-enabled, adjust if needed)
    const filteredDeadlineAlerts = deadlineAlerts.filter((alert) => alert.handledBy === auth.user.fullName);
    const filteredPaymentAlerts = paymentAlerts.filter((alert) => alert.handledBy === auth.user.fullName);

    console.log("Filtered Deadline Alerts:", filteredDeadlineAlerts);
    console.log("Filtered Payment Alerts:", filteredPaymentAlerts);

    setDeadlineAlerts(filteredDeadlineAlerts);
    setPaymentFollowUps(filteredPaymentAlerts);
  };

  const activeClients = clients.filter((c) => c?.status === "active");
  const totalClients = clients.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear(); // Fixed typo and added semicolon
  const thisMonthActiveClients = activeClients.filter((client) => {
    const clientDate = new Date(client.createdAt);
    return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
  });

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthActiveClients = activeClients.filter((client) => {
    const clientDate = new Date(client.createdAt);
    return clientDate.getMonth() === lastMonth && clientDate.getFullYear() === lastMonthYear;
  });

  const monthlyGrowthRateValue =
    lastMonthActiveClients.length > 0
      ? (((thisMonthActiveClients.length - lastMonthActiveClients.length) / lastMonthActiveClients.length) * 100).toFixed(1)
      : thisMonthActiveClients.length > 0
      ? "100"
      : "0";
  const monthlyGrowthRate = Math.abs(monthlyGrowthRateValue);
  const clientTrend = parseFloat(monthlyGrowthRateValue) >= 0 ? "up" : "down";

  const getLast6MonthsData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthClients = activeClients.filter((client) => {
        const clientDate = new Date(client.createdAt);
        return clientDate.getMonth() === date.getMonth() && clientDate.getFullYear() === date.getFullYear();
      });
      data.push({
        name: date.toLocaleString("default", { month: "short" }),
        value: monthClients.length,
        total: clients.filter((client) => {
          const clientDate = new Date(client.createdAt);
          return clientDate.getMonth() === date.getMonth() && clientDate.getFullYear() === date.getFullYear();
        }).length,
      });
    }
    return data;
  };

  const ongoingTasks: TaskWithModel[] = [];
  let completedCount = 0;
  let cancelledCount = 0;

  Object.values(totalTask)
    .flat()
    .forEach((taskGroup) => {
      const taskArrays = [
        { array: taskGroup.application || [], model: "Application" },
        { array: taskGroup.epassports || [], model: "ePassport" },
        { array: taskGroup.documentTranslation || [], model: "Document Translation" },
        { array: taskGroup.japanVisit || [], model: "Japan Visit" },
        { array: taskGroup.otherServices || [], model: "Other Service" },
        { array: taskGroup.graphicDesigns || [], model: "Graphic Design" },
      ];
      const allTasks = taskArrays.flatMap(({ array, model }) =>
        array.map((task: any) => ({ ...task, taskModel: model }))
      );
      allTasks.forEach((task) => {
        const statuses = [task?.visaStatus, task?.jobStatus, task?.translationStatus, task?.status, task?.applicationStatus];
        if (statuses.includes("Completed")) {
          completedCount++;
        } else if (statuses.includes("Cancelled")) {
          cancelledCount++;
        } else {
          ongoingTasks.push(task);
        }
      });
    });

  const totalTaskCount = ongoingTasks.length + completedCount + cancelledCount;
  const taskCompletionRate = totalTaskCount > 0 ? ((completedCount / totalTaskCount) * 100).toFixed(1) : "0";

  const getAppointmentsByDay = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const appointmentCounts = new Array(7).fill(0);

    appointments.forEach((appointment) => {
      const date = new Date(appointment.date);
      appointmentCounts[date.getDay()]++;
    });

    let result = daysOfWeek.map((day, index) => ({
      name: day,
      value: appointmentCounts[index],
      average: Math.round(appointments.length / 7),
    }));

    const daysWithData = result.filter((d) => d.value > 0).length;
    if (daysWithData === 0) {
      result = result.slice(0, 4);
    } else if (daysWithData < 4) {
      const neededBars = 4 - daysWithData;
      const availableZeroDays = result.filter((d) => d.value === 0);
      result = [...result.filter((d) => d.value > 0), ...availableZeroDays.slice(0, neededBars)];
    } else {
      result = result.filter((d) => d.value > 0);
    }

    return result;
  };

  const getServiceRequestData = () => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split("T")[0];
    });

    const timelineData = last14Days.map((date) => {
      const dayRequests = serviceRequested.filter(
        (req) => new Date(req.createdAt).toISOString().split("T")[0] === date
      );
      const total = dayRequests.length;
      const completed = dayRequests.filter((r) => r.status === "completed").length;
      const pending = dayRequests.filter((r) => r.status === "pending").length;
      const inProgress = dayRequests.filter((r) => r.status === "in-progress").length;

      return { name: new Date(date).toLocaleDateString("default", { weekday: "short" }), total, completed, pending, inProgress };
    });

    const currentPending = serviceRequested.filter((r) => r.status === "pending").length;
    const currentInProgress = serviceRequested.filter((r) => r.status === "in-progress").length;
    const currentCompleted = serviceRequested.filter((r) => r.status === "completed").length;

    const completionRate = serviceRequested.length > 0 ? ((currentCompleted / serviceRequested.length) * 100).toFixed(1) : "0";

    return { timelineData, stats: { pending: currentPending, inProgress: currentInProgress, completed: currentCompleted, completionRate } };
  };

  const clientChartData = getLast6MonthsData();
  const taskStatusData = [
    { name: "Active", value: ongoingTasks.length },
    { name: "Completed", value: completedCount },
    { name: "Cancelled", value: cancelledCount },
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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {(() => {
              const currentHour = new Date().getHours();
              let greeting = "";
              let IconComponent = null;

              if (currentHour < 12) {
                greeting = "Good Morning";
                IconComponent = Sun;
              } else if (currentHour < 17) {
                greeting = "Good Afternoon";
                IconComponent = Sunset;
              } else {
                greeting = "Good Evening";
                IconComponent = Moon;
              }

              return (
                <h1 className="text-2xl font-bold text-gray-900">
                  {greeting}, <span className="inline-block">{<IconComponent className="w-6 h-6 inline-block" />}</span>{" "}
                  {superAdminName.name || "User"}! <span className="inline-block animate-wave">👋</span>
                </h1>
              );
            })()}
            <p className="mt-1 text-base text-gray-500">Here's what's happening today</p>
            <p className="mt-1 text-base text-gray-600 italic">"{getDailyMotivation()}"</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
            { label: "This Month", value: thisMonthActiveClients.length, status: "active" },
            { label: "Total Clients", value: totalClients, status: "total" },
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
            { label: "Completed", value: completedCount, status: "completed" },
            { label: "Cancelled", value: cancelledCount, status: "cancelled" },
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
            { label: "Daily Average", value: Math.round(appointments.length / 7), status: "active" },
            { label: "This Week", value: appointments.length, status: "total" },
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
            { label: "Pending", value: serviceRequestData.stats.pending, status: "pending" },
            { label: "In Progress", value: serviceRequestData.stats.inProgress, status: "in-progress" },
          ]}
        />
      </div>

      {(deadlineAlerts.length > 0 || paymentFollowUps.length > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" /> Task Alerts
          </h2>
          <TaskAlerts deadlineAlerts={deadlineAlerts} paymentFollowUps={paymentFollowUps} />
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Ongoing Tasks</h2>
        <OngoingTasks />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Recent Service Requests</h2>
        <ServiceRequestsList itemsPerPage={2} />
      </div>
    </div>
  );
}

