import { useState, useEffect } from "react";
import { Palette, Plus, Search, Calculator, ChevronLeft, ChevronRight } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import DataTable from "../../components/DataTable";
import AmountCell from "../../components/AmountCell";
import AddDesignJobModal from "./AddDesignJobModal";
import EditDesignJobModal from "./EditDesignJobModal";
import HisabKitabModal from "../../components/HisabKitabModal";
import type { GraphicDesignJob } from "../../types/graphicDesign";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuthGlobally } from "../../context/AuthContext";
import ClientTableSkeleton from "../../components/skeletonEffect/ClientTableSkeleton";
import DeleteConfirmationModal from "../../components/deleteConfirmationModal/DeleteConfirmationModal";

const API_URL = import.meta.env.VITE_REACT_APP_URL;

const STATUS_CLASSES = {
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Processing: "bg-blue-100 text-blue-700", // Updated to match job status options
  "Waiting for Payment": "bg-yellow-100 text-yellow-700",
};

const PAYMENT_STATUS_CLASSES = {
  Paid: "bg-green-100 text-green-700",
  Due: "bg-red-100 text-red-700",
};

export default function GraphicDesignPage() {
  const [graphicDesignJobs, setGraphicDesignJobs] = useState<GraphicDesignJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<GraphicDesignJob | null>(null);
  const [jobToDelete, setJobToDelete] = useState<GraphicDesignJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [auth] = useAuthGlobally();

  const fetchGraphicDesignJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/graphicDesign/getAllGraphicDesign`
      );
      const data = Array.isArray(response.data.designJobs) ? response.data.designJobs : [];
      const sortedJobs = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
      setGraphicDesignJobs(sortedJobs);
    } catch (error) {
      console.error("Error fetching graphic design jobs:", error);
      toast.error("Failed to fetch graphic design jobs");
      setGraphicDesignJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphicDesignJobs();
  }, []);

  const filteredJobs = graphicDesignJobs.filter((job) => {
    const hasClientId = job.clientId !== null && job.clientId !== undefined;
    return (
      hasClientId &&
      [job.clientId?.name, job.businessName, job.designType].some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const initiateDelete = (job: GraphicDesignJob) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/graphicDesign/deleteGraphicDesign/${jobToDelete._id}`
      );
      if (response?.data?.success) {
        toast.success("Job deleted successfully!");
        setIsDeleteModalOpen(false);
        setJobToDelete(null);
        fetchGraphicDesignJobs();
      } else {
        toast.error("Failed to delete the job.");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("An error occurred while deleting the job.");
    }
  };

  const columns = [
    {
      key: "clientName",
      label: "Client",
      render: (value: string, item: GraphicDesignJob) => {
        const clientName = item.clientId?.name || "Unknown Name";
        return (
          <div>
            <p className="font-medium">{clientName}</p>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Job Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            STATUS_CLASSES[value as keyof typeof STATUS_CLASSES] || STATUS_CLASSES.Processing
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (_: unknown, item: GraphicDesignJob) => {
        const paymentStatus = item.dueAmount === 0 ? "Paid" : "Due";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              PAYMENT_STATUS_CLASSES[paymentStatus as keyof typeof PAYMENT_STATUS_CLASSES]
            }`}
          >
            {paymentStatus}
          </span>
        );
      },
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (value: string) => (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (_: unknown, item: GraphicDesignJob) => (
        <AmountCell
          amount={typeof item.amount === "number" ? item.amount : null}
          dueAmount={typeof item.dueAmount === "number" ? item.dueAmount : null}
        />
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: string, item: GraphicDesignJob) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedJob(item);
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
              setSelectedJob(item);
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
            <Palette className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">
              Graphic Design
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Design Job
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <ClientTableSkeleton />
        ) : (
          <>
            <DataTable columns={columns} data={currentItems} searchable={false} />
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredJobs.length)}</span> of{" "}
                    <span className="font-medium">{filteredJobs.length}</span> results
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
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

      <AddDesignJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        fetchGraphicDesignJobs={fetchGraphicDesignJobs}
      />

      {selectedJob && (
        <>
          <EditDesignJobModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedJob(null);
            }}
            fetchGraphicDesignJobs={fetchGraphicDesignJobs}
            job={selectedJob}
          />

          <HisabKitabModal
            isOpen={isHisabKitabOpen}
            onClose={() => {
              setIsHisabKitabOpen(false);
              setSelectedJob(null);
            }}
            application={selectedJob}
          />
        </>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        applicationName={jobToDelete?.clientId?.name || "Unknown"}
      />
    </div>
  );
}