// import { useState } from 'react';
// import { Users, Plus, Pencil, Trash2, Mail, Phone, Upload } from 'lucide-react';
// import Input from '../../components/Input';
// import Button from '../../components/Button';
// import { useStore } from '../../store';
// import { useAdminStore } from '../../store/adminStore';
// import AddClientModal from './AddClientModal';
// import EditClientModal from './EditClientModal';
// import ImportClientsModal from './ImportClientsModal';
// import PrintAddressButton from '../../components/PrintAddressButton';
// import CategoryBadge from '../../components/CategoryBadge';
// import type { Client, ClientCategory } from '../../types';

// export default function ClientsPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<ClientCategory | 'all'>('all');
//   const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
//   const [selectedClient, setSelectedClient] = useState<Client | null>(null);
//   const { clients, deleteClient } = useStore();
//   const { currentAdmin } = useAdminStore();
//   const isSuper = currentAdmin?.role === 'super_admin';

//   // Filter clients based on all criteria
//   const filteredClients = clients.filter(client => 
//     (selectedCategory === 'all' || client.category === selectedCategory) &&
//     (selectedStatus === 'all' || client.status === selectedStatus) &&
//     (searchQuery === '' || 
//      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//      client.email.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   const categories: ClientCategory[] = [
//     'Visit Visa Applicant',
//     'Japan Visit Visa Applicant',
//     'Document Translation',
//     'Student Visa Applicant',
//     'Epassport Applicant',
//     'Japan Visa',
//     'General Consultation'
//   ];

//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this client?')) {
//       deleteClient(id);
//     }
//   };

//   const formatPhoneForViber = (phone: string) => {
//     return phone.replace(/\D/g, '');
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <Users className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
//           </div>

//           <div className="flex items-center gap-4">
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value as ClientCategory | 'all')}
//               className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="all">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={selectedStatus}
//               onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
//               className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>

//             <div className="relative">
//               <Input
//                 type="search"
//                 placeholder="Search clients..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-64"
//               />
//             </div>

//             <div className="flex gap-2">
//               <Button onClick={() => setIsAddModalOpen(true)}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Client
//               </Button>

//               {isSuper && (
//                 <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
//                   <Upload className="h-4 w-4 mr-2" />
//                   Import
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Clients List */}
//       <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredClients.map((client) => (
//                 <tr key={client.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center gap-3">
//                       {client.profilePhoto ? (
//                         <img 
//                           src={client.profilePhoto} 
//                           alt={client.name}
//                           className="h-10 w-10 rounded-full object-cover"
//                         />
//                       ) : (
//                         <div className="h-10 w-10 rounded-full bg-brand-yellow/10 flex items-center justify-center">
//                           <span className="text-brand-black font-medium">
//                             {client.name.split(' ').map(n => n[0]).join('')}
//                           </span>
//                         </div>
//                       )}
//                       <div>
//                         <p className="font-medium text-brand-black">{client.name}</p>
//                         <p className="text-sm text-gray-500">{client.nationality}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-2">
//                         <Mail className="h-4 w-4 text-gray-400" />
//                         <span>{client.email}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Phone className="h-4 w-4 text-gray-400" />
//                         <span>
//                           <a 
//                             href={`viber://chat?number=${formatPhoneForViber(client.phone)}`}
//                             className="text-brand-black hover:text-brand-yellow"
//                           >
//                             {client.phone}
//                           </a>
//                         </span>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <CategoryBadge category={client.category} />
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       client.status === 'active' 
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-gray-100 text-gray-700'
//                     }`}>
//                       {client.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex justify-end gap-2">
//                       <PrintAddressButton client={client} />
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => {
//                           setSelectedClient(client);
//                           setIsEditModalOpen(true);
//                         }}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleDelete(client.id)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modals */}
//       <AddClientModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />

//       {selectedClient && (
//         <EditClientModal
//           isOpen={isEditModalOpen}
//           onClose={() => {
//             setIsEditModalOpen(false);
//             setSelectedClient(null);
//           }}
//           client={selectedClient}
//         />
//       )}

//       <ImportClientsModal
//         isOpen={isImportModalOpen}
//         onClose={() => setIsImportModalOpen(false)}
//       />
//     </div>
//   );
// }






// *************NEW CODE***********

import { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Mail, Phone, Upload } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import AddClientModal from './AddClientModal';
import EditClientModal from './EditClientModal';
import ImportClientsModal from './ImportClientsModal';
import PrintAddressButton from '../../components/PrintAddressButton';
import CategoryBadge from '../../components/CategoryBadge';
import axios from 'axios';
import type { Client, ClientCategory } from '../../types';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);  // Local state to store the clients list
  const [loading, setLoading] = useState(false);  // Loading state for fetching clients
  const [error, setError] = useState<string | null>(null);  // Error state for handling errors during fetch

  const { currentAdmin } = useAdminStore();
  const isSuper = currentAdmin?.role === 'super_admin';

  // Categories for filtering
  const categories: ClientCategory[] = [
    'Visit Visa Applicant',
    'Japan Visit Visa Applicant',
    'Document Translation',
    'Student Visa Applicant',
    'Epassport Applicant',
    'Japan Visa',
    'General Consultation'
  ];

  // Fetch clients from backend API

  const getAllClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`);
      console.log(response)
      setClients(response.data); 
    } catch (error) {
      setError('Failed to fetch clients.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getAllClients();
  }, []);

  // Filter clients based on all criteria
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      (selectedCategory === 'all' || client.category === selectedCategory) &&
      (selectedStatus === 'all' || client.status === selectedStatus) &&
      (searchQuery === '' ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, selectedCategory, selectedStatus, searchQuery]);

  const handleDeletes = (_id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      // Send DELETE request to the backend with the correct client ID
      axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/deleteClient/${_id}`)
        .then((response) => {
          toast.success(response.data.message);
          // console.log('Client deleted:', response.data);
          getAllClients();
          // Remove the client from the local state after deletion
          // setClients((prevClients) => prevClients.filter(client => client._id !== _id));  // Correct usage of _id
        })
        .catch((error) => {
          console.error('Delete failed:', error);
          if (error.response) {
            toast.error('Something went wrong');
          }
        });
    }
  };

  const formatPhoneForViber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ClientCategory | 'all')}
              className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="relative">
              <Input
                type="search"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Button>

              {isSuper && (
                <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {loading && <div className="text-center py-4">Loading clients...</div>}
          {error && <div className="text-center py-4 text-red-500">{error}</div>}

          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {client.profilePhoto ? (
                          <img
                            src={client.profilePhoto}
                            alt={client.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                            <span className="text-brand-black font-medium">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-brand-black">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.nationality}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>
                            <a
                              href={`viber://chat?number=${formatPhoneForViber(client.phone)}`}
                              className="text-brand-black hover:text-brand-yellow"
                            >
                              {client.phone}
                            </a>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CategoryBadge category={client.category} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${client.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <PrintAddressButton client={client} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletes(client._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        getAllClients={getAllClients}
      />

      {selectedClient && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          getAllClients={getAllClients}
          client={selectedClient}
        />
      )}


      <ImportClientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}

