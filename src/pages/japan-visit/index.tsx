import { useState, useEffect } from "react";
import axios from "axios";
import { Plane, Plus, Search, Calculator } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useStore } from "../../store";
import AddApplicationModal from "./AddApplicationModal";
import EditApplicationModal from "./EditApplicationModal";
import HisabKitabModal from "../../components/HisabKitabModal";
import DataTable from "../../components/DataTable";
import PrintAddressButton from "../../components/PrintAddressButton";
import type { JapanVisitApplication } from "../../types";
import toast from "react-hot-toast";
import { useAuthGlobally } from "../../context/AuthContext";
import ClientTableSkeleton from "../../components/skeletonEffect/ClientTableSkeleton";
import DeleteConfirmationModal from "../../components/deleteConfirmationModal/DeleteConfirmationModal";

export default function JapanVisitPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JapanVisitApplication | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<JapanVisitApplication | null>(null);
  const [applications, setApplications] = useState<JapanVisitApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const clients = useStore((state) => state.clients);
  const [auth] = useAuthGlobally();

  // Fetch Japan visit applications, sorted by createdAt ascending (oldest first)
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/japanVisit/getAllJapanVisitApplication`
      );
      const applicationsData = response.data?.data;
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle initiating deletion
  const initiateDelete = (application: JapanVisitApplication) => {
    setApplicationToDelete(application);
    setIsDeleteModalOpen(true);
  };

  // Handle confirmed deletion
  const handleDelete = async () => {
    if (!applicationToDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/japanVisit/deleteJapanVisitApplication/${applicationToDelete._id}`
      );
      if (response.data.success) {
        toast.success("Application deleted successfully!");
        setIsDeleteModalOpen(false);
        setApplicationToDelete(null);
        fetchApplications(); // Refresh list, oldest first
      } else {
        toast.error("Failed to delete application.");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Error deleting application. Please try again.");
    }
  };

  const formatPhoneForViber = (phone: string | undefined | null): string => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };

  const getClientData = (clientId: string) => {
    return clients.find((c) => c.id === clientId);
  };

  const filteredApplications = Array.isArray(applications)
    ? applications.filter((app) => {
        const clientName = app.clientId?.name || "";
        const matchesSearch =
          clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.reasonForVisit?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPackage = !selectedPackage || app.package === selectedPackage;
        const hasClientId = app.clientId !== null && app.clientId !== undefined;
        return matchesSearch && matchesPackage && hasClientId;
      })
    : [];

  const columns = [
    {
      key: "clientName",
      label: "Client",
      render: (value: string, item: JapanVisitApplication) => {
        const clientName = item.clientId?.name || "Unknown Name";
        return (
          <div>
            <p className="font-medium">{clientName}</p>
          </div>
        );
      },
    },
    {
      key: "mobileNo",
      label: "Contact",
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
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Completed"
              ? "bg-green-100 text-green-700"
              : value === "Cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {value}
        </span>
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
      key: "id",
      label: "Actions",
      render: (_: string, item: JapanVisitApplication) => {
        const client = getClientData(item.clientId as string);
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
            <h1 className="text-xl font-semibold text-gray-900">
              Japan Visit Applications
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 w-64"
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
        {isLoading ? (
          <ClientTableSkeleton />
        ) : (
          <DataTable columns={columns} data={filteredApplications} searchable={false} />
        )}
      </div>

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        fetchApplications={fetchApplications}
      />

      {selectedApplication && (
        <>
          <EditApplicationModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedApplication(null);
            }}
            fetchApplications={fetchApplications}
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

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        applicationName={applicationToDelete?.clientId?.name || "Unknown"}
      />
    </div>
  );
}

