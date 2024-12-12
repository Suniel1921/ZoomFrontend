// import { useState } from 'react';
// import { Plane, Plus, Search, Calculator, Printer } from 'lucide-react';
// import Input from '../../components/Input';
// import Button from '../../components/Button';
// import { useStore } from '../../store';
// import AddApplicationModal from './AddApplicationModal';
// import EditApplicationModal from './EditApplicationModal';
// import HisabKitabModal from '../../components/HisabKitabModal';
// import DataTable from '../../components/DataTable';
// import PrintAddressButton from '../../components/PrintAddressButton';
// import type { JapanVisitApplication } from '../../types';

// export default function JapanVisitPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedPackage, setSelectedPackage] = useState('');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
//   const [selectedApplication, setSelectedApplication] = useState<JapanVisitApplication | null>(null);
  
//   const { clients, japanVisitApplications, deleteJapanVisitApplication } = useStore();

//   // Filter applications based on search query and package
//   const filteredApplications = japanVisitApplications.filter(app => {
//     const matchesSearch = app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          app.reasonForVisit?.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesPackage = !selectedPackage || app.package === selectedPackage;
//     return matchesSearch && matchesPackage;
//   });

//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this application?')) {
//       deleteJapanVisitApplication(id);
//     }
//   };

//   const formatPhoneForViber = (phone: string | undefined | null): string => {
//     if (!phone) return '';
//     return phone.replace(/\D/g, '');
//   };

//   const getClientData = (clientId: string) => {
//     return clients.find(c => c.id === clientId);
//   };

//   const columns = [
//     {
//       key: 'clientName',
//       label: 'Client',
//       render: (value: string) => (
//         <div>
//           <p className="font-medium">{value}</p>
//         </div>
//       ),
//     },
//     {
//       key: 'mobileNo',
//       label: 'Contact',
//       render: (value: string | undefined | null) => {
//         if (!value) return <span className="text-gray-400">No contact</span>;
//         return (
//           <a 
//             href={`viber://chat?number=${formatPhoneForViber(value)}`}
//             className="text-brand-black hover:text-brand-yellow"
//           >
//             {value}
//           </a>
//         );
//       },
//     },
//     {
//       key: 'applicationStatus',
//       label: 'Status',
//       render: (value: string) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           value === 'Completed' ? 'bg-green-100 text-green-700' :
//           value === 'Cancelled' ? 'bg-red-100 text-red-700' :
//           'bg-blue-100 text-blue-700'
//         }`}>
//           {value}
//         </span>
//       ),
//     },
//     {
//       key: 'amount',
//       label: 'Amount',
//       render: (value: number) => (
//         <span className="text-sm">¥{value?.toLocaleString() ?? 0}</span>
//       ),
//     },
//     {
//       key: 'paymentStatus',
//       label: 'Payment',
//       render: (value: string) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           value === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
//         }`}>
//           {value}
//         </span>
//       ),
//     },
//     {
//       key: 'id',
//       label: 'Actions',
//       render: (_: string, item: JapanVisitApplication) => {
//         const client = getClientData(item.clientId);
//         return (
//           <div className="flex justify-end gap-2">
//             {client && <PrintAddressButton client={client} />}
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setSelectedApplication(item);
//                 setIsHisabKitabOpen(true);
//               }}
//               title="View HisabKitab"
//             >
//               <Calculator className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setSelectedApplication(item);
//                 setIsEditModalOpen(true);
//               }}
//             >
//               Edit
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handleDelete(item.id)}
//               className="text-red-500 hover:text-red-700"
//             >
//               Delete
//             </Button>
//           </div>
//         );
//       },
//     },
//   ];

//   return (
//     <div>
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <Plane className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">Japan Visit Applications</h1>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <select
//               value={selectedPackage}
//               onChange={(e) => setSelectedPackage(e.target.value)}
//               className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="">All Packages</option>
//               <option value="Standard Package">Standard Package</option>
//               <option value="Premium Package">Premium Package</option>
//             </select>

//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 type="search"
//                 placeholder="Search applications..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Button onClick={() => setIsAddModalOpen(true)}>
//               <Plus className="h-4 w-4 mr-2" />
//               New Application
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="mt-6">
//         <DataTable
//           columns={columns}
//           data={filteredApplications}
//           searchable={false}
//         />
//       </div>

//       <AddApplicationModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />

//       {selectedApplication && (
//         <>
//           <EditApplicationModal
//             isOpen={isEditModalOpen}
//             onClose={() => {
//               setIsEditModalOpen(false);
//               setSelectedApplication(null);
//             }}
//             application={selectedApplication}
//           />

