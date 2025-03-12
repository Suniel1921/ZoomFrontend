
// ********************showing client id*****************


// import { useState, useMemo, useEffect, useCallback } from "react";
// import { Users, Plus, Pencil, Trash2, Mail, Phone, Upload, Eye, ChevronLeft, ChevronRight } from "lucide-react";
// import Button from "../../components/Button";
// import AddClientModal from "./AddClientModal";
// import EditClientModal from "./EditClientModal";
// import ImportClientsModal from "./ImportClientsModal";
// import PrintAddressButton from "../../components/PrintAddressButton";
// import CategoryBadge from "../../components/CategoryBadge";
// import axios from "axios";
// import type { Client, ClientCategory } from "../../types";
// import toast from "react-hot-toast";
// import { useAuthGlobally } from "../../context/AuthContext";
// import ClientTableSkeleton from "../../components/skeletonEffect/ClientTableSkeleton";
// import ProfilePhotoModal from "../../components/profilePhotoPreviewModal/ProfilePhotoModal";
// import DeleteConfirmationModal from "../../components/deleteConfirmationModal/DeleteConfirmationModal";
// import SearchableSelect from "../../components/SearchableSelect"; // Import SearchableSelect

// const ITEMS_PER_PAGE = 20;

// export default function ClientsPage() {
//   const [selectedClientId, setSelectedClientId] = useState<string | null>(null); // Track selected client ID
//   const [selectedCategory, setSelectedCategory] = useState<ClientCategory | "all">("all");
//   const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
//   const [selectedClient, setSelectedClient] = useState<Client | null>(null);
//   const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
//   const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | undefined>(undefined);
//   const [allClients, setAllClients] = useState<Client[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [auth] = useAuthGlobally();

//   const categories: ClientCategory[] = [
//     "Visit Visa Applicant",
//     "Japan Visit Visa Applicant",
//     "Document Translation",
//     "Student Visa Applicant",
//     "Epassport Applicant",
//     "Japan Visa",
//     "Graphic Design & Printing",
//     "Web Design & Seo",
//     "Birth Registration",
//     "Documentation Support",
//     "Other",
//   ];

//   const getAllClients = useCallback(async (forceRefresh = false) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`, {
//         params: { forceRefresh },
//       });
//       if (response.data.success) {
//         setAllClients(response.data.clients);
//       } else {
//         throw new Error("Unexpected response format");
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Failed to fetch clients.");
//       setError("Failed to fetch clients.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     getAllClients();
//   }, [getAllClients]);

//   // Map allClients to SearchableSelect options
//   const searchOptions = useMemo(() => {
//     return allClients.map((client) => ({
//       label: client.name,
//       value: client._id,
//       clientData: {
//         _id: client._id,
//         phone: client.phone,
//         profilePhoto: client.profilePhoto,
//       },
//     }));
//   }, [allClients]);

//   const filteredAndSortedClients = useMemo(() => {
//     return allClients
//       .filter((client) => {
//         const matchesCategory = selectedCategory === "all" || client.category === selectedCategory;
//         const matchesStatus = selectedStatus === "all" || client.status === selectedStatus;
//         if (!selectedClientId) return matchesCategory && matchesStatus; // Show all if no search selection
//         return client._id === selectedClientId && matchesCategory && matchesStatus; // Filter by selected ID
//       })
//       .sort((a, b) => {
//         const dateA = a.createdAt || a.dateJoined || new Date(0);
//         const dateB = b.createdAt || b.dateJoined || new Date(0);
//         const timeA = new Date(dateA).getTime();
//         const timeB = new Date(dateB).getTime();
//         return timeB - timeA; // Newest first
//       });
//   }, [allClients, selectedCategory, selectedStatus, selectedClientId]);

//   const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE);
//   const paginatedClients = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredAndSortedClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   }, [filteredAndSortedClients, currentPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedClientId, selectedCategory, selectedStatus]);

