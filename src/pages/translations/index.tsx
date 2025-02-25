import { useState, useEffect } from 'react';
import { Languages, Plus, Search, Calculator, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AddTranslationModal from './AddTranslationModal';
import EditTranslationModal from './EditTranslationModal';
import HisabKitabModal from '../../components/HisabKitabModal';
import DataTable from '../../components/DataTable';
import type { Translation } from '../../types';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthGlobally } from '../../context/AuthContext';
import ClientTableSkeleton from '../../components/skeletonEffect/ClientTableSkeleton'; // Assuming this path is correct
import DeleteConfirmationModal from '../../components/deleteConfirmationModal/DeleteConfirmationModal'; // Assuming this path is correct
import 'react-loading-skeleton/dist/skeleton.css';

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [translationToDelete, setTranslationToDelete] = useState<Translation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const [itemsPerPage, setItemsPerPage] = useState(20); // New state for items per page
  const [auth] = useAuthGlobally();

  // Fetch translations from API, sorted by createdAt descending (newest first)
  const getAllTranslations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/documentTranslation/getAllDocumentTranslation`
      );
      const data = Array.isArray(response.data.translations) ? response.data.translations : [];
      // Sort translations by createdAt in descending order (newest first)
      const sortedTranslations = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Newest first
      });
      setTranslations(sortedTranslations);
    } catch (error) {
      console.error('Error fetching document translations:', error);
      toast.error('Failed to fetch translations');
      setTranslations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllTranslations();
  }, []);

  // Filter translations based on search query, status, and valid clientId
  const filteredTranslations = translations.filter((trans) => {
    const clientName = trans.clientId?.name?.toLowerCase() || '';
    const matchesSearch = clientName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trans.translationStatus === statusFilter;
    const hasClientId = trans.clientId !== null && trans.clientId !== undefined;
    return matchesSearch && matchesStatus && hasClientId;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTranslations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTranslations.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatPhoneForViber = (phone: string | undefined | null): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const handleCopyName = (translation: Translation) => {
    navigator.clipboard.writeText(translation.nameInTargetScript);
    setCopiedId(translation._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle initiating deletion
  const initiateDelete = (translation: Translation) => {
    setTranslationToDelete(translation);
    setIsDeleteModalOpen(true);
  };

  // Handle confirmed deletion
  const handleDelete = async () => {
    if (!translationToDelete) return;

    toast.loading('Deleting translation...');
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/documentTranslation/deleteDocumentTranslation/${translationToDelete._id}`
      );
      if (response.data.success) {
        toast.dismiss();
        toast.success('Translation deleted successfully!');
        setIsDeleteModalOpen(false);
        setTranslationToDelete(null);
        getAllTranslations();
      } else {
        toast.dismiss();
        toast.error('Failed to delete translation.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to delete translation.');
      console.error('Error deleting translation:', error);
    }
  };

  const columns = [
    {
      key: 'clientName',
      label: 'Client',
      render: (value: string, row: Translation) => (
        <div>
          <p className="font-medium">{row.clientId?.name || 'Unknown Client'}</p>
        </div>
      ),
    },
    {
      key: 'clientId',
      label: 'Contact',
      render: (value: string, row: Translation) => {
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
      key: 'sourceLanguage',
      label: 'Translation Type',
      render: (_: string, item: Translation) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-black">
          {item.sourceLanguage} → {item.targetLanguage}
        </span>
      ),
    },
    {
      key: 'translationStatus',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Completed'
              ? 'bg-green-100 text-green-700'
              : value === 'Delivered'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-yellow-100 text-yellow-700'
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
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, item: Translation) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyName(item)}
            title="Copy Name in Target Script"
          >
            {copiedId === item._id ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTranslation(item);
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
              setSelectedTranslation(item);
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
            <Languages className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Document Translation</h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 w-64"
            >
              <option value="all">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Waiting for Payment">Waiting for Payment</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search translations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Translation
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
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredTranslations.length)}</span> of{" "}
                    <span className="font-medium">{filteredTranslations.length}</span> results
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

      <AddTranslationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        getAllTranslations={getAllTranslations}
      />

      {selectedTranslation && (
        <>
          <EditTranslationModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedTranslation(null);
            }}
            getAllTranslations={getAllTranslations}
            translation={selectedTranslation}
          />

          <HisabKitabModal
            isOpen={isHisabKitabOpen}
            onClose={() => {
              setIsHisabKitabOpen(false);
              setSelectedTranslation(null);
            }}
            application={selectedTranslation}
          />
        </>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        applicationName={translationToDelete?.clientId?.name || 'Unknown'}
      />
    </div>
  );
}