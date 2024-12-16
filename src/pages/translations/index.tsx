import { useState, useEffect } from 'react';
import { Languages, Plus, Search, Calculator, Copy, Check } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AddTranslationModal from './AddTranslationModal';
import EditTranslationModal from './EditTranslationModal';
import HisabKitabModal from '../../components/HisabKitabModal';
import DataTable from '../../components/DataTable';
import type { Translation } from '../../types';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch translations from API
  const getAllTranslations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/documentTranslation/getAllDocumentTranslation`);
      const data = await response.json();
      setTranslations(data.translations || []);
      setClients(data.clients || []); // Assuming the API also returns clients
    } catch (error) {
      console.error('Error fetching translations:', error);
    }
  };
  useEffect(() => {
   getAllTranslations();
  }, []);

  // Filter translations based on search query and status
  const filteredTranslations = translations.filter((trans) => {
    const clientName = trans.clientId?.name?.toLowerCase() || ''; // Ensure safe access
    const matchesSearch = clientName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trans.translationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  

  const formatPhoneForViber = (phone: string | undefined | null): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  

  const getClientPhone = (clientId: string): string | undefined => {
    return clients.find((c: any) => c.id === clientId)?.phone;
  };

  const handleCopyName = (translation: Translation) => {
    navigator.clipboard.writeText(translation.nameInTargetScript);
    setCopiedId(translation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  

  const handleDelete = async (_id: string) => {
    if (!window.confirm('Are you sure you want to delete this translation?')) return;

    toast.loading('Deleting translation...');
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/documentTranslation/deleteDocumentTranslation/${_id}`);
      setTranslations((prev) => prev.filter((trans) => trans.id !== _id));
      toast.dismiss(); // Remove the loading toast
      toast.success('Translation deleted successfully!');
      getAllTranslations();
    } catch (error) {
      toast.dismiss(); // Remove the loading toast
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Completed' ? 'bg-green-100 text-green-700' :
          value === 'Delivered' ? 'bg-blue-100 text-blue-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString()}
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
      render: (_: string, item: Translation) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyName(item)}
            title="Copy Name in Target Script"
          >
            {copiedId === item.id ? (
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(item._id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </Button>
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
              className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="all">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
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
        <DataTable
          columns={columns}
          data={filteredTranslations}
          searchable={false}
        />
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
    </div>
  );
}


