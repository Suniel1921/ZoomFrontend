// import { useState } from 'react';
// import { CreditCard, Search, UserPlus } from 'lucide-react';
// import Input from '../../components/Input';
// import Button from '../../components/Button';
// import SearchableSelect from '../../components/SearchableSelect';
// import { useStore } from '../../store';
// import ClientTaskTracking from '../clients/ClientTaskTracking';
// import { useNavigate } from 'react-router-dom';

// export default function AccountsPage() {
//   const navigate = useNavigate();
//   const [selectedClientId, setSelectedClientId] = useState<string>('');
//   const { clients } = useStore();

//   const selectedClient = clients.find(client => client.id === selectedClientId);

//   return (
//     <div className="space-y-6">
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <CreditCard className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">Accounts & Tasks</h1>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <div className="w-96">
//               <SearchableSelect
//                 options={clients.map(client => ({
//                   value: client.id,
//                   label: client.name
//                 }))}
//                 value={selectedClientId}
//                 onChange={setSelectedClientId}
//                 placeholder="Search client..."
//               />
//             </div>
//             <Button onClick={() => navigate('/dashboard/clients', { state: { openAddModal: true } })}>
//               <UserPlus className="h-4 w-4 mr-2" />
//               Add Client
//             </Button>
//           </div>
//         </div>
//       </div>

//       {!selectedClientId ? (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
//           <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h2>
//           <p className="text-gray-500">
//             Search and select a client to view their accounts and tasks details.
//           </p>
//         </div>
//       ) : selectedClient ? (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="p-4 bg-gray-50 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 {selectedClient.profilePhoto ? (
//                   <img
//                     src={selectedClient.profilePhoto}
//                     alt={selectedClient.name}
//                     className="h-12 w-12 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="h-12 w-12 rounded-full bg-brand-yellow/10 flex items-center justify-center">
//                     <span className="text-xl text-brand-black font-medium">
//                       {selectedClient.name.split(' ').map(n => n[0]).join('')}
//                     </span>
//                   </div>
//                 )}
//                 <div>
//                   <h2 className="text-lg font-semibold">{selectedClient.name}</h2>
//                   <p className="text-sm text-gray-500">{selectedClient.email}</p>
//                 </div>
//               </div>
//               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                 selectedClient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//               }`}>
//                 {selectedClient.status}
//               </span>
//             </div>
//           </div>
          
//           <div className="p-6">
//             <ClientTaskTracking client={selectedClient} />
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
//           <p className="text-gray-500">Client not found.</p>
//         </div>
//       )}
//     </div>
//   );
// }












// import { useEffect, useState } from 'react';
// import { CreditCard, Search, UserPlus } from 'lucide-react';
// import SearchableSelect from '../../components/SearchableSelect';
// import Button from '../../components/Button';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import axios from 'axios';

// export default function AccountsPage() {
//   const navigate = useNavigate();
//   const [selectedClientId, setSelectedClientId] = useState<string>('');
//   const [allData, setAllData] = useState<any>(null);
//   const [clientsForDropdown, setClientsForDropdown] = useState([]);

//   // Fetch all model data
//   const getAllModelData = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`);
//       console.log('All model data:', response);
//       if (response.data.success) {
//         setAllData(response.data.allData);
//         extractClients(response.data.allData);
//       } else {
//         toast.error('Something went wrong while fetching data!');
//       }
//     } catch (error: any) {
//       if (error.response) {
//         toast.error(error.response.data.message);
//       }
//     }
//   };

//   // Extract client data from all models
//   const extractClients = (allData: any) => {
//     const clients = [];

//     // Iterate through each model
//     Object.keys(allData).forEach((key) => {
//       const modelData = allData[key];
//       if (Array.isArray(modelData)) {
//         modelData.forEach((item) => {
//           if (item.clientId && item.clientId._id && item.clientId.name) {
//             clients.push({
//               value: item.clientId._id,
//               label: item.clientId.name,
//             });
//           }
//         });
//       }
//     });

//     // Remove duplicates based on `value` (clientId)
//     const uniqueClients = Array.from(new Map(clients.map((client) => [client.value, client])).values());
//     setClientsForDropdown(uniqueClients);
//   };

//   useEffect(() => {
//     getAllModelData();
//   }, []);

//   return (
//     <div className="space-y-6">
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <CreditCard className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">Accounts & Tasks</h1>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="w-96">
//               <SearchableSelect
//                 options={clientsForDropdown}
//                 value={selectedClientId}
//                 onChange={setSelectedClientId}
//                 placeholder="Search client..."
//               />
//             </div>
//             <Button onClick={() => navigate('/dashboard/clients', { state: { openAddModal: true } })}>
//               <UserPlus className="h-4 w-4 mr-2" />
//               Add Client
//             </Button>
//           </div>
//         </div>
//       </div>

//       {!selectedClientId ? (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
//           <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h2>
//           <p className="text-gray-500">
//             Search and select a client to view their accounts and tasks details.
//           </p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
//           <p className="text-gray-500">Client not found or no tasks available.</p>
//         </div>
//       )}
//     </div>
//   );
// }









