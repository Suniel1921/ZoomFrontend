import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calculator, ChevronLeft, ChevronRight } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AddApplicationModal from './AddApplicationModal';
import EditApplicationModal from './EditApplicationModal';
import HisabKitabModal from '../../components/HisabKitabModal';
import DataTable from '../../components/DataTable';
import DeleteConfirmationModal from '../../components/deleteConfirmationModal/DeleteConfirmationModal';
import { countries } from '../../utils/countries';
import { Application } from '../../types';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthGlobally } from '../../context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Skeleton Loading Component
const ClientTableSkeleton = () => {
  return (
    <div>
      {/* Skeleton for table header */}
      <Skeleton height={50} width="100%" className="mb-4" />
      {/* Skeleton for table rows */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="mb-2">
          <Skeleton height={50} />
        </div>
      ))}
    </div>
  );
};

export default function VisaApplicantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const [itemsPerPage, setItemsPerPage] = useState(20); // New state for items per page
  const [auth] = useAuthGlobally();

  // Fetch all visa applications, sorted by createdAt descending (newest first)
  const getAllApplication = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/visaApplication/getAllVisaApplication`
      );
      const applicationsData = Array.isArray(response.data.data) ? response.data.data : [];
      // Sort applications by createdAt in descending order (newest first)
      const sortedApplications = applicationsData.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
      setApplications(sortedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllApplication();
  }, []);

  // Filter applications based on search query, country, and valid clientId
  const filteredApplications = (applications || []).filter((app) => {
    const matchesSearch =
      (app.clientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (app.type?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCountry = !selectedCountry || app.country === selectedCountry;
    const hasClientId = app.clientId !== null && app.clientId !== undefined;
    return matchesSearch && matchesCountry && hasClientId;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle initiating deletion
  const initiateDelete = (application: Application) => {
    setApplicationToDelete(application);
    setIsDeleteModalOpen(true);
  };

  // Handle confirmed deletion
  const handleDelete = async () => {
    if (!applicationToDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/visaApplication/deleteVisaApplication/${applicationToDelete._id}`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setIsDeleteModalOpen(false);
        setApplicationToDelete(null);
        getAllApplication();
      }
    } catch (error: any) {
      console.error('Error deleting application:', error);
      toast.error(error.response?.data?.message || 'Failed to delete application');
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'clientName',
      label: 'Client',
      render: (value: string, item: Application) => (
        <div>
          <p className="font-medium">{item.clientId?.name || 'N/A'}</p>
          <p className="text-sm text-gray-500">
            {item.type} - {item.country}
          </p>
        </div>
      ),
    },
    {
      key: 'visaStatus',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Completed'
              ? 'bg-green-100 text-green-700'
              : value === 'Cancelled'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value: string) => (
        <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (value: any) => (
        <div>
          <p className="text-sm">Total: ¥{(value?.total || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            Paid: ¥{(value?.paidAmount || 0).toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, item: Application) => (
        <div className="flex justify-end gap-2">
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
          {auth.user.role === 'superadmin' && (
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
            <FileText className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Visa Applications</h1>
          </div>

          <div className="flex items-center gap-4">
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

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 w-64"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>

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
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredApplications.length)}</span> of{" "}
                    <span className="font-medium">{filteredApplications.length}</span> results
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

      <AddApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        getAllApplication={getAllApplication}
      />

      {selectedApplication && (
        <>
          <EditApplicationModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedApplication(null);
            }}
            getAllApplication={getAllApplication}
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
        applicationName={applicationToDelete?.clientId?.name || 'Unknown'}
      />
    </div>
  );
}