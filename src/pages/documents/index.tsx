import { useState } from 'react';
import { FileText, Upload, Download, Trash2, Eye, Search, Filter, Tag, Clock, ChevronUp, ChevronDown, User } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentViewModal from './DocumentViewModal';
import DocumentFilterModal from './DocumentFilterModal';
import type { Document } from '../../types';

type SortField = 'date' | 'name' | 'size' | 'client';
type SortOrder = 'asc' | 'desc';

export default function DocumentsPage() {
  const { clients, documents } = useStore();
  const [selectedClient, setSelectedClient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Filter and sort documents
  const filteredDocuments = documents.filter(doc => {
    if (selectedClient && doc.clientId !== selectedClient) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const client = clients.find(c => c.id === doc.clientId);
      const clientName = client?.name.toLowerCase() || '';
      
      if (!doc.name.toLowerCase().includes(searchLower) &&
          !doc.tags.some(tag => tag.toLowerCase().includes(searchLower)) &&
          !clientName.includes(searchLower)) {
        return false;
      }
    }
    if (selectedTags.length && !selectedTags.some(tag => doc.tags.includes(tag))) return false;
    if (selectedTypes.length && !selectedTypes.includes(doc.type)) return false;
    if (selectedCategories.length && !selectedCategories.includes(doc.category)) return false;
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'client':
        const clientA = clients.find(c => c.id === a.clientId)?.name || '';
        const clientB = clients.find(c => c.id === b.clientId)?.name || '';
        comparison = clientA.localeCompare(clientB);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleDelete = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      // Delete document logic
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      {label}
      {sortBy === field && (
        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <Layout>
      <PageHeader
        title="Document Management"
        description="Securely store and manage all client documents"
        icon={FileText}
        action={{
          label: 'Upload Document',
          onClick: () => setIsUploadModalOpen(true),
          icon: Upload,
        }}
      />

      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search documents, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex gap-4 border-t pt-4">
            <SortButton field="date" label="Date" />
            <SortButton field="name" label="Name" />
            <SortButton field="client" label="Client" />
            <SortButton field="size" label="Size" />
          </div>

          {/* Active Filters */}
          {(selectedTags.length > 0 || selectedTypes.length > 0 || selectedCategories.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-black"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    onClick={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const client = clients.find(c => c.id === doc.clientId);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-brand-yellow transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{client?.name}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url)}
                        className="p-1"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {selectedDocument && (
        <DocumentViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}

      <DocumentFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
    </Layout>
  );
}