// import { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import { Clock, X } from 'lucide-react';
// import Button from '../../components/Button';
// import type { Client } from '../../types';
// import { useAuthGlobally } from '../../context/AuthContext';
// import axios from 'axios';

// const ITEMS_PER_PAGE = 2;

// export default function ServiceRequestHistory({ client }: ServiceRequestHistoryProps) {
//   const [auth] = useAuthGlobally();

//   const [serviceRequests, setServiceRequests] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);

//   useEffect(() => {
//     const fetchServiceRequested = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getAllRequestedService`);
//         console.log(response)
//         setServiceRequests(response.data.data || []); // Store fetched service requests
//       } catch (error) {
//         console.error("Failed to fetch service requests:", error);
//         setServiceRequests([]);
//       }
//     };

//     if (auth?.user?.id) {
//       fetchServiceRequested();
//     }
//   }, [auth.user.id]);

//   const totalPages = Math.ceil(serviceRequests.length / ITEMS_PER_PAGE);
//   const paginatedRequests = serviceRequests.slice(
//     (currentPage - 1) * ITEMS_PER_PAGE,
//     currentPage * ITEMS_PER_PAGE
//   );

//   const handleCancelRequest = (requestId: string) => {
//     if (window.confirm('Are you sure you want to cancel this request?')) {
//       // Call API to update request status
//       fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/updateRequestedSerices/${auth.user.id}`, {
//         method: 'PATCH',
//         body: JSON.stringify({ status: 'cancelled' }),
//         headers: { 'Content-Type': 'application/json' },
//       }).then((res) => {
//         if (res.ok) {
//           setServiceRequests((prevRequests) =>
//             prevRequests.map((request) =>
//               request.id === requestId ? { ...request, status: 'cancelled' } : request
//             )
//           );
//         }
//       });
//     }
//   };

//   if (serviceRequests.length === 0) {
//     return null;
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-sm p-6">
//       <div className="flex items-center gap-2 mb-6">
//         <Clock className="h-6 w-6 text-gray-400" />
//         <h2 className="text-xl font-semibold">Service Request History</h2>
//       </div>

//       <div className="space-y-4">
//         {paginatedRequests.map((request) => (
//           <div
//             key={request.id}
//             className="bg-gray-50 rounded-lg p-4 border border-gray-200"
//           >
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="font-medium">{request.serviceName}</h3>
//                 <p className="text-sm text-gray-500">
//                   Requested on: {format(new Date(request.createdAt), 'MMM d, yyyy')}
//                 </p>
//                 <p className="text-sm text-gray-600 mt-2">
//                   Message: {request.message}
//                 </p>
//               </div>
//               <div className="flex flex-col items-end gap-2">
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                   request.status === 'completed' ? 'bg-green-100 text-green-700' :
//                   request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
//                   request.status === 'cancelled' ? 'bg-red-100 text-red-700' :
//                   'bg-yellow-100 text-yellow-700'
//                 }`}>
//                   {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
//                 </span>
//                 {request.status === 'pending' && (
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => handleCancelRequest(request.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <X className="h-4 w-4 mr-1" />
//                     Cancel Request
//                   </Button> 
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center gap-2 mt-6">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
//             <Button
//               key={pageNum}
//               variant={currentPage === pageNum ? 'primary' : 'outline'}
//               size="sm"
//               onClick={() => setCurrentPage(pageNum)}
//             >
//               {pageNum}
//             </Button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
//

















import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, X } from 'lucide-react';
import { Modal } from 'antd';
import Button from '../../components/Button';
import { useAuthGlobally } from '../../context/AuthContext';
import axios from 'axios';

const ITEMS_PER_PAGE = 2;

export default function ServiceRequestHistory({ client }: ServiceRequestHistoryProps) {
  const [auth] = useAuthGlobally();

  const [serviceRequests, setServiceRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    const fetchServiceRequested = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/getRequestedServiceByID/${auth.user.id}`
        );
        
        // Ensure the response is structured as an array
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data]; // Wrap in array if it's a single object
        setServiceRequests(data);
      } catch (error) {
        console.error("Failed to fetch service requests:", error);
        setServiceRequests([]); // Fallback to an empty array if there's an error
      }
    };
  
    if (auth?.user?.id) {
      fetchServiceRequested();
    }
  }, [auth.user.id]);
  

  const totalPages = Math.ceil(serviceRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = serviceRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCancelRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsModalVisible(true);
  };

  const confirmCancelRequest = async () => {
    if (!selectedRequestId) {
      console.error("No request ID selected.");
      return;
    }

    try {
      // Correct API endpoint and method (ensure the patch works correctly)
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/serviceRequest/updateRequestedSerices/${selectedRequestId}`, 
        { status: 'cancelled' }, // Payload for updating request
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log('Response from API:', response);

      // Handle API response accordingly
      if (response.data.success) {
        // Update status locally for the UI
        setServiceRequests((prevRequests) =>
          prevRequests.map((request) =>
            request._id === selectedRequestId ? { ...request, status: 'cancelled' } : request
          )
        );
        setIsModalVisible(false); // Close the modal after cancellation
      } else {
        console.error("Failed to cancel request:", response.data.message);
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  if (serviceRequests.length === 0) {
    return <div>No service requests found.</div>;
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
            key={request._id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{request.serviceName}</h3>
                <p className="text-sm text-gray-500">
                  Requested on: {format(new Date(request.createdAt), 'MMM d, yyyy')}
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
                    onClick={() => handleCancelRequest(request._id)}
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

      {/* Cancel Modal */}
      <Modal
        title="Cancel Service Request"
        open={isModalVisible}
        onOk={confirmCancelRequest}
        onCancel={() => setIsModalVisible(false)}
      >
        <div className="text-center">
          <p>Ohh! Looks like you want to cancel the requested services.</p>
          <p>Are you sure you want to proceed?</p>
        </div>
      </Modal>
    </div>
  );
}
