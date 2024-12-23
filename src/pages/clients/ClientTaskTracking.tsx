// import { useState } from 'react';
// import { useStore } from '../../store';
// import { useTaskManagementStore } from '../../store/taskManagementStore';
// import { useServiceRequestStore } from '../../store/serviceRequestStore';
// import type { Client } from '../../types';
// import { format } from 'date-fns';
// import FilesTab from './FilesTab';
// import ProcessFlowTab from './ProcessFlowTab';
// import Button from '../../components/Button';
// import { Plus } from 'lucide-react';

// interface ClientTaskTrackingProps {
//   client: Client;
// }

// export default function ClientTaskTracking({ client }: ClientTaskTrackingProps) {
//   const [activeTab, setActiveTab] = useState('tasks');
//   const {
//     applications,
//     japanVisitApplications,
//     translations,
//     graphicDesignJobs,
//     epassportApplications,
//     otherServices
//   } = useStore();

//   const { getRequestsByClient } = useServiceRequestStore();
//   const clientRequests = getRequestsByClient(client.id);

//   // Get all tasks for this client
//   const clientTasks = {
//     applications: applications.filter(app => app.clientId === client.id),
//     japanVisit: japanVisitApplications.filter(app => app.clientId === client.id),
//     translations: translations.filter(t => t.clientId === client.id),
//     designs: graphicDesignJobs.filter(job => job.clientId === client.id),
//     epassport: epassportApplications.filter(app => app.clientId === client.id),
//     otherServices: otherServices.filter(service => service.clientId === client.id)
//   };

//   // Get payment history
//   const paymentHistory = [
//     ...clientTasks.applications.map(app => ({
//       id: `visa-${app.id}`,
//       date: app.submissionDate,
//       type: 'Visa Application',
//       amount: app.payment.total,
//       paidAmount: app.payment.paidAmount,
//       status: app.payment.paidAmount >= app.payment.total ? 'Paid' : 'Due'
//     })),
//     ...clientTasks.japanVisit.map(app => ({
//       id: `japan-${app.id}`,
//       date: app.date,
//       type: 'Japan Visit',
//       amount: app.amount,
//       paidAmount: app.paidAmount,
//       status: app.paymentStatus
//     })),
//     ...clientTasks.translations.map(t => ({
//       id: `trans-${t.id}`,
//       date: t.createdAt,
//       type: 'Translation',
//       amount: t.amount,
//       paidAmount: t.amount - (t.amount * 0),
//       status: t.paymentStatus
//     })),
//     ...clientTasks.designs.map(job => ({
//       id: `design-${job.id}`,
//       date: job.createdAt,
//       type: 'Design',
//       amount: job.amount,
//       paidAmount: job.advancePaid,
//       status: job.paymentStatus
//     })),
//     ...clientTasks.epassport.map(app => ({
//       id: `epass-${app.id}`,
//       date: app.date,
//       type: 'ePassport',
//       amount: app.amount,
//       paidAmount: app.paidAmount,
//       status: app.paymentStatus
//     })),
//     ...clientTasks.otherServices.map(service => ({
//       id: `other-${service.id}`,
//       date: service.createdAt,
//       type: service.serviceTypes.join(', '),
//       amount: service.amount,
//       paidAmount: service.paidAmount,
//       status: service.paymentStatus
//     }))
//   ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//   return (
//     <div className="space-y-4">
//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           <button
//             onClick={() => setActiveTab('tasks')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'tasks'
//                 ? 'border-brand-yellow text-brand-black'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Tasks
//           </button>
//           <button
//             onClick={() => setActiveTab('processes')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'processes'
//                 ? 'border-brand-yellow text-brand-black'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Process Flows
//           </button>
//           <button
//             onClick={() => setActiveTab('payments')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'payments'
//                 ? 'border-brand-yellow text-brand-black'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Payment History
//           </button>
//           <button
//             onClick={() => setActiveTab('files')}
//             className={`py-4 px-1 border-b-2 font-medium text-sm ${
//               activeTab === 'files'
//                 ? 'border-brand-yellow text-brand-black'
//                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//             }`}
//           >
//             Files
//           </button>
//         </nav>
//       </div>