//   const initiateDelete = (client: Client) => {
//     setClientToDelete(client);
//     setIsDeleteModalOpen(true);
//   };

//   const handleDelete = async () => {
//     if (!clientToDelete) return;

//     try {
//       const response = await axios.delete(
//         `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/deleteClient/${clientToDelete._id}`
//       );
//       toast.success(response.data.message);
//       setIsDeleteModalOpen(false);
//       setClientToDelete(null);
//       getAllClients();
//     } catch (error) {
//       toast.error("Failed to delete client.");
//     }
//   };

//   const handlePhotoClick = (photoUrl: string | undefined) => {
//     setSelectedPhotoUrl(photoUrl);
//     setIsPhotoModalOpen(true);
//   };

//   const formatPhoneForViber = (phone: string) => phone.replace(/\D/g, "");

//   const downloadClientDetails = useCallback((client: Client) => {
//     const clientDetails = `
//     〒${client.postalCode}
//     ${client.prefecture}, ${client.city}, ${client.street} ${client.building}
//     ${client.name}様
//     ${client.phone}
//     `;
//     const blob = new Blob([clientDetails], { type: "text/plain" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${client.name}_details.txt`;
//     link.click();
//   }, []);

//   const getLastFourDigits = (id: string) => {
//     return id.slice(-4);
//   };

//   return (
//     <div className="space-y-6 px-4 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <Users className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">
//               Clients ({filteredAndSortedClients.length} total)
//             </h1>
//           </div>

//           <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value as ClientCategory | "all")}
//               className="flex h-10 w-full sm:w-40 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
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
//               onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "inactive")}
//               className="flex h-10 w-full sm:w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
//             >
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>

//             <div className="relative w-full sm:w-64">
//               <SearchableSelect
//                 options={searchOptions}
//                 value={selectedClientId}
//                 onChange={(newValue) => setSelectedClientId(newValue)}
//                 placeholder="Search by name or ID (last 4 digits)..."
//               />
//             </div>

//             <div className="flex gap-2 w-full sm:w-auto">
//               <Button
//                 onClick={() => setIsAddModalOpen(true)}
//                 className="w-full sm:w-auto flex items-center justify-center text-sm px-3 py-2 sm:px-4 sm:py-3"
//               >
//                 <Plus className="h-4 w-4 mr-0 sm:mr-2" />
//                 <span className="hidden sm:inline">New Client</span>
//               </Button>

