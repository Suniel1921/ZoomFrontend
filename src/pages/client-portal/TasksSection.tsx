// import { useState } from 'react';
// import { format } from 'date-fns';
// import { Clock, DollarSign, Users, ChevronDown, ChevronUp } from 'lucide-react';
// import { useStore } from '../../store';
// import { useTaskManagementStore } from '../../store/taskManagementStore';
// import type { Application } from '../../types';

// interface TasksSectionProps {
//   applications: Application[];
//   clientId: string;
// }

// export default function TasksSection({ applications, clientId }: TasksSectionProps) {
//   const [activeTab, setActiveTab] = useState('active');
//   const [expandedTask, setExpandedTask] = useState<string | null>(null);
//   const { 
//     japanVisitApplications, 
//     translations, 
//     graphicDesignJobs, 
//     epassportApplications,
//     otherServices 
//   } = useStore();

//   const { getClientProcesses, getTemplateById } = useTaskManagementStore();
//   const clientProcesses = getClientProcesses(clientId);

//   // Get all tasks for this client with proper type mapping
//   const clientTasks = {
//     applications: applications.filter(app => app.clientId === clientId).map(app => ({
//       ...app,
//       processType: 'us_visa',
//       displayType: `${app.type} - ${app.country}`,
//       status: app.visaStatus,
//       deadline: app.deadline
//     })),
//     japanVisit: japanVisitApplications.filter(app => app.clientId === clientId).map(app => ({
//       ...app,
//       processType: 'japan_visa',
//       displayType: 'Japan Visit Application',
//       status: app.applicationStatus,
//       deadline: app.deadline
//     })),
//     translations: translations.filter(t => t.clientId === clientId).map(t => ({
//       ...t,
//       processType: 'translation',
//       displayType: `Translation: ${t.sourceLanguage} → ${t.targetLanguage}`,
//       status: t.translationStatus,
//       deadline: t.deadline
//     })),
//     designs: graphicDesignJobs.filter(job => job.clientId === clientId).map(job => ({
//       ...job,
//       processType: 'design',
//       displayType: `Design: ${job.designType}`,
//       status: job.status,
//       deadline: job.deadline
//     })),
//     epassport: epassportApplications.filter(app => app.clientId === clientId).map(app => ({
//       ...app,
//       processType: 'epassport',
//       displayType: `ePassport: ${app.applicationType}`,
//       status: app.applicationStatus,
//       deadline: app.deadline
//     })),
//     otherServices: otherServices.filter(service => service.clientId === clientId).map(service => ({
//       ...service,
//       processType: 'other',
//       displayType: service.serviceTypes.join(', '),
//       status: service.jobStatus,
//       deadline: service.deadline
//     }))
//   };

//   // Get task process
//   const getTaskProcess = (task: any, category: string) => {
//     return clientProcesses.find(process => {
//       const template = getTemplateById(process.templateId);
//       return template?.serviceType === task.processType;
//     });
//   };

//   // Separate active and completed tasks
//   const getTaskStatus = (task: any) => {
//     const status = task.status;
//     return status === 'Completed' || 
//            status === 'Delivered' || 
//            status === 'Approved' ||
//            status === 'Completed';
//   };

//   const separateTasks = (tasks: any[]) => {
//     return {
//       active: tasks.filter(task => !getTaskStatus(task)),
//       completed: tasks.filter(task => getTaskStatus(task))
//     };
//   };

//   const separatedTasks = Object.entries(clientTasks).reduce((acc, [category, tasks]) => {
//     acc[category] = separateTasks(tasks);
//     return acc;
//   }, {} as Record<string, { active: any[]; completed: any[] }>);

//   // Get payment history
//   const paymentHistory = [
//     ...clientTasks.applications.map(app => ({
//       id: `visa-${app.id}`,
//       date: app.submissionDate,
//       type: app.displayType,
//       amount: app.payment.total,
//       paidAmount: app.payment.paidAmount,
//       status: app.payment.paidAmount >= app.payment.total ? 'Paid' : 'Due'
//     })),
//     ...clientTasks.japanVisit.map(app => ({
//       id: `japan-${app.id}`,
//       date: app.date,
//       type: app.displayType,
//       amount: app.amount,
//       paidAmount: app.paidAmount,
//       status: app.paymentStatus
//     })),
//     ...clientTasks.translations.map(t => ({
//       id: `trans-${t.id}`,
//       date: t.createdAt,
//       type: t.displayType,
//       amount: t.amount,
//       paidAmount: t.amount - (t.amount * 0),
//       status: t.paymentStatus
//     })),
//     ...clientTasks.designs.map(job => ({
//       id: `design-${job.id}`,
//       date: job.createdAt,
//       type: job.displayType,
//       amount: job.amount,
//       paidAmount: job.advancePaid,
//       status: job.paymentStatus
//     })),
//     ...clientTasks.epassport.map(app => ({
//       id: `epass-${app.id}`,
//       date: app.date,
//       type: app.displayType,
//       amount: app.amount,
//       paidAmount: app.paidAmount,
//       status: app.paymentStatus
//     })),
//     ...clientTasks.otherServices.map(service => ({
//       id: `other-${service.id}`,
//       date: service.createdAt,
//       type: service.displayType,
//       amount: service.amount,
//       paidAmount: service.paidAmount,
//       status: service.paymentStatus
//     }))
//   ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//   const renderTaskTimeline = (task: any, category: string) => {
//     const process = getTaskProcess(task, category);
//     if (!process) return null;

