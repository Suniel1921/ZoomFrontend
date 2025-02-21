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
import ClientTableSkeleton from "../../components/skeletonEffect/ClientTableSkeleton";
import DeleteConfirmationModal from "../../components/deleteConfirmationModal/DeleteConfirmationModal";

export default function OtherServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<OtherService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<OtherService | null>(null);
  const [otherServices, setOtherServices] = useState<OtherService[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth] = useAuthGlobally();

  // Fetch services, sorted by createdAt ascending (oldest first)
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/otherServices/getAllOtherServices`
      );
      if (Array.isArray(response.data.data)) {
        setOtherServices(response.data.data);
      } else {
        console.error("Unexpected data format:", response.data);
        setOtherServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
      setOtherServices([]);
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
      (service.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (service.clientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (service.serviceTypes &&
        (service.serviceTypes as string[]).some((type) =>
          type?.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    const matchesType = !selectedType || (service.serviceTypes || []).includes(selectedType);
    const hasClientId = service.clientId !== null && service.clientId !== undefined;
    return matchesSearch && matchesType && hasClientId;
  });

  // Handle initiating deletion
  const initiateDelete = (service: OtherService) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  // Handle confirmed deletion
  const handleDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/otherServices/deleteOtherServices/${serviceToDelete._id}`
      );
      if (response?.data?.success) {
        toast.success("Service deleted successfully!");
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
        fetchServices(); // Refresh list, oldest first
      } else {
        toast.error("Failed to delete the service.");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("An error occurred while deleting the service.");
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
            {row?.clientId?.name || row?.clientName || "Unknown Client"}
          </p>
        </div>
      ),
    },
    {
      key: "clientId",
      label: "Contact",
      render: (value: string, row: OtherService) => {
        const phone = row.clientId?.phone;
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
      render: (value: string[], item: OtherService) => (
        <div className="space-y-1">
          {(value || []).map((type, index) => (
            <span
              key={`${item._id}-${index}`}
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
      render: (_: string, item: OtherService) => (
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
          {auth.user.role === "superadmin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => initiateDelete(item)}
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
          <ClientTableSkeleton />
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

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        applicationName={serviceToDelete?.clientId?.name || serviceToDelete?.clientName || "Unknown"}
      />
    </div>
  );
}