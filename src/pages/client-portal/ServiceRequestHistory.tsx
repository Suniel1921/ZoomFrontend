import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, X } from 'lucide-react';
import { useServiceRequestStore } from '../../store/serviceRequestStore';
import Button from '../../components/Button';
import type { Client } from '../../types';

interface ServiceRequestHistoryProps {
  client: Client;
}

const ITEMS_PER_PAGE = 2;

export default function ServiceRequestHistory({ client }: ServiceRequestHistoryProps) {
  const { getRequestsByClient, updateRequest } = useServiceRequestStore();
  const [currentPage, setCurrentPage] = useState(1);
  
  const requests = getRequestsByClient(client.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCancelRequest = (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      updateRequest(requestId, { status: 'cancelled' });
    }
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-6 w-6 text-gray-400" />
        <h2 className="text-xl font-semibold">Service Request History</h2>
      </div>

      <div className="space-y-4">
        {paginatedRequests.map((request) => (
          <div
            key={request.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{request.serviceName}</h3>
                <p className="text-sm text-gray-500">
                  Requested on: {format(new Date(request.requestedAt), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Message: {request.message}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'completed' ? 'bg-green-100 text-green-700' :
                  request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  request.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                {request.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRequest(request.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel Request
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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