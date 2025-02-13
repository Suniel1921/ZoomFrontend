// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Timeline } from 'antd';
// import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
// import { useAuthGlobally } from '../../context/AuthContext';
// import { format, isValid } from 'date-fns';


// const ClientOngoingTask = () => {
//   const [clientTasks, setClientTasks] = useState<any>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [expandedTask, setExpandedTask] = useState<string | null>(null);
//   const [error, setError] = useState<string>('');
//   const [auth] = useAuthGlobally();

//   // Mapping of model names to display names
//   const modelNameMapping = {
//     japanvisitapplicationmodel: 'Japan Visit', // Updated mapping
//     epassportmodel: 'E-Passport', // Updated mapping
//     otherservicemodel: 'Other Services', // Updated mapping
//     applicationmodel: 'Visa Application',
//     documenttranslationmodel: 'Document Translation',
//     graphicdesignmodel: 'Graphic Design',
//   };

//   // Fetch data for ongoing tasks when the component mounts
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`);
//         // console.log(response);
//         setClientTasks(response.data.allData);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch data');
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [auth.user.id]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   // Render status icons based on task status
//   const renderStatus = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return { color: 'green', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
//       case 'processing':
//         return { color: 'yellow', icon: <Clock className="h-5 w-5 text-yellow-500" /> };
//       case 'inprocess':
//         return { color: 'blue', icon: <Clock className="h-5 w-5 text-blue-500" /> };
//       default:
//         return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
//     }
//   };

//   // Render step timelines for each task
//   const renderStepTimeline = (steps) => {
//     return steps.map((step, index) => {
//       const status = step.status || 'pending';
//       const { color, icon } = renderStatus(status);

//       const updatedAt = step.updatedAt ? new Date(step.updatedAt) : null;
//       const formattedUpdatedAt = updatedAt && isValid(updatedAt) ? format(updatedAt, 'MMM d, yyyy h:mm a') : null;

//       return (
//         <Timeline.Item key={index} color={color} dot={icon}>
//           <div className="flex items-center justify-between">
//             <div>
//               <h3>{step.name}</h3>
//               <p className="text-xs text-gray-400">Updated: {formattedUpdatedAt}</p>
//             </div>
//           </div>
//         </Timeline.Item>
//       );
//     });
//   };

//   // Check if all steps in a task are completed
//   const isTaskCompleted = (steps) => {
//     return steps.every((step) => step.status === 'completed');
//   };

//   // Render individual tasks, including Japan Visit Application
//   const renderTasks = (task: any, modelName: string) => {
//     const deadline = task.deadline ? new Date(task.deadline) : null;
//     const formattedDeadline = deadline && isValid(deadline) ? format(deadline, 'MMM d, yyyy') : 'No Deadline';

//     // Determine task status dynamically based on model type
//     const taskStatus =
//       task.status || // Default 'status' field for most models
//       task.visaStatus || // Specific for visa models
//       task.applicationStatus || // For applications
//       task.translationStatus ||
//       task.jobStatus ||
//       'Unknown'; // Fallback status

//     // Determine task type dynamically using the mapping
//     const taskType = modelNameMapping[modelName.toLowerCase()] || modelName;

//     // Include country name if available
//     const taskDisplayName = task.country
//       ? `${taskType} - ${task.country}` // Append country name
//       : taskType; // Fallback to task type only

//     return (
//       <div key={task._id} className="bg-white rounded-lg overflow-hidden mb-5">
//         <div
//           className="p-4 cursor-pointer hover:bg-white"
//           onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
//         >
//           <div className="flex justify-between items-start">
//             <div>
//               <h4 className="font-medium">{taskDisplayName}</h4> {/* Use taskDisplayName here */}
//               <p className="text-sm text-gray-500">Deadline: {formattedDeadline}</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   taskStatus === 'Completed'
//                     ? 'bg-green-100 text-green-700'
//                     : taskStatus === 'In Progress'
//                     ? 'bg-blue-100 text-blue-700'
//                     : 'bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 {taskStatus}
//               </span>
//               {expandedTask === task._id ? (
//                 <ChevronUp className="h-5 w-5 text-gray-400" />
//               ) : (
//                 <ChevronDown className="h-5 w-5 text-gray-400" />
//               )}
//             </div>
//           </div>
//         </div>
//         {expandedTask === task._id && (
//           <Timeline className="ml-4">{renderStepTimeline(task.steps || [])}</Timeline>
//         )}
//       </div>
//     );
//   };

//   // Render all tasks dynamically
//   const renderAllTasks = () => {
//     const ongoingTasks = [];
//     const completedTasks = [];

//     Object.keys(clientTasks).forEach((modelName) => {
//       const data = clientTasks[modelName];
//       if (data && data.length > 0) {
//         data.forEach((task) => {
//           if (isTaskCompleted(task.steps || [])) {
//             completedTasks.push({ task, modelName }); // Completed task
//           } else {
//             ongoingTasks.push({ task, modelName }); // Ongoing task
//           }
//         });
//       }
//     });

//     return (
//       <div className="space-y-4">
//         <div>
//           {ongoingTasks.length > 0 ? (
//             ongoingTasks.map(({ task, modelName }) => renderTasks(task, modelName))
//           ) : (
//             <div>No ongoing tasks available</div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return <div>{renderAllTasks()}</div>;
// };

// export default ClientOngoingTask; 














// ************use polling for auto udpate the status on client side***********

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Timeline } from 'antd';
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthGlobally } from '../../context/AuthContext';
import { format, isValid } from 'date-fns';

const ClientOngoingTask = () => {
  const [clientTasks, setClientTasks] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [auth] = useAuthGlobally();

  const modelNameMapping = {
    japanvisitapplicationmodel: 'Japan Visit',
    epassportmodel: 'E-Passport',
    otherservicemodel: 'Other Services',
    applicationmodel: 'Visa Application',
    documenttranslationmodel: 'Document Translation',
    graphicdesignmodel: 'Graphic Design',
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`);
      setClientTasks(response.data.allData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10 seconds
    return () => clearInterval(interval);
  }, [auth.user.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const renderStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'green', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
      case 'processing':
        return { color: 'yellow', icon: <Clock className="h-5 w-5 text-yellow-500" /> };
      case 'inprocess':
        return { color: 'blue', icon: <Clock className="h-5 w-5 text-blue-500" /> };
      default:
        return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
    }
  };

  const renderStepTimeline = (steps) => {
    return steps.map((step, index) => {
      const status = step.status || 'pending';
      const { color, icon } = renderStatus(status);

      const updatedAt = step.updatedAt ? new Date(step.updatedAt) : null;
      const formattedUpdatedAt = updatedAt && isValid(updatedAt) ? format(updatedAt, 'MMM d, yyyy h:mm a') : null;

      return (
        <Timeline.Item key={index} color={color} dot={icon}>
          <div className="flex items-center justify-between">
            <div>
              <h3>{step.name}</h3>
              <p className="text-xs text-gray-400">Updated: {formattedUpdatedAt}</p>
            </div>
          </div>
        </Timeline.Item>
      );
    });
  };

  const isTaskCompleted = (steps) => {
    return steps.every((step) => step.status === 'completed');
  };

  const renderTasks = (task: any, modelName: string) => {
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const formattedDeadline = deadline && isValid(deadline) ? format(deadline, 'MMM d, yyyy') : 'No Deadline';

    const taskStatus =
      task.status || task.visaStatus || task.applicationStatus || task.translationStatus || task.jobStatus || 'Unknown';

    const taskType = modelNameMapping[modelName.toLowerCase()] || modelName;
    const taskDisplayName = task.country ? `${taskType} - ${task.country}` : taskType;

    return (
      <div key={task._id} className="bg-white rounded-lg overflow-hidden mb-5">
        <div
          className="p-4 cursor-pointer hover:bg-white"
          onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{taskDisplayName}</h4>
              <p className="text-sm text-gray-500">Deadline: {formattedDeadline}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  taskStatus === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : taskStatus === 'In Progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {taskStatus}
              </span>
              {expandedTask === task._id ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
        {expandedTask === task._id && (
          <Timeline className="ml-4">{renderStepTimeline(task.steps || [])}</Timeline>
        )}
      </div>
    );
  };

  const renderAllTasks = () => {
    const ongoingTasks = [];
    const completedTasks = [];

    Object.keys(clientTasks).forEach((modelName) => {
      const data = clientTasks[modelName];
      if (data && data.length > 0) {
        data.forEach((task) => {
          if (isTaskCompleted(task.steps || [])) {
            completedTasks.push({ task, modelName });
          } else {
            ongoingTasks.push({ task, modelName });
          }
        });
      }
    });

    return (
      <div className="space-y-4">
        <div>
          {ongoingTasks.length > 0 ? (
            ongoingTasks.map(({ task, modelName }) => renderTasks(task, modelName))
          ) : (
            <div>No ongoing tasks available</div>
          )}
        </div>
      </div>
    );
  };

  return <div>{renderAllTasks()}</div>;
};

export default ClientOngoingTask;
