import { useState, useEffect } from 'react'; 
import { format, isValid } from 'date-fns';  // Import isValid to check the date
import axios from 'axios'; // Import axios to make HTTP requests
import { useServiceRequestStore } from '../../../store/serviceRequestStore'; 
import Button from '../../../components/Button'; 

interface ServiceRequestsListProps {
  itemsPerPage?: number;
}

export default function ServiceRequestsList({ itemsPerPage = 2 }: ServiceRequestsListProps) {
  const { requests, updateRequest } = useServiceRequestStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceRequested, setServiceRequested] = useState([]); // New state for storing service requests

  // Fetch service requests from the API
  const fetchServiceRequested = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`);
      setServiceRequested(response.data.data || []); // Store fetched service requests in the state
    } catch (error) {
      console.error("Failed to fetch service requests:", error);
      setServiceRequested([]); // Fallback to an empty array in case of error
    }
  };

  useEffect(() => {
    fetchServiceRequested(); // Call the function to fetch data when the component mounts
  }, []);

  // Filter the requests based on the status
  const filteredRequests = serviceRequested
    .filter(req => statusFilter === 'all' || req.status === statusFilter)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  // Paginate the requests
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = (requestId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    updateRequest(requestId, { status: newStatus });
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Dropdown */}
      <div className="flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setCurrentPage(1); // Reset to first page when filter changes
          }}
          className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Displaying Requests */}
      {paginatedRequests.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No service requests found.</p>
      ) : (
        <div className="space-y-4">
          {paginatedRequests.map((request) => {
            // Safely parse and format the date
            const requestDate = new Date(request.requestedAt);
            const formattedDate = isValid(requestDate) ? format(requestDate, 'MMM d, yyyy h:mm a') : 'Invalid Date';

            return (
              <div
                key={request.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{request.serviceName}</h3>
                    <p className="text-sm text-gray-500">Requested by: {request.clientName}</p>
                    <p className="text-sm text-gray-500">Phone: {request.phoneNumber}</p>
                    {request.message && (
                      <p className="text-sm text-gray-600 mt-2">Message: {request.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Requested on: {formattedDate} {/* Display formatted date */}
                    </p>
                  </div>
                  {/* <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'completed' ? 'bg-green-100 text-green-700' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      request.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    {request.status !== 'completed' && request.status !== 'cancelled' && (
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value as any)}
                        className="text-sm rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                      >
                        <option value="pending">Mark as Pending</option>
                        <option value="in_progress">Mark as In Progress</option>
                        <option value="completed">Mark as Completed</option>
                        <option value="cancelled">Mark as Cancelled</option>
                      </select>
                    )}
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
