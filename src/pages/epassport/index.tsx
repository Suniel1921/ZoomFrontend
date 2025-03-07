import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Calculator, 
  Upload, 
  Eye, 
  Download, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Users // Icon for additional clients indicator
} from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import AddEpassportModal from "./AddEpassportModal";
import EditEpassportModal from "./EditEpassportModal";
import HisabKitabModal from "../../components/HisabKitabModal";
import PDFUploadModal from "./PDFUploadModal";
import PDFPreviewModal from "./PDFPreviewModal";
import DataTable from "../../components/DataTable";
import { PREFECTURES } from "../../constants/prefectures";
import axios from "axios";
import type { EpassportApplication } from "../../types";
import toast from "react-hot-toast";
import { useAuthGlobally } from "../../context/AuthContext";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "react-datepicker/dist/react-datepicker.css";
import ClientTableSkeleton from "../../components/skeletonEffect/ClientTableSkeleton";
import DeleteConfirmationModal from "../../components/deleteConfirmationModal/DeleteConfirmationModal";

const APPLICATION_TYPES = [
  "Newborn Child",
  "Passport Renewal",
  "Lost Passport",
  "Damaged Passport",
  "Travel Document",
  "Birth Registration",
] as const;

const STATUS_FILTERS = [
  "Waiting for Payment",
  "Completed",
  "Processing",
] as const;

