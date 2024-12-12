// import { useState } from 'react';
// import { CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';
// import type { ClientProcess } from '../../../types/taskManagement';

// interface ProcessSummaryProps {
//   process: ClientProcess;
// }

// export default function ProcessSummary({ process }: ProcessSummaryProps) {
//   // Calculate statistics
//   const stats = {
//     steps: {
//       total: process.steps.length,
//       completed: process.steps.filter(s => s.status === 'completed').length,
//       blocked: process.steps.filter(s => s.status === 'blocked').length,
//     },
//     documents: {
//       total: process.documents.length,
//       verified: process.documents.filter(d => d.status === 'verified').length,
//       rejected: process.documents.filter(d => d.status === 'rejected').length,
//     },
//     payments: {
//       total: process.payments.reduce((sum, p) => sum + p.amount, 0),
//       paid: process.payments.reduce((sum, p) => sum + p.paidAmount, 0),
//     }
//   };

//   return (
//     <div className="grid grid-cols-3 gap-6">
//       {/* Steps Progress */}
//       <div className="bg-white rounded-lg border border-gray-200 p-4">
//         <div className="flex items-center gap-2 mb-4">
//           <CheckCircle className="h-5 w-5 text-green-500" />
//           <h3 className="font-medium">Steps Progress</h3>
//         </div>
//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-500">Completed</span>
//             <span className="font-medium">{stats.steps.completed}/{stats.steps.total}</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-green-500 h-2 rounded-full"
//               style={{
//                 width: `${(stats.steps.completed / stats.steps.total) * 100}%`
//               }}
//             />
//           </div>
//           {stats.steps.blocked > 0 && (
//             <p className="text-sm text-red-600">
//               {stats.steps.blocked} step(s) blocked
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Documents Status */}
//       <div className="bg-white rounded-lg border border-gray-200 p-4">
//         <div className="flex items-center gap-2 mb-4">
//           <Clock className="h-5 w-5 text-blue-500" />
//           <h3 className="font-medium">Documents Status</h3>
//         </div>
//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-500">Verified</span>
//             <span className="font-medium">{stats.documents.verified}/{stats.documents.total}</span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-blue-500 h-2 rounded-full"
//               style={{
//                 width: `${(stats.documents.verified / stats.documents.total) * 100}%`
//               }}
//             />
//           </div>
//           {stats.documents.rejected > 0 && (
//             <p className="text-sm text-red-600">
//               {stats.documents.rejected} document(s) rejected
//             </p>
//           )}
//         </div>
//       </div>

//       {/* Payment Progress */}
//       <div className="bg-white rounded-lg border border-gray-200 p-4">
//         <div className="flex items-center gap-2 mb-4">
//           <DollarSign className="h-5 w-5 text-yellow-500" />
//           <h3 className="font-medium">Payment Progress</h3>
//         </div>
//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-500">Paid</span>
//             <span className="font-medium">
//               ¥{stats.payments.paid.toLocaleString()} / ¥{stats.payments.total.toLocaleString()}
//             </span>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-yellow-500 h-2 rounded-full"
//               style={{
//                 width: `${(stats.payments.paid / stats.payments.total) * 100}%`
//               }}
//             />
//           </div>
//           {stats.payments.total > stats.payments.paid && (
//             <p className="text-sm text-yellow-600">
//               ¥{(stats.payments.total - stats.payments.paid).toLocaleString()} remaining
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

















// import { useState } from 'react';
// import { CheckCircle, Clock, DollarSign } from 'lucide-react';
// import type { ClientProcess } from '../../../types/taskManagement';
// import Step from './accountAndTaskComponents/Step'; // Assuming this is your Step component
// import TimeLine from './accountAndTaskComponents/TimeLine';


// interface ProcessSummaryProps {
//   process: ClientProcess | null | undefined; // Allow for null or undefined process
//   client: string,
//   allData: []
// }

// export default function ProcessSummary({ process, client, allData }: ProcessSummaryProps) {
//   const [activeTab, setActiveTab] = useState('steps'); // Track the active tab (steps, timeline, etc.)
//   // console.log('processsummary data is', allData)
//   // console.log('processsummary id is', client)

//   // Fallback static values
//   const steps = process?.steps || [];
//   const documents = process?.documents || [];
//   const payments = process?.payments || [];

//   // Calculate progress based on fallback data
//   const completedSteps = steps.filter(s => s.status === 'completed').length;
//   const totalSteps = steps.length;
//   const blockedSteps = steps.filter(s => s.status === 'blocked').length;

//   const verifiedDocs = documents.filter(d => d.status === 'verified').length;
//   const totalDocs = documents.length;
//   const rejectedDocs = documents.filter(d => d.status === 'rejected').length;

//   const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
//   const paidPayments = payments.reduce((sum, p) => sum + p.paidAmount, 0);