//       {/* Content */}
//       {activeTab === 'tasks' && (
//         <div className="space-y-6">
//           {/* Service Requests */}
//           {clientRequests.length > 0 && (
//             <div>
//               <h3 className="font-medium mb-3">Service Requests</h3>
//               <div className="space-y-2">
//                 {clientRequests.map((request) => (
//                   <div key={request.id} className="bg-gray-50 p-3 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">{request.serviceName}</p>
//                         <p className="text-sm text-gray-500">
//                           Requested on: {format(new Date(request.requestedAt), 'MMM d, yyyy')}
//                         </p>
//                         {request.message && (
//                           <p className="text-sm text-gray-600 mt-1">
//                             Message: {request.message}
//                           </p>
//                         )}
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         request.status === 'completed' ? 'bg-green-100 text-green-700' :
//                         request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
//                         request.status === 'cancelled' ? 'bg-red-100 text-red-700' :
//                         'bg-yellow-100 text-yellow-700'
//                       }`}>
//                         {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Visa Applications */}
//           {clientTasks.applications.length > 0 && (
//             <div>
//               <h3 className="font-medium mb-3">Visa Applications</h3>
//               <div className="space-y-2">
//                 {clientTasks.applications.map(app => (
//                   <div key={app.id} className="bg-gray-50 p-3 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">{app.type} - {app.country}</p>
//                         <p className="text-sm text-gray-500">
//                           Deadline: {format(new Date(app.deadline), 'MMM d, yyyy')}
//                         </p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         app.visaStatus === 'Approved' ? 'bg-green-100 text-green-700' :
//                         app.visaStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
//                         'bg-blue-100 text-blue-700'
//                       }`}>
//                         {app.visaStatus}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Japan Visit Applications */}
//           {clientTasks.japanVisit.length > 0 && (
//             <div>
//               <h3 className="font-medium mb-3">Japan Visit Applications</h3>
//               <div className="space-y-2">
//                 {clientTasks.japanVisit.map(app => (
//                   <div key={app.id} className="bg-gray-50 p-3 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">Japan Visit Application</p>
//                         <p className="text-sm text-gray-500">
//                           Deadline: {format(new Date(app.deadline), 'MMM d, yyyy')}
//                         </p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         app.applicationStatus === 'Completed' ? 'bg-green-100 text-green-700' :
//                         app.applicationStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
//                         'bg-blue-100 text-blue-700'
//                       }`}>
//                         {app.applicationStatus}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Translations */}
//           {clientTasks.translations.length > 0 && (
//             <div>
//               <h3 className="font-medium mb-3">Document Translations</h3>
//               <div className="space-y-2">
//                 {clientTasks.translations.map(translation => (
//                   <div key={translation.id} className="bg-gray-50 p-3 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">
//                           {translation.sourceLanguage} → {translation.targetLanguage}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           Deadline: {format(new Date(translation.deadline), 'MMM d, yyyy')}
//                         </p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         translation.translationStatus === 'Completed' ? 'bg-green-100 text-green-700' :
//                         translation.translationStatus === 'Delivered' ? 'bg-blue-100 text-blue-700' :
//                         'bg-yellow-100 text-yellow-700'
//                       }`}>
//                         {translation.translationStatus}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* ePassport Applications */}
//           {clientTasks.epassport.length > 0 && (
//             <div>
//               <h3 className="font-medium mb-3">ePassport Applications</h3>
//               <div className="space-y-2">
//                 {clientTasks.epassport.map(app => (
//                   <div key={app.id} className="bg-gray-50 p-3 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">{app.applicationType}</p>
//                         <p className="text-sm text-gray-500">
//                           Deadline: {format(new Date(app.deadline), 'MMM d, yyyy')}
//                         </p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         app.applicationStatus === 'Completed' ? 'bg-green-100 text-green-700' :
//                         app.applicationStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
//                         'bg-blue-100 text-blue-700'
//                       }`}>
//                         {app.applicationStatus}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Design Jobs */}
//           {clientTasks.designs.length > 0 && (
//             <div>
//               <h3 className="font-medium mb-3">Design Jobs</h3>
//               <div className="space-y-2">
//                 {clientTasks.designs.map(job => (
//                   <div key={job.id} className="bg-gray-50 p-3 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">{job.designType}</p>
//                         <p className="text-sm text-gray-500">
//                           Deadline: {format(new Date(job.deadline), 'MMM d, yyyy')}
//                         </p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         job.status === 'Completed' ? 'bg-green-100 text-green-700' :
//                         job.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
//                         'bg-blue-100 text-blue-700'
//                       }`}>
//                         {job.status}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Other Services */}
//           {clientTasks.otherServices.length > 0 && (
//             <div>
//               <h3 className="font-medium mb-3">Other Services</h3>
//               <div className="space-y-2">
//                 {clientTasks.otherServices.map(service => (
//                   <div key={service.id} className="bg-gray-50 p-3 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium">{service.serviceTypes.join(', ')}</p>
//                         <p className="text-sm text-gray-500">
//                           Deadline: {format(new Date(service.deadline), 'MMM d, yyyy')}
//                         </p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         service.jobStatus === 'Completed' ? 'bg-green-100 text-green-700' :
//                         service.jobStatus === 'Under Process' ? 'bg-blue-100 text-blue-700' :
//                         'bg-yellow-100 text-yellow-700'
//                       }`}>
//                         {service.jobStatus}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {Object.values(clientTasks).every(tasks => tasks.length === 0) &&
//            clientRequests.length === 0 && (
//             <p className="text-center text-gray-500 py-8">No tasks found for this client.</p>
//           )}
//         </div>
//       )}

//       {activeTab === 'processes' && (
//         <ProcessFlowTab client={client} />
//       )}

