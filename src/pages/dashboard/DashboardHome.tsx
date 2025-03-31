import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGlobally } from "../../context/AuthContext";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { SkeletonSection, SkeletonStatsCard, SkeletonWelcome } from "../../components/skeletonEffect/DashboardHomeSkeleton";
import OngoingTasks from "../reports/components/OngoingTasks";
import ServiceRequestsList from "./components/ServiceRequestsList";
import { WelcomeSection } from "./WelcomeSection";
import { StatsSection } from "./StatsSection";
import { NotificationManager } from "../../components/notification/NotificationManage";
import RecentActivity from "./RecentActivity"; 
import { History } from "lucide-react";

interface TaskAlert {
  taskId: string;
  taskModel: string;
  message: string;
  priority?: "high" | "urgent";
  clientName?: string;
  dueAmount?: number;
  handledBy: string;
  alertType: "deadline" | "payment";
}

interface TaskWithModel {
  _id: string;
  deadline?: string;
  handledBy?: string;
  clientId?: string | { _id: string; name: string };
  applicationStatus?: string;
  paymentStatus?: string;
  dueAmount?: number;
  amount?: number;
  applicationType?: string;
  taskModel?: string;
  [key: string]: any;
}

interface ServiceRequestStats {
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: string;
}

interface ServiceRequestData {
  timelineData: Array<{
    name: string;
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  }>;
  stats: ServiceRequestStats;
}

const ErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert" className="p-4 bg-red-100 border border-red-400 rounded">
    <h2 className="text-lg font-bold text-red-700">Something Went Wrong</h2>
    <pre className="mt-2 text-sm text-red-600">{error.message}</pre>
    <button
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Reload Page
    </button>
  </div>
);

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [auth] = useAuthGlobally();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [totalTask, setTotalTask] = useState<TaskWithModel[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [serviceRequested, setServiceRequested] = useState<any[]>([]);
  const [superAdminName, setSuperAdminName] = useState<any>({});
  const [deadlineAlerts, setDeadlineAlerts] = useState<TaskAlert[]>([]);
  const [paymentFollowUps, setPaymentFollowUps] = useState<TaskAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [notifications, setNotifications] = useState<TaskAlert[]>([]);
  const [notifiedKeys, setNotifiedKeys] = useState<Set<string>>(new Set());
  const [showRecentActivity, setShowRecentActivity] = useState(false); 

  const motivationalQuotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The only way to do great work is to love what you do.",
    "Every day is a new opportunity to change the world.",
    "Hard work beats talent when talent doesn’t work hard.",
    "Believe you can and you're halfway there.",
  ];

  const getDailyMotivation = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  }, []);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchClientName = useCallback(
    async (clientId: string | undefined): Promise<string> => {
      if (!clientId) {
        console.warn("Client ID is null or undefined, returning default client name.");
        return "Unknown Client";
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient/${clientId}`
        );
        return response.data.client?.name || "Unknown Client";
      } catch (error) {
        console.error(`Error fetching client ${clientId}:`, (error as AxiosError).message);
        return "Unknown Client";
      }
    },
    []
  );

  const processTaskAlerts = useCallback(
    async (tasks: any[], clients: any[]) => {
      const currentDate = new Date();
      const uniqueAlerts = new Map<string, TaskAlert>();

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
            array.map((task: any) => ({
              ...task,
              taskModel: task.applicationType || model,
            }))
          )
        );
      }, [] as TaskWithModel[]);

      for (const task of allTasks) {
        const deadline = task.deadline ? new Date(task.deadline) : null;
        const daysRemaining = deadline
          ? Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
          : Infinity;
        const handledBy = task.handledBy || "Unknown";
        let clientName = "Unknown Client";

        if (task.clientId && typeof task.clientId === "object" && task.clientId.name) {
          clientName = task.clientId.name;
        } else {
          const client = clients.find((c) => c._id === task.clientId);
          clientName = client ? client.name : await fetchClientName(task.clientId);
        }

        const taskModel = task.applicationType || task.taskModel || "Unknown Model";
        const dueAmount = task.dueAmount || 0;
        const isTaskCompleted =
          task.applicationStatus === "Completed" ||
          task.translationStatus === "Completed" ||
          task.visaStatus === "Completed" ||
          task.status === "Completed" ||
          task.jobStatus === "Completed";
        const isPaymentCompleted = task.paymentStatus === "Paid";

        if (deadline && daysRemaining < 0 && isTaskCompleted && isPaymentCompleted) {
          continue;
        }

        if (deadline && daysRemaining <= 2 && daysRemaining >= 0) {
          const alertKey = `${task._id}-deadline`;
          if (!uniqueAlerts.has(alertKey)) {
            uniqueAlerts.set(alertKey, {
              taskId: task._id,
              taskModel,
              message: `${clientName}'s ${taskModel} has ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining. Prioritize now!`,
              priority: "high",
              handledBy,
              clientName,
              dueAmount,
              alertType: "deadline",
            });
          }
        } else if (deadline && daysRemaining < 0 && !(isTaskCompleted && isPaymentCompleted)) {
          const alertKey = `${task._id}-deadline`;
          if (!uniqueAlerts.has(alertKey)) {
            uniqueAlerts.set(alertKey, {
              taskId: task._id,
              taskModel,
              message: `${clientName}'s ${taskModel} deadline has passed by ${Math.abs(
                daysRemaining
              )} day${Math.abs(daysRemaining) === 1 ? "" : "s"}. Immediate action required!`,
              priority: "urgent",
              handledBy,
              clientName,
              dueAmount,
              alertType: "deadline",
            });
          }
        }

        const isPaymentPending = task.paymentStatus === "Due";
        const isTaskNotCompleted =
          !isTaskCompleted && task.applicationStatus !== "Cancelled";

        if (isTaskCompleted && isPaymentPending) {
          const alertKey = `${task._id}-payment`;
          if (!uniqueAlerts.has(alertKey)) {
            uniqueAlerts.set(alertKey, {
              taskId: task._id,
              taskModel,
              message: `Task for ${clientName}'s ${taskModel} is completed, but payment is still pending (¥${dueAmount} due). Follow up with the client.`,
              clientName,
              dueAmount,
              handledBy,
              alertType: "payment",
            });
          }
        }

        if (isPaymentCompleted && isTaskNotCompleted) {
          const alertKey = `${task._id}-payment`;
          if (!uniqueAlerts.has(alertKey)) {
            uniqueAlerts.set(alertKey, {
              taskId: task._id,
              taskModel,
              message: `Payment for ${clientName}'s ${taskModel} is paid, but the task is not finished. Review the status.`,
              clientName,
              dueAmount: 0,
              handledBy,
              alertType: "payment",
            });
          }
        }
      }

      const filteredAlerts = Array.from(uniqueAlerts.values()).filter(
        (alert) => alert.handledBy === auth.user.fullName
      );
      const filteredDeadlineAlerts = filteredAlerts.filter((a) => a.alertType === "deadline");
      const filteredPaymentAlerts = filteredAlerts.filter((a) => a.alertType === "payment");

      setDeadlineAlerts(filteredDeadlineAlerts);
      setPaymentFollowUps(filteredPaymentAlerts);

      setNotifications(filteredAlerts);
    },
    [auth.user.fullName, fetchClientName]
  );

  const debouncedFetchData = useMemo(
    () =>
      debounce(async () => {
        try {
          setLoading(true);
          setError(null);
          const [clientsRes, tasksRes, appointmentsRes, servicesRes, adminRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllAppointment`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`),
            axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getSuperAdmin/${auth.user.id}`),
          ]);

          const clientsData = clientsRes.data.clients || [];
          setClients(clientsData);
          const tasks = tasksRes.data.allData || tasksRes.data || [];
          const normalizedTasks = Array.isArray(tasks) ? tasks : tasks ? [tasks] : [];
          setTotalTask(normalizedTasks);
          setAppointments(appointmentsRes.data.appointments || []);
          setServiceRequested(servicesRes.data.data || []);
          setSuperAdminName(adminRes.data.success ? adminRes.data.data : {});

          await processTaskAlerts(normalizedTasks, clientsData);
        } catch (error) {
          const err = error as AxiosError;
          console.error("Error fetching data:", err.message);
          setError(err.response?.data?.message || "Failed to fetch data");
          toast.error(err.response?.data?.message || "Failed to fetch data");
        } finally {
          setLoading(false);
        }
      }, 300),
    [auth.user.id, processTaskAlerts]
  );

  useEffect(() => {
    let mounted = true;
    debouncedFetchData();
    return () => {
      mounted = false;
    };
  }, [debouncedFetchData]);

  const handleNotificationDismiss = useCallback((taskId: string) => {
    setNotifications((prev) => prev.filter((n) => n.taskId !== taskId));
    setNotifiedKeys((prev) => {
      const newSet = new Set(prev);
      prev.forEach((key) => {
        if (key.startsWith(taskId)) newSet.delete(key);
      });
      return newSet;
    });
  }, []);

  const activeClients = useMemo(
    () => clients.filter((c) => c?.status === "active"),
    [clients]
  );
  const totalClients = clients.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthActiveClients = useMemo(
    () =>
      activeClients.filter((client) => {
        const clientDate = new Date(client.createdAt);
        return (
          clientDate.getMonth() === currentMonth &&
          clientDate.getFullYear() === currentYear
        );
      }),
    [activeClients, currentMonth, currentYear]
  );

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthActiveClients = useMemo(
    () =>
      activeClients.filter((client) => {
        const clientDate = new Date(client.createdAt);
        return (
          clientDate.getMonth() === lastMonth &&
          clientDate.getFullYear() === lastMonthYear
        );
      }),
    [activeClients, lastMonth, lastMonthYear]
  );

  const monthlyGrowthRateValue =
    lastMonthActiveClients.length > 0
      ? (((thisMonthActiveClients.length - lastMonthActiveClients.length) /
          lastMonthActiveClients.length) *
          100).toFixed(1)
      : thisMonthActiveClients.length > 0
      ? "100"
      : "0";
  const monthlyGrowthRate = Math.abs(Number(monthlyGrowthRateValue));
  const clientTrend = Number(monthlyGrowthRateValue) >= 0 ? "up" : "down";

  const getLast6MonthsData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthClients = activeClients.filter((client) => {
        const clientDate = new Date(client.createdAt);
        return (
          clientDate.getMonth() === date.getMonth() &&
          clientDate.getFullYear() === date.getFullYear()
        );
      });
      data.push({
        name: date.toLocaleString("default", { month: "short" }),
        value: monthClients.length,
        total: clients.filter((client) => {
          const clientDate = new Date(client.createdAt);
          return (
            clientDate.getMonth() === date.getMonth() &&
            clientDate.getFullYear() === date.getFullYear()
          );
        }).length,
      });
    }
    return data;
  }, [activeClients, clients]);

  const ongoingTasks = useMemo(() => {
    let completedCount = 0;
    let cancelledCount = 0;
    const tasks: TaskWithModel[] = totalTask.flat().reduce((acc, taskGroup) => {
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
          array.map((task: any) => ({
            ...task,
            taskModel: task.applicationType || model,
          }))
        )
      );
    }, [] as TaskWithModel[]);

    tasks.forEach((task) => {
      const statuses = [
        task?.visaStatus,
        task?.jobStatus,
        task?.translationStatus,
        task?.status,
        task?.applicationStatus,
      ].filter(Boolean);
      if (statuses.includes("Completed")) completedCount++;
      else if (statuses.includes("Cancelled")) cancelledCount++;
    });

    return {
      tasks,
      completedCount,
      cancelledCount,
    };
  }, [totalTask]);

  const totalTaskCount = ongoingTasks.tasks.length + ongoingTasks.completedCount + ongoingTasks.cancelledCount;
  const taskCompletionRate = totalTaskCount > 0
    ? ((ongoingTasks.completedCount / totalTaskCount) * 100).toFixed(1)
    : "0";

  const getAppointmentsByDay = useMemo(() => {
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
    if (daysWithData === 0) result = result.slice(0, 4);
    else if (daysWithData < 4) {
      const neededBars = 4 - daysWithData;
      const availableZeroDays = result.filter((d) => d.value === 0);
      result = [...result.filter((d) => d.value > 0), ...availableZeroDays.slice(0, neededBars)];
    } else result = result.filter((d) => d.value > 0);

    return result;
  }, [appointments]);

  const getServiceRequestData = useMemo((): ServiceRequestData => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split("T")[0];
    });

    const timelineData = last14Days.map((date) => {
      const dayRequests = serviceRequested.filter(
        (req) => new Date(req.createdAt).toISOString().split("T")[0] === date
      );
      return {
        name: new Date(date).toLocaleDateString("default", { weekday: "short" }),
        total: dayRequests.length,
        completed: dayRequests.filter((r) => r.status === "completed").length,
        pending: dayRequests.filter((r) => r.status === "pending").length,
        inProgress: dayRequests.filter((r) => r.status === "in-progress").length,
      };
    });

    const stats = {
      pending: serviceRequested.filter((r) => r.status === "pending").length,
      inProgress: serviceRequested.filter((r) => r.status === "in-progress").length,
      completed: serviceRequested.filter((r) => r.status === "completed").length,
    };

    const completionRate = serviceRequested.length > 0
      ? ((stats.completed / serviceRequested.length) * 100).toFixed(1)
      : "0";

    return { timelineData, stats: { ...stats, completionRate } };
  }, [serviceRequested]);

  const clientChartData = getLast6MonthsData;
  const taskStatusData = [
    { name: "Active", value: ongoingTasks.tasks.length },
    { name: "Completed", value: ongoingTasks.completedCount },
    { name: "Cancelled", value: ongoingTasks.cancelledCount },
  ];
  const appointmentChartData = getAppointmentsByDay;
  const serviceRequestData = getServiceRequestData;

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <SkeletonWelcome />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => <SkeletonStatsCard key={i} />)}
        </div>
        <SkeletonSection />
        <SkeletonSection />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 rounded p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => debouncedFetchData()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen relative">
      {/* Header with Admin Activity button in the right corner for superadmin */}
      <div className="flex justify-between items-center mb-4">
        <div></div> {/* Placeholder for left side alignment */}
        {auth.user.role === "superadmin" && (
          <button
            onClick={() => setShowRecentActivity(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            title="View Admin Activity"
          >
            <History className="h-6 w-6" />
            <span className="text-sm font-medium">Admin Activity</span>
          </button>
        )}
      </div>

      <WelcomeSection
        superAdminName={superAdminName}
        getDailyMotivation={getDailyMotivation}
        deadlineAlerts={deadlineAlerts}
        paymentFollowUps={paymentFollowUps}
        showAlerts={showAlerts}
        setShowAlerts={setShowAlerts}
      />

      <StatsSection
        activeClients={activeClients}
        totalClients={totalClients}
        clientChartData={clientChartData}
        clientTrend={clientTrend}
        monthlyGrowthRate={monthlyGrowthRate}
        thisMonthActiveClients={thisMonthActiveClients}
        ongoingTasks={ongoingTasks}
        taskStatusData={taskStatusData}
        taskCompletionRate={taskCompletionRate}
        appointments={appointments}
        appointmentChartData={appointmentChartData}
        serviceRequested={serviceRequested}
        serviceRequestData={serviceRequestData}
      />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4" id="ongoing-tasks">Ongoing Tasks</h2>
        <OngoingTasks tasks={ongoingTasks.tasks} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4" id="recent-service-requests">Recent Service Requests</h2>
        <ServiceRequestsList itemsPerPage={2} />
      </div>

      <NotificationManager
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
      />

      {/* Render the RecentActivity Modal only for superadmin */}
      {auth.user.role === "superadmin" && (
        <RecentActivity
          isOpen={showRecentActivity}
          onClose={() => setShowRecentActivity(false)}
        />
      )}
    </div>
  );
};

export default function DashboardHomeWithBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DashboardHome />
    </ErrorBoundary>
  );
}