//   // Render based on activeTab
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'steps':
//         return <Step process={process} client={client} allData={allData} />; // Assuming Step component accepts 'process' prop
//       case 'timeline':
//         return <TimeLine process={process} />; // Assuming Timeline component accepts 'process' prop
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <div className="grid grid-cols-3 gap-6">
//         {/* Steps Progress */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="flex items-center gap-2 mb-4">
//             <CheckCircle className="h-5 w-5 text-green-500" />
//             <h3 className="font-medium">Steps Progress</h3>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Completed</span>
//               <span className="font-medium">{completedSteps}/{totalSteps}</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-green-500 h-2 rounded-full"
//                 style={{
//                   width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%`
//                 }}
//               />
//             </div>
//             {blockedSteps > 0 && (
//               <p className="text-sm text-red-600">
//                 {blockedSteps} step(s) blocked
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Documents Status */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="flex items-center gap-2 mb-4">
//             <Clock className="h-5 w-5 text-blue-500" />
//             <h3 className="font-medium">Documents Status</h3>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Verified</span>
//               <span className="font-medium">{verifiedDocs}/{totalDocs}</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-500 h-2 rounded-full"
//                 style={{
//                   width: `${totalDocs > 0 ? (verifiedDocs / totalDocs) * 100 : 0}%`
//                 }}
//               />
//             </div>
//             {rejectedDocs > 0 && (
//               <p className="text-sm text-red-600">
//                 {rejectedDocs} document(s) rejected
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Payment Progress */}
//         <div className="bg-white rounded-lg border border-gray-200 p-4">
//           <div className="flex items-center gap-2 mb-4">
//             <DollarSign className="h-5 w-5 text-yellow-500" />
//             <h3 className="font-medium">Payment Progress</h3>
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Paid</span>
//               <span className="font-medium">
//                 ¥{paidPayments.toLocaleString()} / ¥{totalPayments.toLocaleString()}
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-yellow-500 h-2 rounded-full"
//                 style={{
//                   width: `${totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0}%`
//                 }}
//               />
//             </div>
//             {totalPayments > paidPayments && (
//               <p className="text-sm text-yellow-600">
//                 ¥{(totalPayments - paidPayments).toLocaleString()} remaining
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-16 mt-12 cursor-pointer font-bold">
//         {/* Tab Navigation with Yellow Underline for Active Tab */}
//         <h4 
//           onClick={() => setActiveTab('steps')} 
//           className={`transition-all duration-300 ${activeTab === 'steps' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           Steps
//         </h4>
//         {/* <h4 
//           onClick={() => setActiveTab('documents')} 
//           className={`transition-all duration-300 ${activeTab === 'documents' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           Documents
//         </h4> */}
//         {/* <h4 
//           onClick={() => setActiveTab('payments')} 
//           className={`transition-all duration-300 ${activeTab === 'payments' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           Payments
//         </h4> */}
//         <h4 
//           onClick={() => setActiveTab('timeline')} 
//           className={`transition-all duration-300 ${activeTab === 'timeline' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
//         >
//           Timeline
//         </h4>
//       </div>

//       {/* Tab Content */}
//       <div className="mt-8">
//         {renderTabContent()}
//       </div>
//     </>
//   );
// }














import { useState } from 'react';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import type { ClientProcess } from '../../../types/taskManagement';
import Step from './accountAndTaskComponents/Step'; // Assuming this is your Step component
import TimeLine from './accountAndTaskComponents/TimeLine';

interface ProcessSummaryProps {
  process: ClientProcess | null | undefined; // Allow for null or undefined process
  client: string,
  allData: []
}

export default function ProcessSummary({ process, client, allData }: ProcessSummaryProps) {
  const [activeTab, setActiveTab] = useState('steps'); // Track the active tab (steps, timeline, etc.)
  
  // Fallback static values
  const steps = process?.steps || [];
  const documents = process?.documents || [];
  const payments = process?.payments || [];

  // Calculate progress based on fallback data
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const blockedSteps = steps.filter(s => s.status === 'blocked').length;

  const verifiedDocs = documents.filter(d => d.status === 'verified').length;
  const totalDocs = documents.length;
  const rejectedDocs = documents.filter(d => d.status === 'rejected').length;

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidPayments = payments.reduce((sum, p) => sum + p.paidAmount, 0);

  // Render based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'steps':
        return <Step process={process} client={client} allData={allData} />;
      case 'timeline':
        return <TimeLine process={process} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {/* Steps Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Steps Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Completed</span>
              <span className="font-medium">{completedSteps}/{totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%`
                }}
              />
            </div>
            {blockedSteps > 0 && (
              <p className="text-sm text-red-600">
                {blockedSteps} step(s) blocked
              </p>
            )}
          </div>
        </div>

        {/* Documents Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Documents Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Verified</span>
              <span className="font-medium">{verifiedDocs}/{totalDocs}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${totalDocs > 0 ? (verifiedDocs / totalDocs) * 100 : 0}%`
                }}
              />
            </div>
            {rejectedDocs > 0 && (
              <p className="text-sm text-red-600">
                {rejectedDocs} document(s) rejected
              </p>
            )}
          </div>
        </div>

        {/* Payment Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Payment Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid</span>
              <span className="font-medium">
                ¥{paidPayments.toLocaleString()} / ¥{totalPayments.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{
                  width: `${totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0}%`
                }}
              />
            </div>
            {totalPayments > paidPayments && (
              <p className="text-sm text-yellow-600">
                ¥{(totalPayments - paidPayments).toLocaleString()} remaining
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-16 mt-12 cursor-pointer font-bold">
        <h4
          onClick={() => setActiveTab('steps')}
          className={`transition-all duration-300 ${activeTab === 'steps' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Steps
        </h4>
        <h4
          onClick={() => setActiveTab('timeline')}
          className={`transition-all duration-300 ${activeTab === 'timeline' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Timeline
        </h4>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {renderTabContent()}
      </div>
    </>
  );
}