//           <HisabKitabModal
//             isOpen={isHisabKitabOpen}
//             onClose={() => {
//               setIsHisabKitabOpen(false);
//               setSelectedApplication(null);
//             }}
//             application={selectedApplication}
//           />
//         </>
//       )}
//     </div>
//   );
// }















import { useState, useEffect } from 'react';
import axios from 'axios'; 
import { Plane, Plus, Search, Calculator, Printer } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useStore } from '../../store';
import AddApplicationModal from './AddApplicationModal';
import EditApplicationModal from './EditApplicationModal';
import HisabKitabModal from '../../components/HisabKitabModal';
import DataTable from '../../components/DataTable';
import PrintAddressButton from '../../components/PrintAddressButton';
import type { JapanVisitApplication } from '../../types';
import toast from 'react-hot-toast';

export default function JapanVisitPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JapanVisitApplication | null>(null);
  const [applications, setApplications] = useState<JapanVisitApplication[]>([]); // Ensure it's initialized as an empty array
  const clients = useStore((state) => state.clients); // Assuming clients are fetched/stored in the global state


  // Fetch Japan visit applications data from the API using Axios
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/japanVisit/getAllJapanVisitApplication`);  
      const applicationsData = response.data?.data; 
      if (Array.isArray(applicationsData)) {
        setApplications(applicationsData); 
      } else {
        setApplications([]); 
      }
    } catch (error) {
      // console.error('Error fetching applications:', error);
      setApplications([]); // Fallback to an empty array
    }
  };
  useEffect(() => {
    fetchApplications();
  }, []);
  

  const handleDelete = async (_id:any) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        // Sending a DELETE request to the API endpoint
        const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/japanVisit/deleteJapanVisitApplication/${_id}`);
  
        // Check if the deletion was successful
        if (response.data.success) {
          // Remove the application from the state
          setApplications((prevApplications) => prevApplications.filter((app) => app.id !== _id));
          fetchApplications();
          toast.success('Application deleted successfully!');
        } else {
          toast.error('Failed to delete application.');
        }
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error('Error deleting application. Please try again.');
      }
    }
  };
  

  const formatPhoneForViber = (phone: string | undefined | null): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const getClientData = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  const filteredApplications = Array.isArray(applications)
  ? applications.filter((app) => {
      const clientName = app.clientId?.name || '';  // Safely access clientName
      const matchesSearch =
        clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (app.reasonForVisit?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPackage = !selectedPackage || app.package === selectedPackage;
      return matchesSearch && matchesPackage;
    })
  : [];




  const columns = [
    {
      key: 'clientName',
      label: 'Client',
      render: (value: string, item: JapanVisitApplication) => {
        const clientName = item.clientId?.name || 'Unknown Name';  // Fallback if clientName is undefined
        return (
          <div>
            <p className="font-medium">{clientName}</p>
          </div>
        );
      },
    },

    {
      key: 'mobileNo',
      label: 'Contact',
      render: (value: string | undefined | null) => {
        if (!value) return <span className="text-gray-400">No contact</span>;
        return (
          <a 
            href={`viber://chat?number=${formatPhoneForViber(value)}`}
            className="text-brand-black hover:text-brand-yellow"
          >
            {value}
          </a>
        );
      },
    },
    {
      key: 'applicationStatus',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Completed' ? 'bg-green-100 text-green-700' :
          value === 'Cancelled' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => (
        <span className="text-sm">¥{value?.toLocaleString() ?? 0}</span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, item: JapanVisitApplication) => {
        const client = getClientData(item.clientId);
        return (
          <div className="flex justify-end gap-2">
            {client && <PrintAddressButton client={client} />}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedApplication(item);
                setIsHisabKitabOpen(true);
              }}
              title="View HisabKitab"
            >
              <Calculator className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedApplication(item);
                setIsEditModalOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item._id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Japan Visit Applications</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">All Packages</option>
              <option value="Standard Package">Standard Package</option>
              <option value="Premium Package">Premium Package</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredApplications}
          searchable={false}
        />
      </div>

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        fetchApplications = {fetchApplications}
      />

      {selectedApplication && (
        <>
          <EditApplicationModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedApplication(null);
            }}
            fetchApplications = {fetchApplications}
            application={selectedApplication}
          />


          <HisabKitabModal
            isOpen={isHisabKitabOpen}
            onClose={() => {
              setIsHisabKitabOpen(false);
              setSelectedApplication(null);
            }}
            application={selectedApplication}
          />
        </>
      )}
    </div>
  );
}