//     return (
//       <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
//         {process.steps.map((step) => (
//           <div key={step.id} className="relative">
//             <div className="absolute -left-[25px] mt-1">
//               <div className={`h-4 w-4 rounded-full ${
//                 step.status === 'completed' ? 'bg-green-500' :
//                 step.status === 'in_progress' ? 'bg-blue-500' :
//                 step.status === 'blocked' ? 'bg-red-500' :
//                 'bg-gray-300'
//               }`} />
//             </div>
//             <div className="ml-2">
//               <h4 className="font-medium">{step.name}</h4>
//               <p className="text-sm text-gray-500">{step.description}</p>
//               {step.startDate && (
//                 <p className="text-xs text-gray-400 mt-1">
//                   Started: {format(new Date(step.startDate), 'MMM d, yyyy')}
//                 </p>
//               )}
//               {step.completedAt && (
//                 <p className="text-xs text-green-600 mt-1">
//                   Completed: {format(new Date(step.completedAt), 'MMM d, yyyy')}
//                 </p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const getCategoryLabel = (category: string) => {
//     switch (category) {
//       case 'applications':
//         return 'Visa Applications';
//       case 'japanVisit':
//         return 'Japan Visit Applications';
//       case 'translations':
//         return 'Document Translations';
//       case 'designs':
//         return 'Design Projects';
//       case 'epassport':
//         return 'ePassport Applications';
//       case 'otherServices':
//         return 'Other Services';
//       default:
//         return category;
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Tabs */}
//       <div className="flex space-x-4 border-b">
//         <button
//           onClick={() => setActiveTab('active')}
//           className={`py-2 px-4 border-b-2 text-sm font-medium ${
//             activeTab === 'active'
//               ? 'border-brand-yellow text-brand-black'
//               : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//           }`}
//         >
//           Active Tasks
//         </button>
//         <button
//           onClick={() => setActiveTab('completed')}
//           className={`py-2 px-4 border-b-2 text-sm font-medium ${
//             activeTab === 'completed'
//               ? 'border-brand-yellow text-brand-black'
//               : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//           }`}
//         >
//           Previous Tasks
//         </button>
//         <button
//           onClick={() => setActiveTab('payments')}
//           className={`py-2 px-4 border-b-2 text-sm font-medium ${
//             activeTab === 'payments'
//               ? 'border-brand-yellow text-brand-black'
//               : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//           }`}
//         >
//           Payments
//         </button>
//       </div>

//       {/* Content */}
//       {(activeTab === 'active' || activeTab === 'completed') && (
//         <div className="space-y-4">
//           {Object.entries(separatedTasks).map(([category, { active, completed }]) => {
//             const tasks = activeTab === 'active' ? active : completed;
//             if (tasks.length === 0) return null;
            