// import { useEffect, useState } from 'react';
// import { CreditCard, Search, UserPlus } from 'lucide-react';
// import SearchableSelect from '../../components/SearchableSelect';
// import Button from '../../components/Button';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import ClientTaskTracking from '../clients/ClientTaskTracking';

// export default function AccountsPage() {
//   const navigate = useNavigate();
//   const [selectedClientId, setSelectedClientId] = useState<string>('');
//   const [allData, setAllData] = useState<any>(null);
//   const [clientsForDropdown, setClientsForDropdown] = useState<any[]>([]);

//   // Fetch all model data
//   const getAllModelData = async (clientId: string = '') => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`, {
//         params: { clientId }, // Pass clientId as query parameter
//       });
//       console.log('All model data:', response);
//       if (response.data.success) {
//         setAllData(response.data.allData);
//         extractClients(response.data.allData);
//       } else {
//         toast.error('Something went wrong while fetching data!');
//       }
//     } catch (error: any) {
//       if (error.response) {
//         toast.error(error.response.data.message);
//       }
//     }
//   };

//   // Extract client data from all models
//   const extractClients = (allData: any) => {
//     const clients: any[] = [];
//     Object.keys(allData).forEach((key) => {
//       const modelData = allData[key];
//       if (Array.isArray(modelData)) {
//         modelData.forEach((item) => {
//           if (item.clientId && item.clientId._id && item.clientId.name) {
//             clients.push({
//               value: item.clientId._id,
//               label: item.clientId.name,
//             });
//           }
//         });
//       }
//     });

//     const uniqueClients = Array.from(new Map(clients.map((client) => [client.value, client])).values());
//     setClientsForDropdown(uniqueClients);
//   };

//   useEffect(() => {
//     getAllModelData(); // Initial fetch for all clients
//   }, []);

//   useEffect(() => {
//     if (selectedClientId) {
//       getAllModelData(selectedClientId); // Fetch data for the selected client
//     }
//   }, [selectedClientId]);

//   return (
//     <div className="space-y-6">
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <CreditCard className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">Accounts & Tasks</h1>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="w-96">
//               <SearchableSelect
//                 options={clientsForDropdown}
//                 value={selectedClientId}
//                 onChange={setSelectedClientId}
//                 placeholder="Search client..."
//               />
//             </div>
//             <Button onClick={() => navigate('/dashboard/clients', { state: { openAddModal: true } })}>
//               <UserPlus className="h-4 w-4 mr-2" />
//               Add Client
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Render the ClientTaskTracking component if a client is selected */}
//       {selectedClientId ? (
//       <ClientTaskTracking clientId={selectedClientId} allData={allData} />

//       ) : (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
//           <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h2>
//           <p className="text-gray-500">
//             Search and select a client to view their accounts and tasks details.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }













import { useEffect, useState } from 'react';
import { CreditCard, Search, UserPlus } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import ClientTaskTracking from '../clients/ClientTaskTracking';

export default function AccountsPage() {
  const navigate = useNavigate();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [allData, setAllData] = useState<any>(null);
  const [clientsForDropdown, setClientsForDropdown] = useState<any[]>([]);

  // Fetch all model data
  const getAllModelData = async (clientId: string = '') => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`, {
        params: { clientId }, // Pass clientId as query parameter
      });
      console.log('All model data:', response);
      if (response.data.success) {
        setAllData(response.data.allData);
        extractClients(response.data.allData);
      } else {
        toast.error('Something went wrong while fetching data!');
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
    }
  };

  // Extract client data from all models
  const extractClients = (allData: any) => {
    const clients: any[] = [];
    Object.keys(allData).forEach((key) => {
      const modelData = allData[key];
      if (Array.isArray(modelData)) {
        modelData.forEach((item) => {
          if (item.clientId && item.clientId._id && item.clientId.name) {
            clients.push({
              value: item.clientId._id,
              label: item.clientId.name,
            });
          }
        });
      }
    });

    const uniqueClients = Array.from(new Map(clients.map((client) => [client.value, client])).values());
    setClientsForDropdown(uniqueClients);
  };

  useEffect(() => {
    getAllModelData(); // Initial fetch for all clients
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      getAllModelData(selectedClientId); // Fetch data for the selected client
    }
  }, [selectedClientId]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Accounts & Tasks</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-96">
              <SearchableSelect
                options={clientsForDropdown}
                value={selectedClientId}
                onChange={setSelectedClientId}
                placeholder="Search client..."
              />
            </div>
            <Button onClick={() => navigate('/dashboard/clients', { state: { openAddModal: true } })}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Render the ClientTaskTracking component if a client is selected */}
      {selectedClientId ? (
        <ClientTaskTracking client={selectedClientId} allData={allData} /> // Pass selectedClientId and allData to the child component
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h2>
          <p className="text-gray-500">
            Search and select a client to view their accounts and tasks details.
          </p>
        </div>
      )}
    </div>
  );
}

