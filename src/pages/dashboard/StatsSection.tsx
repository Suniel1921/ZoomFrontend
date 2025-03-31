
// components/dashboard/StatsSection.tsx
import React from 'react';
import StatsCard from '../reports/components/StatsCard';
import { Users as UsersIcon, FileText, Calendar, Clock } from 'lucide-react';

interface StatsSectionProps {
  activeClients: any[];
  totalClients: number;
  clientChartData: any[];
  clientTrend: string;
  monthlyGrowthRate: number;
  thisMonthActiveClients: any[];
  ongoingTasks: { tasks: TaskWithModel[]; completedCount: number; cancelledCount: number };
  taskStatusData: any[];
  taskCompletionRate: string;
  appointments: any[];
  appointmentChartData: any[];
  serviceRequested: any[];
  serviceRequestData: ServiceRequestData;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  activeClients,
  totalClients,
  clientChartData,
  clientTrend,
  monthlyGrowthRate,
  thisMonthActiveClients,
  ongoingTasks,
  taskStatusData,
  taskCompletionRate,
  appointments,
  appointmentChartData,
  serviceRequested,
  serviceRequestData
}) => (
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
      aria-label="Active Clients Statistics"
    />
    <StatsCard
      label="Tasks Overview"
      value={ongoingTasks.tasks.length}
      icon={Clock}
      trend="up"
      trendValue={`${taskCompletionRate}%`}
      chartType="pie"
      chartData={taskStatusData}
      bgColor="bg-green-50"
      subStats={[
        { label: "Completed", value: ongoingTasks.completedCount, status: "completed" },
        { label: "Cancelled", value: ongoingTasks.cancelledCount, status: "cancelled" },
      ]}
      aria-label="Tasks Overview Statistics"
    />
    <StatsCard
      label="Appointments"
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
      aria-label="Appointments Statistics"
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
      aria-label="Service Requests Statistics"
    />
  </div>
);
