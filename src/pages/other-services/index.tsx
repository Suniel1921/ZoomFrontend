// import { useState } from 'react';
// import { Briefcase, Plus, Search, Calculator } from 'lucide-react';
// import Input from '../../components/Input';
// import Button from '../../components/Button';
// import { useStore } from '../../store';
// import AddServiceModal from './AddServiceModal';
// import EditServiceModal from './EditServiceModal';
// import HisabKitabModal from '../../components/HisabKitabModal';
// import DataTable from '../../components/DataTable';
// import type { OtherService } from '../../types/otherService';
// import { SERVICE_TYPES } from '../../constants/serviceTypes';

// export default function OtherServicesPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedType, setSelectedType] = useState<string>('');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
//   const [selectedService, setSelectedService] = useState<OtherService | null>(null);

//   const { otherServices = [], deleteOtherService } = useStore();

//   // Filter services based on search query and type
//   const filteredServices = otherServices.filter(service => {
//     const matchesSearch = service.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          (service.serviceTypes || []).some(type => type.toLowerCase().includes(searchQuery.toLowerCase()));
//     const matchesType = !selectedType || (service.serviceTypes || []).includes(selectedType as any);
//     return matchesSearch && matchesType;
//   });

//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this service?')) {
//       deleteOtherService(id);
//     }
//   };

//   const formatPhoneForViber = (phone: string | undefined | null): string => {
//     if (!phone) return '';
//     return phone.replace(/\D/g, '');
//   };

//   const columns = [
//     {
//       key: 'clientName' as keyof OtherService,
//       label: 'Client',
//       render: (value: string) => (
//         <div>
//           <p className="font-medium">{value}</p>
//         </div>
//       ),
//     },
//     {
//       key: 'mobileNo' as keyof OtherService,
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
//       key: 'serviceTypes' as keyof OtherService,
//       label: 'Service Types',
//       render: (value: string[], item: OtherService) => (
//         <div className="space-y-1">
//           {(value || []).map((type, index) => (
//             <span
//               key={`${item.id}-${index}`}
//               className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-black mr-1 mb-1"
//             >
//               {type}
//             </span>
//           ))}
//           {item.otherServiceDetails && (
//             <p className="text-sm text-gray-500">{item.otherServiceDetails}</p>
//           )}
//         </div>
//       ),
//     },
//     {
//       key: 'amount' as keyof OtherService,
//       label: 'Amount',
//       render: (value: number) => (
//         <span className="text-sm">¥{value?.toLocaleString() ?? 0}</span>
//       ),
//     },
//     {
//       key: 'paymentStatus' as keyof OtherService,
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
//       key: 'jobStatus' as keyof OtherService,
//       label: 'Status',
//       render: (value: string) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           value === 'Completed' ? 'bg-green-100 text-green-700' :
//           value === 'Under Process' ? 'bg-blue-100 text-blue-700' :
//           'bg-gray-100 text-gray-700'
//         }`}>
//           {value}
//         </span>
//       ),
//     },
//     {
//       key: 'id' as keyof OtherService,
//       label: 'Actions',
//       render: (_: string, item: OtherService) => (
//         <div className="flex justify-end gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               setSelectedService(item);
//               setIsHisabKitabOpen(true);
//             }}
//             title="View HisabKitab"
//           >
//             <Calculator className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               setSelectedService(item);
//               setIsEditModalOpen(true);
//             }}
//           >
//             Edit
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handleDelete(item.id)}
//             className="text-red-500 hover:text-red-700"
//           >
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <Briefcase className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">Other Services</h1>
//           </div>

//           <div className="flex items-center gap-4">
//             <select
//               value={selectedType}
//               onChange={(e) => setSelectedType(e.target.value)}
//               className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="">All Services</option>
//               {SERVICE_TYPES.map((type) => (
//                 <option key={type} value={type}>{type}</option>
//               ))}
//             </select>

//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 type="search"
//                 placeholder="Search services..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             <Button onClick={() => setIsAddModalOpen(true)}>
//               <Plus className="h-4 w-4 mr-2" />
//               New Service
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="mt-6">
//         <DataTable
//           columns={columns}
//           data={filteredServices}
//           searchable={false}
//         />
//       </div>

//       <AddServiceModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />

//       {selectedService && (
//         <>
//           <EditServiceModal
//             isOpen={isEditModalOpen}
//             onClose={() => {
//               setIsEditModalOpen(false);
//               setSelectedService(null);
//             }}
//             service={selectedService}
//           />

