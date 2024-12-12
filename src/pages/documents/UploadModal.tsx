import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SearchableSelect from '../../components/SearchableSelect';
import { useStore } from '../../store';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const { clients, addDocument } = useStore();
  const [selectedClient, setSelectedClient] = useState('');
  const [category, setCategory] = useState<'received' | 'review'>('received');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Only PDF, Word documents, and images (JPEG/PNG) are allowed');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!selectedClient || !file) {
      alert('Please select a client and file');
      return;
    }

    // In a real application, you would upload the file to a server
    // For this example, we'll create a fake URL
    const fakeUrl = URL.createObjectURL(file);

    addDocument({
      clientId: selectedClient,
      fileName: file.name,
      fileUrl: fakeUrl,
      fileType: file.type,
      category,
      status: 'pending',
      comments: [],
    });

    onClose();
    setSelectedClient('');
    setCategory('received');
    setFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <SearchableSelect
              options={clients.map(client => ({
                value: client.id,
                label: client.name
              }))}
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder="Select client"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'received' | 'review')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="received">Received Documents</option>
              <option value="review">Files for Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Allowed formats: PDF, Word documents, JPEG/PNG images
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}