export default function EpassportPage() {
  // State declarations
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [isPDFUploadOpen, setIsPDFUploadOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<EpassportApplication | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<EpassportApplication | null>(null);
  const [epassportApplications, setEpassportApplications] = useState<EpassportApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [auth] = useAuthGlobally();

  // API call to fetch applications
  const getAllEPassportApplication = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/getAllePassports`);
      if (response.data.success) {
        const applications = Array.isArray(response.data.data) ? response.data.data : [];
        const sortedApplications = applications.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setEpassportApplications(sortedApplications);
      } else {
        console.error("API responded with success false:", response.data);
        setEpassportApplications([]);
      }
    } catch (error) {
      console.error("Error fetching ePassport applications:", error);
      toast.error("Failed to fetch ePassport applications");
      setEpassportApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllEPassportApplication();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedLocation, selectedStatus, searchQuery]);

  // Filtering logic
  const filteredApplications = epassportApplications.filter((app) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      app.clientId?.name?.toLowerCase().includes(searchLower) || 
      app.applicationType?.toLowerCase().includes(searchLower) || 
      false;
    const matchesType = !selectedType || app.applicationType === selectedType;
    const matchesLocation = !selectedLocation || (app.ghumtiService && app.prefecture === selectedLocation);
    const matchesStatus = !selectedStatus || 
      (selectedStatus === "Waiting for Payment" && app.applicationStatus === "Waiting for Payment") ||
      (selectedStatus === "Completed" && app.applicationStatus === "Completed") ||
      (selectedStatus === "Processing" && app.applicationStatus === "Processing");

    return matchesSearch && matchesType && matchesLocation && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Helper functions
  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  const formatPhoneForViber = (phone: string | undefined | null): string => 
    phone?.replace(/\D/g, "") || "";

  const calculatePaymentStatus = (amount: number, paidAmount: number, discount: number) => 
    (amount - paidAmount - discount) <= 0 ? "Paid" : "Due";

  const initiateDelete = (application: EpassportApplication) => {
    setApplicationToDelete(application);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!applicationToDelete) return;
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/deleteEpassport/${applicationToDelete._id}`
      );
      if (response?.data?.success) {
        toast.success("Application deleted successfully!");
        setIsDeleteModalOpen(false);
        setApplicationToDelete(null);
        getAllEPassportApplication();
      } else {
        toast.error("Failed to delete the application.");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("An error occurred while deleting the application.");
    }
  };

  const handleDownload = async (clientFiles: string[]) => {
    try {
      if (!clientFiles?.length) {
        toast.error("No files available for download.");
        return;
      }
      const zip = new JSZip();
      await Promise.all(clientFiles.map(async (fileUrl, index) => {
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error(`Failed to fetch ${fileUrl}`);
          const blob = await response.blob();
          const fileName = fileUrl.split("/").pop() || `file_${index + 1}.pdf`;
          zip.file(fileName, blob);
        } catch (error: any) {
          console.warn(`Skipping ${fileUrl}: ${error.message}`);
        }
      }));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "documents.zip");
      toast.success("Files downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Error downloading files.");
    }
  };

  const handleDateChange = async (deadline: Date, application: EpassportApplication) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/updateEpassport/${application._id}`,
        { createdAt: deadline.toISOString() }
      );
      if (response.data.success) {
        toast.success("Date updated successfully!");
        getAllEPassportApplication();
      } else {
        toast.error("Failed to update the date.");
      }
    } catch (error) {
      console.error("Error updating date:", error);
      toast.error("An error occurred while updating the date.");
    }
  };

  // Table columns definition
  const columns = [
    {
      key: "clientName",
      label: "Client",
      render: (_: string, item: EpassportApplication) => (
        <div className="flex items-center gap-2">
          <p className="font-medium">{item.clientId?.name || "Unknown Name"}</p>
          {item.additionalClients && item.additionalClients.length > 0 && (
            <Users 
              className="h-4 w-4 text-red-500 hover:animate-pulse" 
              title={`Additional Clients: ${item.additionalClients.length}`} 
            />
          )}
        </div>
      ),
    },
    {
      key: "clientPhone",
      label: "Contact",
      render: (_: string, item: EpassportApplication) => {
        const phone = item.clientId?.phone;
        if (!phone) return <span className="text-gray-400">No contact</span>;
        const formattedPhone = formatPhoneForViber(phone);
        return formattedPhone ? (
          <a href={`viber://chat?number=${formattedPhone}`} className="text-brand-black hover:text-brand-yellow">
            {phone}
          </a>
        ) : (
          <span className="text-gray-400">Invalid number</span>
        );
      },
    },
    {
      key: "applicationType",
      label: "Type",
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-black">
          {value}
        </span>
      ),
    },
    {
      key: "applicationStatus",
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
      render: (value: number) => <span className="text-sm">¥{value?.toLocaleString() ?? 0}</span>,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (_: string, item: EpassportApplication) => {
        const status = calculatePaymentStatus(item.amount, item.paidAmount, item.discount);
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (value: string, item: EpassportApplication) => (
        <div className="flex items-center gap-2">
          <span>{new Date(value).toLocaleDateString("en-CA")}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedApplication(item);
              setIsEditModalOpen(true);
            }}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: string, item: EpassportApplication) => (
        <div className="flex justify-end gap-2">
          {/* Always show Upload button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedApplication(item);
              setIsPDFUploadOpen(true);
            }}
            title="Upload PDF"
          >
            <Upload className="h-4 w-4" />
          </Button>
          
          {/* Show Preview and Download buttons only if files exist */}
          {item.clientFiles?.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(item.clientFiles)}
                title="Download All Files"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedApplication(item);
                  setIsPDFPreviewOpen(true);
                }}
                title="Preview File"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </>
          )}
          
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
      ),
    },
  ];

  // Dropdown styling
  const selectClassName = "flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 w-64";

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">ePassport Applications</h1>
          </div>

          <div className="flex items-center gap-4">
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={selectClassName}>
              <option value="">All Types</option>
              {APPLICATION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className={selectClassName}>
              <option value="">All Locations</option>
              {PREFECTURES.map((prefecture) => (
                <option key={prefecture} value={prefecture}>{prefecture}</option>
              ))}
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={selectClassName}>
              <option value="">All Statuses</option>
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
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
          <>
            <DataTable columns={columns} data={currentItems} searchable={false} />
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline">
                  Previous
                </Button>
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline">
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredApplications.length)}</span> of{" "}
                    <span className="font-medium">{filteredApplications.length}</span> results
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline" size="sm">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AddEpassportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        getAllEPassportApplication={getAllEPassportApplication}
      />

      {selectedApplication && (
        <>
          <EditEpassportModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedApplication(null);
            }}
            getAllEPassportApplication={getAllEPassportApplication}
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
          <PDFUploadModal
            isOpen={isPDFUploadOpen}
            onClose={() => {
              setIsPDFUploadOpen(false);
              setSelectedApplication(null);
            }}
            application={selectedApplication}
            getAllEPassportApplication={getAllEPassportApplication}
          />
          {selectedApplication.clientFiles && (
            <PDFPreviewModal
              isOpen={isPDFPreviewOpen}
              onClose={() => {
                setIsPDFPreviewOpen(false);
                setSelectedApplication(null);
              }}
              fileUrls={selectedApplication.clientFiles}
              fileName={selectedApplication.clientFiles[0]?.split("/").pop() || "document.pdf"}
            />
          )}
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