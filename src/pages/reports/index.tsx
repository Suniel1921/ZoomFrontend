
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  FileText, 
  Clock,
  Bell 
} from 'lucide-react';
import StatsCard from './components/StatsCard';
import OngoingTasks from './components/OngoingTasks';
import WorkloadDistribution from './components/WorkloadDistribution';
import SalesReport from './components/SalesReport';
import ServiceRequestsList from './components/ServiceRequestsList';

export default function ReportsPage() {
  const navigate = useNavigate();

  // Sample data to replace `useStore` logic
  const sampleClients = [
    { id: 1, status: 'active' },
    { id: 2, status: 'inactive' },
    { id: 3, status: 'active' },
  ];
  const sampleTasks = {
    applications: [
      { id: 1, visaStatus: 'Pending' },
      { id: 2, visaStatus: 'Completed' },
    ],
    translations: [
      { id: 1, translationStatus: 'In Progress' },
      { id: 2, translationStatus: 'Completed' },
    ],
    otherServices: [
      { id: 1, jobStatus: 'In Progress' },
    ],
  };
  const sampleServiceRequests = [
    { id: 1, status: 'pending' },
    { id: 2, status: 'completed' },
  ];

  // Filter out completed tasks
  const activeTasks = {
    applications: sampleTasks.applications.filter(app => !['Completed', 'Approved'].includes(app.visaStatus)),
    translations: sampleTasks.translations.filter(t => !['Completed', 'Delivered'].includes(t.translationStatus)),
    otherServices: sampleTasks.otherServices.filter(service => service.jobStatus !== 'Completed')
  };

  // Calculate total revenue (mock example)
  const totalRevenue = 50000; // Placeholder value

  // Calculate revenue trend
  const lastMonthRevenue = totalRevenue * 0.88; // Example calculation
  const revenueGrowth = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  // Calculate active clients percentage
  const activeClients = sampleClients.filter(c => c.status === 'active');
  const lastMonthActiveClients = Math.floor(activeClients.length * 0.95); // Example calculation
  const clientGrowth = ((activeClients.length - lastMonthActiveClients) / lastMonthActiveClients) * 100;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          label="Active Clients"
          value={activeClients.length}
          icon={UsersIcon}
          trend="up"
          trendValue={`${clientGrowth.toFixed(1)}% this month`}
        />
        <StatsCard
          label="Total Tasks"
          value={Object.values(activeTasks).reduce((sum, tasks) => sum + tasks.length, 0)}
          icon={FileText}
        />
        <StatsCard
          label="Completed Tasks"
          value={Object.values(sampleTasks).reduce((sum, tasks) => 
            sum + tasks.filter(task => 
              task.visaStatus === 'Completed' || 
              task.translationStatus === 'Completed' || 
              task.jobStatus === 'Completed'
            ).length, 0
          )}
          icon={Clock}
        />
        <StatsCard
          label="Total Revenue"
          value={`\u00a5${totalRevenue.toLocaleString()}`}
          icon={Bell}
          trend="up"
          trendValue={`${revenueGrowth.toFixed(1)}% this month`}
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
      <SalesReport tasks={activeTasks} />

      {/* Service Requests */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Recent Service Requests</h2>
        <ServiceRequestsList itemsPerPage={2} requests={sampleServiceRequests} />
      </div>
    </div>
  );
}