//               <Button
//                 variant="outline"
//                 onClick={() => setIsImportModalOpen(true)}
//                 className="w-full sm:w-auto flex items-center justify-center text-sm px-3 py-2 sm:px-4 sm:py-2"
//               >
//                 <Upload className="h-4 w-4 mr-0 sm:mr-2" />
//                 <span className="hidden sm:inline">Import</span>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Clients List */}
//       <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
//         <div className="overflow-x-auto">
//           {loading ? (
//             <ClientTableSkeleton />
//           ) : error ? (
//             <div className="text-center py-4 text-red-500">{error}</div>
//           ) : allClients.length === 0 || filteredAndSortedClients.length === 0 ? (
//             <div className="text-center py-4">
//               {allClients.length === 0
//                 ? "No clients found."
//                 : selectedClientId
//                 ? "No clients found matching your search."
//                 : "No clients found matching the selected filters."}
//             </div>
//           ) : (
//             <>
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
//                       ID
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
//                       Name
//                     </th>
//                     <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
//                       Contact
//                     </th>
//                     <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
//                       Category
//                     </th>
//                     <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
//                       Status
//                     </th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {paginatedClients.map((client) => (
//                     <tr key={client._id} className="hover:bg-gray-50">
//                       <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
//                         <span className="text-sm text-gray-600">{getLastFourDigits(client._id)}</span>
//                       </td>
//                       <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
//                         <div className="flex items-center gap-3">
//                           {client.profilePhoto ? (
//                             <img
//                               src={client.profilePhoto || "/placeholder.svg"}
//                               alt={client.name}
//                               className="h-10 w-10 rounded-full object-cover cursor-pointer hover:shadow-lg transition-shadow duration-200"
//                               onClick={() => handlePhotoClick(client.profilePhoto)}
//                             />
//                           ) : (
//                             <div className="h-10 w-10 rounded-full bg-brand-yellow/10 flex items-center justify-center">
//                               <span className="text-brand-black font-medium">
//                                 {client.name
//                                   .split(" ")
//                                   .map((n) => n[0])
//                                   .join("")}
//                               </span>
//                             </div>
//                           )}
//                           <div>
//                             <p className="font-medium text-brand-black">{client.name}</p>
//                             <p className="text-sm text-gray-500">{client.nationality}</p>
//                             <div className="md:hidden mt-1 space-y-1">
//                               <div className="flex items-center gap-2">
//                                 <Mail className="h-4 w-4 text-gray-400" />
//                                 <span className="text-sm">{client.email}</span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <Phone className="h-4 w-4 text-gray-400" />
//                                 <a
//                                   href={`viber://chat?number=${formatPhoneForViber(client.phone)}`}
//                                   className="text-brand-black hover:text-brand-yellow text-sm"
//                                 >
//                                   {client.phone.length > 10 ? `${client.phone.slice(0, 11)}...` : client.phone}
//                                 </a>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="hidden md:table-cell px-4 py-4 sm:px-6 whitespace-nowrap">
//                         <div className="space-y-1">
//                           <div className="flex items-center gap-2">
//                             <Mail className="h-4 w-4 text-gray-400" />
//                             <span>{client.email}</span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Phone className="h-4 w-4 text-gray-400" />
//                             <span>
//                               <a
//                                 href={`viber://chat?number=${formatPhoneForViber(client.phone)}`}
//                                 className="text-brand-black hover:text-brand-yellow"
//                               >
//                                 {client.phone.length > 10 ? `${client.phone.slice(0, 11)}...` : client.phone}
//                               </a>
//                             </span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="hidden lg:table-cell px-4 py-4 sm:px-6 whitespace-nowrap">
//                         <CategoryBadge category={client.category || "import from CSV file"} />
//                       </td>
//                       <td className="hidden md:table-cell px-4 py-4 sm:px-6 whitespace-nowrap">
//                         <span
//                           className={`px-3 py-1 rounded-full text-sm font-medium ${
//                             client.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
//                           }`}
//                         >
//                           {client.status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-right text-sm font-medium">
//                         <div className="flex justify-end gap-2 flex-wrap">
//                           <PrintAddressButton client={client} />
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => downloadClientDetails(client)}
//                             className="text-yellow-500 hover:text-yellow-700"
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => {
//                               setSelectedClient(client);
//                               setIsEditModalOpen(true);
//                             }}
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </Button>
//                           {auth.user.role === "superadmin" && (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => initiateDelete(client)}
//                               className="text-red-500 hover:text-red-700"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {/* Pagination */}
//               <div className="px-4 py-4 sm:px-6 flex items-center justify-between border-t border-gray-200 flex-col sm:flex-row gap-4">
//                 <div className="flex-1 flex justify-between sm:hidden">
//                   <Button
//                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     variant="outline"
//                     className="w-full sm:w-auto"
//                   >
//                     Previous
//                   </Button>
//                   <Button
//                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     variant="outline"
//                     className="w-full sm:w-auto"
//                   >
//                     Next
//                   </Button>
//                 </div>
//                 <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//                   <div>
//                     <p className="text-sm text-gray-700">
//                       Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
//                       <span className="font-medium">
//                         {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedClients.length)}
//                       </span>{" "}
//                       of <span className="font-medium">{filteredAndSortedClients.length}</span> results
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                       disabled={currentPage === 1}
//                       variant="outline"
//                       size="sm"
//                     >
//                       <ChevronLeft className="h-4 w-4" />
//                       Previous
//                     </Button>
//                     <Button
//                       onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                       disabled={currentPage === totalPages}
//                       variant="outline"
//                       size="sm"
//                     >
//                       Next
//                       <ChevronRight className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       <AddClientModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//         getAllClients={getAllClients}
//       />

//       {selectedClient && (
//         <EditClientModal
//           isOpen={isEditModalOpen}
//           onClose={() => {
//             setIsEditModalOpen(false);
//             setSelectedClient(null);
//           }}
//           getAllClients={getAllClients}
//           client={selectedClient}
//         />
//       )}

//       <ImportClientsModal
//         isOpen={isImportModalOpen}
//         onClose={() => setIsImportModalOpen(false)}
//         getAllClients={getAllClients}
//       />

//       <DeleteConfirmationModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         onConfirm={handleDelete}
//         applicationName={clientToDelete?.name || "Unknown"}
//       />

//       <ProfilePhotoModal
//         isOpen={isPhotoModalOpen}
//         onClose={() => setIsPhotoModalOpen(false)}
//         photoUrl={selectedPhotoUrl}
//         clientName={selectedClient?.name || clientToDelete?.name || "Unknown"}
//       />
//     </div>
//   );
// }








import { useState, useMemo, useEffect, useCallback } from "react";
import { Users, Plus, Pencil, Trash2, Mail, Phone, Upload, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../components/Button";
import AddClientModal from "./AddClientModal";
import EditClientModal from "./EditClientModal";
import ImportClientsModal from "./ImportClientsModal";
import PrintAddressButton from "../../components/PrintAddressButton";
import CategoryBadge from "../../components/CategoryBadge";
import axios from "axios";
import type { Client, ClientCategory } from "../../types";
import toast from "react-hot-toast";
import { useAuthGlobally } from "../../context/AuthContext";
import ClientTableSkeleton from "../../components/skeletonEffect/ClientTableSkeleton";
import ProfilePhotoModal from "../../components/profilePhotoPreviewModal/ProfilePhotoModal";
import DeleteConfirmationModal from "../../components/deleteConfirmationModal/DeleteConfirmationModal";
import SearchableSelect from "../../components/SearchableSelect";

const ITEMS_PER_PAGE = 20;

export default function ClientsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | undefined>(undefined);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auth] = useAuthGlobally();

  const categories: ClientCategory[] = [
    "Visit Visa Applicant",
    "Japan Visit Visa Applicant",
    "Document Translation",
    "Student Visa Applicant",
    "Epassport Applicant",
    "Japan Visa",
    "Graphic Design & Printing",
    "Web Design & Seo",
    "Birth Registration",
    "Documentation Support",
    "Other",
  ];

  const getAllClients = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`, {
        params: { forceRefresh },
      });
      if (response.data.success) {
        setAllClients(response.data.clients);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch clients.");
      setError("Failed to fetch clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllClients();
  }, [getAllClients]);

  const searchOptions = useMemo(() => {
    return allClients.map((client) => ({
      label: client.name.toUpperCase(),
      value: client._id,
      clientData: {
        _id: client._id,
        phone: client.phone,
        profilePhoto: client.profilePhoto,
      },
    }));
  }, [allClients]);

  const filteredAndSortedClients = useMemo(() => {
    return allClients
      .filter((client) => {
        const matchesCategory = selectedCategory === "all" || client.category === selectedCategory;
        const matchesStatus = selectedStatus === "all" || client.status === selectedStatus;
        if (!selectedClientId) return matchesCategory && matchesStatus;
        return client._id === selectedClientId && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = a.createdAt || a.dateJoined || new Date(0);
        const dateB = b.createdAt || b.dateJoined || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
  }, [allClients, selectedCategory, selectedStatus, selectedClientId]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedClients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClientId, selectedCategory, selectedStatus]);

  const initiateDelete = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/deleteClient/${clientToDelete._id}`
      );
      toast.success(response.data.message);
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
      getAllClients();
    } catch (error) {
      toast.error("Failed to delete client.");
    }
  };

  const handlePhotoClick = (photoUrl: string | undefined) => {
    setSelectedPhotoUrl(photoUrl);
    setIsPhotoModalOpen(true);
  };

  const formatPhoneForViber = (phone: string) => phone.replace(/\D/g, "");

  const downloadClientDetails = useCallback((client: Client) => {
    const clientDetails = `
    〒${client.postalCode}
    ${client.prefecture}, ${client.city}, ${client.street} ${client.building}
    ${client.name.toUpperCase()}様
    ${client.phone}
    `;
    const blob = new Blob([clientDetails], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${client.name.toUpperCase()}_details.txt`;
    link.click();
  }, []);

  const getLastFourDigits = (id: string) => id.slice(-4);

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    const initials = words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
    return initials || "NA"; // Fallback if name is empty
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">
              Clients ({filteredAndSortedClients.length} total)
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ClientCategory | "all")}
              className="flex h-10 w-full sm:w-40 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20"
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
              onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "inactive")}
              className="flex h-10 w-full sm:w-32 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="relative w-full sm:w-64">
              <SearchableSelect
                options={searchOptions}
                value={selectedClientId}
                onChange={(newValue) => setSelectedClientId(newValue)}
                placeholder="Search client by name or ID"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center text-sm px-3 py-2 sm:px-4 sm:py-3">
                <Plus className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">New Client</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center text-sm px-3 py-2 sm:px-4 sm:py-2"
              >
                <Upload className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {loading ? (
            <ClientTableSkeleton />
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : allClients.length === 0 || filteredAndSortedClients.length === 0 ? (
            <div className="text-center py-4">
              {allClients.length === 0
                ? "No clients found."
                : selectedClientId
                ? "No clients found matching your search."
                : "No clients found matching the selected filters."}
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Name</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Contact</th>
                    <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Category</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{getLastFourDigits(client._id)}</span>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {client.profilePhoto ? (
                            <img
                              src={client.profilePhoto}
                              alt={client.name.toUpperCase()}
                              className="h-10 w-10 rounded-full object-cover cursor-pointer hover:shadow-lg transition-shadow duration-200"
                              onClick={() => handlePhotoClick(client.profilePhoto)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                              <span className="text-brand-black font-medium text-lg">
                                {getInitials(client.name)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-brand-black">{client.name.toUpperCase()}</p>
                            <p className="text-sm text-gray-500">{client.nationality}</p>
                            <div className="md:hidden mt-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{client.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <a
                                  href={`viber://chat?number=${formatPhoneForViber(client.phone)}`}
                                  className="text-brand-black hover:text-brand-yellow text-sm"
                                >
                                  {client.phone.length > 10 ? `${client.phone.slice(0, 11)}...` : client.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{client.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>
                              <a
                                href={`viber://chat?number=${formatPhoneForViber(client.phone)}`}
                                className="text-brand-black hover:text-brand-yellow"
                              >
                                {client.phone.length > 10 ? `${client.phone.slice(0, 11)}...` : client.phone}
                              </a>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-4 sm:px-6 whitespace-nowrap">
                        <CategoryBadge category={client.category || "import from CSV file"} />
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            client.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <PrintAddressButton client={client} />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadClientDetails(client)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                          {auth.user.role === "superadmin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => initiateDelete(client)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-4 py-4 sm:px-6 flex items-center justify-between border-t border-gray-200 flex-col sm:flex-row gap-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedClients.length)}
                      </span>{" "}
                      of <span className="font-medium">{filteredAndSortedClients.length}</span> results
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
        getAllClients={getAllClients}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        applicationName={clientToDelete?.name.toUpperCase() || "Unknown"}
      />

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photoUrl={selectedPhotoUrl}
        clientName={selectedClient?.name.toUpperCase() || clientToDelete?.name.toUpperCase() || "UNKNOWN"}
      />
    </div>
  );
}