//       {activeTab === 'payments' && (
//         <div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Service
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Amount
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {paymentHistory.map((payment) => (
//                   <tr key={payment.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {format(new Date(payment.date), 'MMM d, yyyy')}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {payment.type}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       <div>
//                         <p>Total: ¥{payment.amount?.toLocaleString()}</p>
//                         <p className="text-gray-500">Paid: ¥{payment.paidAmount?.toLocaleString()}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                         payment.status === 'Paid'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-yellow-100 text-yellow-800'
//                       }`}>
//                         {payment.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {activeTab === 'files' && (
//         <FilesTab client={client} />
//       )}
//     </div>
//   );
// }






import { useState, useEffect } from "react";
import { format } from "date-fns";
import FilesTab from "./FilesTab";
import ProcessFlowTab from "./ProcessFlowTab";
import Button from "../../components/Button";
import { Plus } from "lucide-react";

interface ClientTaskTrackingProps {
  client: string; // client id received as prop
  allData: any; // all model data received as prop
}

export default function ClientTaskTracking({
  client,
  allData,
}: ClientTaskTrackingProps) {
  const [activeTab, setActiveTab] = useState("tasks");
  const [clientTasks, setClientTasks] = useState({
    applications: [],
    appointment: [],
    documentTranslation: [],
    epassport: [],
    graphicDesigns: [],
    japanVisit: [],
    otherServices: [],
  });

  useEffect(() => {
    // Ensure the data and client ID are available
    if (allData && client) {
      const updatedClientTasks = {
        applications: [],
        appointment: [],
        documentTranslation: [],
        epassport: [],
        graphicDesigns: [],
        japanVisit: [],
        otherServices: [],
      };

      Object.keys(allData).forEach((key) => {
        const modelData = allData[key];
        // Only process array types
        if (Array.isArray(modelData)) {
          modelData.forEach((item) => {
            // console.log("Item Client ID:", item.clientId?._id);  // Log to check clientId

            // Check if the item belongs to the specific client
            if (item?.clientId?._id === client) {
              // Populate the client task state based on the data type
              if (key === "application") updatedClientTasks.applications.push(item);
              if (key === "appointment") updatedClientTasks.appointment.push(item);
              if (key === "documentTranslation") updatedClientTasks.documentTranslation.push(item);
              if (key === "epassports") updatedClientTasks.epassport.push(item);
              if (key === "graphicDesigns") updatedClientTasks.graphicDesigns.push(item);
              if (key === "japanVisit") updatedClientTasks.japanVisit.push(item);
              if (key === "otherServices") updatedClientTasks.otherServices.push(item);
            }
          });
        }
      });

      // Set the filtered tasks
      setClientTasks(updatedClientTasks);
    }
  }, [client, allData]);


  

  const renderTaskSection = (title: string, tasks: any[], taskType: string) => {
    return (
      tasks.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">{title}</h3>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="bg-gray-50 p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    {/* <p className="font-medium">{task.clientId.name || task.clientName}</p> */}
                    <p className="text-sm text-gray-500">
                      Deadline:{" "}
                      {task.deadline ? format(new Date(task.deadline), "MMM d, yyyy") : "N/A"}
                    </p>
                  </div>

                  {/* Render custom statuses based on task type */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClassName(task, taskType)}`}
                  >
                    {getStatusLabel(task, taskType)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    );
  };

  const getStatusClassName = (task: any, taskType: string) => {
    const status =
      taskType === "application"
        ? task.visaStatus
        : taskType === "documentTranslation"
        ? task.translationStatus
        : taskType === "epassport"
        ? task.applicationStatus
        : taskType === "otherService"
        ? task.jobStatus
        : task.status;

    // Return appropriate class based on the task status
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusLabel = (task: any, taskType: string) => {
    return (
      taskType === "application"
        ? task.visaStatus
        : taskType === "documentTranslation"
        ? task.translationStatus
        : taskType === "epassport"
        ? task.applicationStatus
        : taskType === "otherService"
        ? task.jobStatus
        : task.status
    );
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tasks"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("processes")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "processes"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Process Flows
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payments"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "files"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Files
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {renderTaskSection("Visa Applications", clientTasks.applications, "application")}
          {renderTaskSection("Appointments", clientTasks.appointment, "appointment")}
          {renderTaskSection("Document Translations", clientTasks.documentTranslation, "documentTranslation")}
          {renderTaskSection("Design Services", clientTasks.graphicDesigns, "graphicDesigns")}
          {renderTaskSection("Japan Visit Applications", clientTasks.japanVisit, "japanVisit")}
          {renderTaskSection("E-passport Applications", clientTasks.epassport, "epassport")}
          {renderTaskSection("Other Services", clientTasks.otherServices, "otherService")}
        </div>
      )}

      {activeTab === "processes" && <ProcessFlowTab client={client} allData={allData} />}
      {activeTab === "files" && <FilesTab />}
    </div>
  );
}
