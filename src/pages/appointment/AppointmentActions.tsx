// import { useState } from 'react';
// import { MoreVertical, Calendar, CheckCircle, XCircle } from 'lucide-react';
// import Button from '../../components/Button';
// import type { Appointment } from '../../types';

// interface AppointmentActionsProps {
//   appointment: Appointment;
//   onEdit?: () => void;
//   onReschedule?: () => void;
//   onStatusChange?: (appointment: Appointment, status: 'Completed' | 'Cancelled') => void;
//   showEdit?: boolean;
// }

// export default function AppointmentActions({ 
//   appointment, 
//   onEdit,
//   onReschedule,
//   onStatusChange,
//   showEdit = false,
// }: AppointmentActionsProps) {
//   const [showActions, setShowActions] = useState(false);

//   const handleComplete = () => {
//     if (onStatusChange && window.confirm('Mark this appointment as completed?')) {
//       onStatusChange(appointment, 'Completed');
//       setShowActions(false);
//     }
//   };

//   const handleCancel = () => {
//     if (onStatusChange && window.confirm('Are you sure you want to cancel this appointment?')) {
//       onStatusChange(appointment, 'Cancelled');
//       setShowActions(false);
//     }
//   };

//   const handleReschedule = () => {
//     if (onReschedule) {
//       onReschedule();
//       setShowActions(false);
//     }
//   };

//   const handleEdit = () => {
//     if (onEdit) {
//       onEdit();
//       setShowActions(false);
//     }
//   };

//   return (
//     <div className="relative">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => setShowActions(!showActions)}
//       >
//         <MoreVertical className="h-4 w-4" />
//       </Button>

//       {showActions && (
//         <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
//           <div className="py-1">
//             {appointment.status === 'Scheduled' && (
//               <>
//                 {onReschedule && (
//                   <button
//                     onClick={handleReschedule}
//                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
//                   >
//                     <Calendar className="h-4 w-4 mr-2" />
//                     Reschedule
//                   </button>
//                 )}
//                 {showEdit && onEdit && (
//                   <button
//                     onClick={handleEdit}
//                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
//                   >
//                     <Calendar className="h-4 w-4 mr-2" />
//                     Edit Details
//                   </button>
//                 )}
//                 {onStatusChange && (
//                   <>
//                     <button
//                       onClick={handleComplete}
//                       className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full"
//                     >
//                       <CheckCircle className="h-4 w-4 mr-2" />
//                       Mark as Completed
//                     </button>
//                     <button
//                       onClick={handleCancel}
//                       className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
//                     >
//                       <XCircle className="h-4 w-4 mr-2" />
//                       Cancel Appointment
//                     </button>
//                   </>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }















import { useState } from 'react';
import { MoreVertical, Calendar, CheckCircle, XCircle, Import } from 'lucide-react';
import Button from '../../components/Button';
import axios from 'axios'; // Make sure axios is imported
import type { Appointment } from '../../types';
import toast from 'react-hot-toast';

interface AppointmentActionsProps {
  appointment: Appointment;
  fetchAppointments: ()=> void;
  onEdit?: () => void;
  onReschedule?: () => void;
  onStatusChange?: (appointment: Appointment, status: 'Completed' | 'Cancelled') => void;
  showEdit?: boolean;
}

export default function AppointmentActions({ 
  appointment, 
  onEdit,
  onReschedule,
  fetchAppointments,
  onStatusChange,
  showEdit = false,
}: AppointmentActionsProps) {
  const [showActions, setShowActions] = useState(false);

  // Function to update status in backend when appointment is marked as completed
  const handleComplete = async () => {
    if (window.confirm('Mark this appointment as completed?')) {
      try {
        // Send a PUT request to update the appointment status to "Completed"
        const response = await axios.put(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateappointmentStatus/${appointment._id}/status`, {
          status: 'Completed',
        });
  
        if (response.data.success) {
          if (onStatusChange) onStatusChange(appointment, 'Completed');
          toast.success(response.data.message);
          setShowActions(false); // Hide the actions menu
          fetchAppointments();
          
        }
      } catch (error:any) {
        console.error('Error marking as completed:', error);
        if(error.response){
          toast.error(error.response.data.message);
        }
      }
    }
  };
  
  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Send a PUT request to update the appointment status to "Cancelled"
        const response = await axios.put(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateappointmentStatus/${appointment._id}/status`, {
          status: 'Cancelled',
        });
  
        if (response.data.success) {
          if (onStatusChange) onStatusChange(appointment, 'Cancelled');
          setShowActions(false); // Hide the actions menu
          toast.success(response.data.message);
          fetchAppointments();
        }
      } catch (error:any) {
        console.error('Error canceling appointment:', error);
        if(error.response){
          toast.error(error.response.data.message);
      }
    }
  }
  };
  

  // Reschedule handler
  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule();
      setShowActions(false);
    }
  };

  // Edit handler
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      setShowActions(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowActions(!showActions)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {showActions && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            {appointment.status === 'Scheduled' && (
              <>
                {onReschedule && (
                  <button
                    onClick={handleReschedule}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule
                  </button>
                )}
                {showEdit && onEdit && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Edit Details
                  </button>
                )}
                {onStatusChange && (
                  <>
                    <button
                      onClick={handleComplete}
                      className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