//             return (
//               <div key={category} className="space-y-2">
//                 <h3 className="font-medium text-gray-900">
//                   {getCategoryLabel(category)}
//                 </h3>
//                 {tasks.map((task: any) => (
//                   <div key={task.id} className="bg-gray-50 rounded-lg overflow-hidden">
//                     <div 
//                       className="p-4 cursor-pointer hover:bg-gray-100"
//                       onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="font-medium">{task.displayType}</h4>
//                           <p className="text-sm text-gray-500">
//                             {activeTab === 'active' ? 'Deadline' : 'Completed'}: {
//                               format(new Date(task.deadline || task.completedAt), 'MMM d, yyyy')
//                             }
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             task.status === 'Completed' || task.status === 'Delivered' || task.status === 'Approved'
//                               ? 'bg-green-100 text-green-700'
//                               : task.status === 'Cancelled' || task.status === 'Rejected'
//                               ? 'bg-red-100 text-red-700'
//                               : 'bg-blue-100 text-blue-700'
//                           }`}>
//                             {task.status}
//                           </span>
//                           {expandedTask === task.id ? (
//                             <ChevronUp className="h-5 w-5 text-gray-400" />
//                           ) : (
//                             <ChevronDown className="h-5 w-5 text-gray-400" />
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     {expandedTask === task.id && renderTaskTimeline(task, category)}
//                   </div>
//                 ))}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {activeTab === 'payments' && (
//         <div className="space-y-4">
//           {paymentHistory.map((payment) => (
//             <div key={payment.id} className="bg-gray-50 p-4 rounded-lg">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h4 className="font-medium">{payment.type}</h4>
//                   <p className="text-sm text-gray-500">
//                     {format(new Date(payment.date), 'MMM d, yyyy')}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-medium">¥{payment.amount.toLocaleString()}</p>
//                   <p className="text-sm text-gray-500">
//                     Paid: ¥{payment.paidAmount.toLocaleString()}
//                   </p>
//                   <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
//                     payment.status === 'Paid' 
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {payment.status}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }











// **************NEW CODE*********************


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { ChevronDown, ChevronUp } from 'lucide-react';
// import { Timeline } from 'antd';
// import { CheckCircle, Clock, XCircle } from 'lucide-react';
// import { useAuthGlobally } from '../../context/AuthContext';

// const TasksSection = () => {
//   const [clientTasks, setClientTasks] = useState<any>({});
//   const [loading, setLoading] = useState<boolean>(true);
//   const [expandedTask, setExpandedTask] = useState<string | null>(null);
//   const [error, setError] = useState<string>('');
//   const [auth] = useAuthGlobally();
//   console.log('client task is ', clientTasks)
//   console.log("Auth User ID:", auth?.user?.id);

//   // Fetch data from the API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`);
        

//         setClientTasks(response.data.allData);  // Set the fetched data
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

//   const renderStatus = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return { color: 'green', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
//       case 'processing':
//         return { color: 'yellow', icon: <Clock className="h-5 w-5 text-yellow-500" /> };
//       default:
//         return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
//     }
//   };

//   const renderTaskTimeline = (task: any) => {
//     if (!task.step) return null;

//     return (
//       <Timeline className="ml-4">
//         {Object.entries(task.step.stepNames || {}).map(([stepName, stepData]) => {
//           const status = stepData.status || 'pending'; // Default to 'pending'
//           const { color, icon } = renderStatus(status);

//           return (
//             <Timeline.Item 
//               key={stepName} 
//               color="gray"  // Set color to gray explicitly to remove blue
//               dot={icon}
//               style={{ backgroundColor: 'transparent', borderColor: 'transparent' }} // Override blue background and border color
//             >
//               <div className="flex items-center justify-between">
//                 <h2>
//                   {stepName}{" "}
//                   {status === 'completed'
//                     ? '(Completed)'
//                     : status === 'processing'
//                     ? '(Processing)'
//                     : '(Pending)'}
//                 </h2>
//               </div>
//             </Timeline.Item>
//           );
//         })}
//       </Timeline>
//     );
//   };

//   const renderTasks = (modelName: string, data: any[]) => {
//     if (data.length === 0) return null;

//     return (
//       <div key={modelName}>
//         <h3 className="font-medium text-gray-900">{modelName}</h3>
//         <div className="space-y-4">
//           {data.map((task: any) => (
//             <div key={task._id} className="bg-gray-50 rounded-lg overflow-hidden">
//               <div 
//                 className="p-4 cursor-pointer hover:bg-gray-100"
//                 onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
//               >
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h4 className="font-medium">{task.type || task.applicationType}</h4>
//                     <p className="text-sm text-gray-500">
//                       Deadline: {format(new Date(task.deadline), 'MMM d, yyyy')}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.documentStatus || task.applicationStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
//                       {task.documentStatus || task.applicationStatus}
//                     </span>
//                     {expandedTask === task._id ? (
//                       <ChevronUp className="h-5 w-5 text-gray-400" />
//                     ) : (
//                       <ChevronDown className="h-5 w-5 text-gray-400" />
//                     )}
//                   </div>
//                 </div>
//               </div>
//               {expandedTask === task._id && renderTaskTimeline(task)}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {Object.keys(clientTasks).map((modelName) => {
//         const data = clientTasks[modelName]; // e.g., applicationModel, ePassportModel, etc.
//         if (data && data.length > 0) {
//           return renderTasks(modelName, data);
//         }
//         return null;
//       })}
//     </div>
//   );
// };

// export default TasksSection;













// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { format, isValid } from 'date-fns';
// import { ChevronDown, ChevronUp } from 'lucide-react';
// import { Timeline } from 'antd';
// import { CheckCircle, Clock, XCircle } from 'lucide-react';
// import { useAuthGlobally } from '../../context/AuthContext';

// const TasksSection = () => {
//   const [clientTasks, setClientTasks] = useState<any>({});
//   const [loading, setLoading] = useState<boolean>(true);
//   const [expandedTask, setExpandedTask] = useState<string | null>(null);
//   const [error, setError] = useState<string>('');
//   const [auth] = useAuthGlobally();

//   // Fetch data from the API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`
//         );
//         setClientTasks(response.data.allData); // Set the fetched data
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
//               {status === 'completed' && formattedUpdatedAt && (
//                 <p className="text-xs text-gray-400">Updated: {formattedUpdatedAt}</p>
//               )}
//             </div>
//             {/* <span>
//               {status === 'completed'
//                 ? '(Completed)'
//                 : status === 'processing'
//                 ? '(Processing)'
//                 : status === 'inprocess'
//                 ? '(In Progress)'
//                 : '(Pending)'}
//             </span> */}
//           </div>
//         </Timeline.Item>
//       );
//     });
//   };

//   const renderTasks = (modelName: string, data: any[]) => {
//     if (data.length === 0) return null;

//     return (
//       <div key={modelName}>
//         {/* <h3 className="font-medium text-gray-900">{modelName}</h3> */}
//         <div className="space-y-4">
//           {data.map((task: any) => {
//             const deadline = task.deadline ? new Date(task.deadline) : null;
//             const formattedDeadline = deadline && isValid(deadline) ? format(deadline, 'MMM d, yyyy') : 'No Deadline';

//             return (
//               <div key={task._id} className="bg-white rounded-lg overflow-hidden">
//                 <div
//                   className="p-4 cursor-pointer hover:bg-white"
//                   onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h4 className="font-medium">{task.type || task.applicationType}</h4>
//                       <p className="text-sm text-gray-500">Deadline: {formattedDeadline}</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           task.documentStatus === 'Completed' || task.applicationStatus === 'Completed'
//                             ? 'bg-green-100 text-green-700'
//                             : task.documentStatus === 'In Progress' || task.applicationStatus === 'In Progress'
//                             ? 'bg-blue-100 text-blue-700'
//                             : 'bg-gray-100 text-gray-700'
//                         }`}
//                       >
//                         {task.documentStatus || task.applicationStatus}
//                       </span>
//                       {expandedTask === task._id ? (
//                         <ChevronUp className="h-5 w-5 text-gray-400" />
//                       ) : (
//                         <ChevronDown className="h-5 w-5 text-gray-400" />
//                       )}
//                     </div>
//                   </div> 
//                 </div>
//                 {expandedTask === task._id && <Timeline className="ml-4">{renderStepTimeline(task.steps || [])}</Timeline>}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {Object.keys(clientTasks).map((modelName) => {
//         const data = clientTasks[modelName];
//         if (data && data.length > 0) {
//           return renderTasks(modelName, data);
//         }
//         return null;
//       })}
//     </div>
//   );
// };

// export default TasksSection;

















// ***********tab testing********

import React, { useState } from 'react';
import ClientOngoingTask from './ClientOngoingTask';  // Import ClientOngoingTask component
import PreviousTask from './PreviousTask';  // Import PreviousTask component
import ClientPayment from './ClientPayment';  // Import ClientPayment component

const TasksSection = () => {
  const [activeTab, setActiveTab] = useState<string>('ongoingTasks'); // State for active tab

  // Handle Tab Switch
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Render Active Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'ongoingTasks':
        return <ClientOngoingTask />;  // ClientOngoingTask will handle its own data fetching
      case 'previousTasks':
        return <PreviousTask />;  // PreviousTask will handle its own data fetching
      case 'payment':
        return <ClientPayment />;  // ClientPayment will handle its own data fetching
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleTabChange('ongoingTasks')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'ongoingTasks' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'border-b-2 border-transparent text-gray-700'}`}
        >
          Ongoing Tasks
        </button>
        <button
          onClick={() => handleTabChange('previousTasks')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'previousTasks' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'border-b-2 border-transparent text-gray-700'}`}
        >
          Previous Tasks
        </button>
        <button
          onClick={() => handleTabChange('payment')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'payment' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'border-b-2 border-transparent text-gray-700'}`}
        >
          Payment
        </button>
      </div>

      {/* Render Active Tab Content */}
      <div className="space-y-4">{renderTabContent()}</div>
    </div>
  );
};

export default TasksSection;