//           <HisabKitabModal
//             isOpen={isHisabKitabOpen}
//             onClose={() => {
//               setIsHisabKitabOpen(false);
//               setSelectedService(null);
//             }}
//             application={selectedService}
//           />
//         </>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Briefcase, Plus, Search, Calculator } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useStore } from "../../store";
import AddServiceModal from "./AddServiceModal";
import EditServiceModal from "./EditServiceModal";
import HisabKitabModal from "../../components/HisabKitabModal";
import DataTable from "../../components/DataTable";
import { SERVICE_TYPES } from "../../constants/serviceTypes";
import axios from "axios";
import { OtherService } from "../../types/otherService";
import toast from "react-hot-toast";
import { useAuthGlobally } from "../../context/AuthContext";

export default function OtherServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [otherServices, setOtherServices] = useState<any[]>([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Loading state for API request
  const [auth] = useAuthGlobally();

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_URL
        }/api/v1/otherServices/getAllOtherServices`
      );

      // Check if the response contains a valid 'data' property that is an array
      if (Array.isArray(response.data.data)) {
        setOtherServices(response.data.data); // Set the 'data' array into the state
      } else {
        console.error("Unexpected data format:", response.data); // Log the unexpected response
        setOtherServices([]); // If the data format is wrong, set to empty array
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setOtherServices([]); // On error, set to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services based on search query and type
  const filteredServices = otherServices.filter((service) => {
    const matchesSearch =
      service.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.serviceTypes &&
        (service.serviceTypes as string[]).some((type) =>
          type?.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    const matchesType =
      !selectedType || (service.serviceTypes || []).includes(selectedType);
    const hasClientId =
      service.clientId !== null && service.clientId !== undefined; // Check for clientId
    return matchesSearch && matchesType && hasClientId;
  });

  const handleDelete = async (_id: string) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        // Send the delete request
        const response = await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_URL
          }/api/v1/otherServices/deleteOtherServices/${_id}`
        );
        // Check if the response was successful
        if (response?.data?.success) {
          // Remove the deleted application from the local state
          // setEpassportApplications((prev) => prev.filter((app) => app.id !== _id));
          toast.success("Application deleted successfully!");

          // Fetch the updated list of applications
          fetchServices(); // <-- This will refresh the list after delete
        } else {
          toast.error("Failed to delete the application.");
        }
      } catch (error) {
        // Catch and handle any errors during the delete operation
        console.error("Error deleting application:", error);
        toast.error("An error occurred while deleting the application.");
      }
    }
  };
  const formatPhoneForViber = (phone: string | undefined | null): string => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };

  const columns = [
    {
      key: "clientName",
      label: "Client",
      render: (value: string, row: OtherService) => (
        <div>
          <p className="font-medium">
            {row.clientId?.name || "Unknown Client"}
          </p>
        </div>
      ),
    },
    {
      key: "clientId",
      label: "Contact",
      render: (value: string, row: OtherService) => {
        // console.log('row.clientId:', row.clientId);
        const phone = row.clientId?.phone;
        // console.log('phone is:', phone);
        if (!phone) {
          return <span className="text-gray-400">No contact</span>;
        }
        return (
          <a
            href={`viber://chat?number=${formatPhoneForViber(phone)}`}
            className="text-brand-black hover:text-brand-yellow"
          >
            {phone}
          </a>
        );
      },
    },
    {
      key: "serviceTypes",
      label: "Service Types",
      render: (value: string[], item: any) => (
        <div className="space-y-1">
          {(value || []).map((type, index) => (
            <span
              key={`${item.id}-${index}`}
              className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-black mr-1 mb-1"
            >
              {type}
            </span>
          ))}
          {item.otherServiceDetails && (
            <p className="text-sm text-gray-500">{item.otherServiceDetails}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => (
        <span className="text-sm">¥{value?.toLocaleString() ?? 0}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "jobStatus",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Completed"
              ? "bg-green-100 text-green-700"
              : value === "Under Process"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: string, item: any) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedService(item);
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
              setSelectedService(item);
              setIsEditModalOpen(true);
            }}
          >
            Edit
          </Button>
          {/* <Button variant="outline" size="sm" onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700">
            Delete
          </Button> */}

          {auth.user.role === "superadmin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item._id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">
              Other Services
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 w-64"
            >
              <option value="">All Services</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div>Loading services...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredServices}
            searchable={false}
          />
        )}
      </div>

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        fetchServices={fetchServices}
      />
      {selectedService && (
        <>
          <EditServiceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedService(null);
            }}
            service={selectedService}
            fetchServices={fetchServices}
          />
          <HisabKitabModal
            isOpen={isHisabKitabOpen}
            onClose={() => {
              setIsHisabKitabOpen(false);
              setSelectedService(null);
            }}
            application={selectedService}
          />
        </>
      )}
    </div>
  );
}
