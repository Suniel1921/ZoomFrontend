import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { safeParse } from '../../../utils/dateUtils';
import Button from '../../../components/Button';
import axios from 'axios';

interface TasksProps {
  tasks: {
    application: any[];
    appointment: any[];
    documentTranslation : any[];
    epassports: any[];
    graphicDesigns: any[];
    japanVisit: any[];
    otherServices: any[];
  };
}

const ITEMS_PER_PAGE = 10;

export default function OngoingTasks() {
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'due'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasks, setTasks] = useState<TasksProps['tasks'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`);
        console.log('API Response:', response.data); // Log the entire response
        if (response.data.success && response.data.allData) {
          setTasks(response.data.allData); // Set tasks to the allData property
        } else {
          setError('No task data available');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);  // Empty dependency array ensures this runs once when the component mounts

  // Ensure all task arrays exist with defaults
  const {
    application = [],
    appointment = [],
    documentTranslation = [],
    epassports = [],
    graphicDesigns = [],
    japanVisit = [],
    otherServices = [],
  } = tasks || {};  // Default to empty arrays if tasks is null

  // Combine all tasks into one array
  const allTasks = [
    ...application.map(task => ({
      ...task,
      type: 'Visa Application',
      status: task.visaStatus,
      amount: task.payment?.total || 0,
      paymentStatus: task.payment?.paidAmount >= task.payment?.total ? 'Paid' : 'Due'
    })),
    ...appointment.map(task => ({
      ...task,
      type: 'Appointment',
      status: task.status,
      amount: task.amount || 0,
      paymentStatus: task.paymentStatus || 'Due'
    })),
    ...epassports.map(task => ({
      ...task,
      type: 'ePassport',
      status: task.applicationStatus,
      amount: task.amount || 0,
      paymentStatus: task.paymentStatus || 'Due'
    })),
    ...graphicDesigns.map(task => ({
      ...task,
      type: 'Design',
      status: task.status,
      amount: task.amount || 0,
      paymentStatus: task.paymentStatus || 'Due'
    })),
    ...documentTranslation.map(task => ({
      ...task,
      type: 'DocumentTranslation',
      status: task.status || task?.translationStatus,
      amount: task.amount || 0,
      paymentStatus: task.paymentStatus || 'Due'
    })),
    ...japanVisit.map(task => ({
      ...task,
      type: 'Japan Visit',
      status: task.status,
      amount: task.amount || 0,
      paymentStatus: task.paymentStatus || 'Due'
    })),
    ...otherServices.map(task => ({
      ...task,
      type: 'Other Service',
      status: task.jobStatus,
      amount: task.amount || 0,
      paymentStatus: task.paymentStatus || 'Due'
    }))
  ].filter(task => {
    // Apply payment filter
    const matchesPaymentFilter = paymentFilter === 'all' || 
                                 task.paymentStatus.toLowerCase() === paymentFilter;
    return matchesPaymentFilter;
  }).sort((a, b) => {
    const dateA = safeParse(a.deadline);
    const dateB = safeParse(b.deadline);
    return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
  });

  // Calculate pagination
  const totalPages = Math.ceil(allTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTasks = allTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Payment Status:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'paid' | 'due')}
            className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow text-sm"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid Only</option>
            <option value="due">Due Only</option>
          </select>
        </div>
      </div>

      {paginatedTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks found matching the selected filter
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTasks.map((task, index) => {
                const dueDate = safeParse(task.deadline);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.clientName || task?.clientId?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-brand-yellow/10 text-brand-black">
                        {task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{task.handledBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dueDate ? format(dueDate, 'MMM d, yyyy') : 'No date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ¥{task.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'Completed' || task.status === 'Delivered' || task.status === 'Approved' 
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="py-2 px-4 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}




