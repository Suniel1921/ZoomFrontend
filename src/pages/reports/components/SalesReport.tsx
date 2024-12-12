import { useState } from 'react';
import { format, startOfDay, subDays, subMonths, subYears, isAfter, startOfYear } from 'date-fns';
import { safeParse } from '../../../utils/dateUtils';

interface SalesReportProps {
  tasks: {
    applications: any[];
    japanVisit: any[];
    translations: any[];
    designs: any[];
    epassport: any[];
    otherServices: any[];
  };
}

export default function SalesReport({ tasks }: SalesReportProps) {
  const [period, setPeriod] = useState('daily');

  // Ensure all task arrays exist with defaults
  const {
    applications = [],
    japanVisit = [],
    translations = [],
    designs = [],
    epassport = [],
    otherServices = []
  } = tasks;

  // Get date range based on selected period
  const getDateRange = () => {
    const end = startOfDay(new Date());
    let start = end;

    switch (period) {
      case 'daily':
        start = end;
        break;
      case 'weekly':
        start = subDays(end, 7);
        break;
      case 'monthly':
        start = subMonths(end, 1);
        break;
      case 'yearly':
        start = startOfYear(end);
        break;
      default:
        start = end;
    }

    return { start, end };
  };

  const dateRange = getDateRange();

  // Filter tasks by date range
  const filterTasksByDate = (tasks: any[], dateField: string) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      const taskDate = safeParse(task[dateField]);
      return taskDate && isAfter(taskDate, dateRange.start);
    });
  };

  // Calculate total sales and pending payments for each category
  const salesData = {
    applications: {
      total: filterTasksByDate(applications, 'submissionDate')
        .reduce((sum, app) => sum + (app.payment?.total || 0), 0),
      paid: filterTasksByDate(applications, 'submissionDate')
        .reduce((sum, app) => sum + (app.payment?.paidAmount || 0), 0),
      pending: filterTasksByDate(applications, 'submissionDate')
        .reduce((sum, app) => {
          const total = app.payment?.total || 0;
          const paid = app.payment?.paidAmount || 0;
          const discount = app.payment?.discount || 0;
          return sum + (total - paid - discount);
        }, 0),
    },
    japanVisit: {
      total: filterTasksByDate(japanVisit, 'date')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
      paid: filterTasksByDate(japanVisit, 'date')
        .filter(app => app.paymentStatus === 'Paid')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
      pending: filterTasksByDate(japanVisit, 'date')
        .filter(app => app.paymentStatus === 'Due')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
    },
    translations: {
      total: filterTasksByDate(translations, 'createdAt')
        .reduce((sum, trans) => sum + (trans.amount || 0), 0),
      paid: filterTasksByDate(translations, 'createdAt')
        .filter(trans => trans.paymentStatus === 'Paid')
        .reduce((sum, trans) => sum + (trans.amount || 0), 0),
      pending: filterTasksByDate(translations, 'createdAt')
        .filter(trans => trans.paymentStatus === 'Due')
        .reduce((sum, trans) => sum + (trans.amount || 0), 0),
    },
    designs: {
      total: filterTasksByDate(designs, 'createdAt')
        .reduce((sum, job) => sum + (job.amount || 0), 0),
      paid: filterTasksByDate(designs, 'createdAt')
        .filter(job => job.paymentStatus === 'Paid')
        .reduce((sum, job) => sum + (job.amount || 0), 0),
      pending: filterTasksByDate(designs, 'createdAt')
        .filter(job => job.paymentStatus === 'Due')
        .reduce((sum, job) => sum + (job.amount || 0), 0),
    },
    epassport: {
      total: filterTasksByDate(epassport, 'date')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
      paid: filterTasksByDate(epassport, 'date')
        .filter(app => app.paymentStatus === 'Paid')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
      pending: filterTasksByDate(epassport, 'date')
        .filter(app => app.paymentStatus === 'Due')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
    },
    otherServices: {
      total: filterTasksByDate(otherServices, 'createdAt')
        .reduce((sum, service) => sum + (service.amount || 0), 0),
      paid: filterTasksByDate(otherServices, 'createdAt')
        .filter(service => service.paymentStatus === 'Paid')
        .reduce((sum, service) => sum + (service.amount || 0), 0),
      pending: filterTasksByDate(otherServices, 'createdAt')
        .filter(service => service.paymentStatus === 'Due')
        .reduce((sum, service) => sum + (service.amount || 0), 0),
    },
  };

  // Calculate totals
  const totalSales = Object.values(salesData).reduce((sum, data) => sum + data.total, 0);
  const totalPaid = Object.values(salesData).reduce((sum, data) => sum + data.paid, 0);
  const totalPending = Object.values(salesData).reduce((sum, data) => sum + data.pending, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Sales Report</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow text-sm"
          >
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">This Year</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(salesData).map(([category, data]) => (
              <tr key={category} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    ¥{data.total.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-green-600">
                    ¥{data.paid.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-red-600">
                    ¥{data.pending.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ¥{totalSales.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                ¥{totalPaid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                ¥{totalPending.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}