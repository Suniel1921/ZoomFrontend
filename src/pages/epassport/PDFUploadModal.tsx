import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Button from '../../components/Button';
import { useStore } from '../../store';
import type { EpassportApplication } from '../../types';
import toast from 'react-hot-toast';
import axios from 'axios';

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  getAllEPassportApplication: () => void;
  application: EpassportApplication;
}

export default function PDFUploadModal({
  isOpen,
  onClose,
  application,
  getAllEPassportApplication,
}: PDFUploadModalProps) {
  const { updateEpassportApplication } = useStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setError(null);

    if (files) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const newFiles: File[] = [];
      let isValid = true;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!validTypes.includes(file.type)) {
          setError('Only PDF, JPG, JPEG, and PNG files are allowed');
          isValid = false;
          break;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB');
          isValid = false;
          break;
        }

        newFiles.push(file);
      }

      if (isValid) {
        setSelectedFiles(newFiles);
      }
    }
  };


  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files');
      return;
    }
  
    const toastId = toast.loading('Please wait, files are uploading...');
    setIsUploading(true);
  
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('clientFiles', file);
      });
  
      const clientId = application.clientId?._id || application.clientId; // Ensure it's a string (ObjectId)
  
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/uploadMultipleFiles/${clientId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
  
      if (response?.data?.success) {
        toast.success('Files uploaded successfully!', { id: toastId });
        getAllEPassportApplication();
  
        if (application.id) {
          updateEpassportApplication(application.id, {
            ...application,
            pdfFile: {
              url: response.data.fileUrls[0],
              name: selectedFiles[0].name,
            },
          });
        }
  
        setSelectedFiles([]);
        onClose();
      } else {
        toast.error(response?.data?.message || 'Failed to upload files.', { id: toastId });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('An error occurred while uploading files.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload PDF/Image Files</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">Client</p>
            <p className="font-medium">{application.clientName}</p>
          </div>

          {application.pdfFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium">Current File</p>
              <p className="text-sm text-gray-500">{application.pdfFile.name}</p>
            </div>
          )}

          <div
            className={`border-2 border-dashed ${
              error ? 'border-red-500' : 'border-gray-300'
            } rounded-lg p-6`}
          >
            <input
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG, PNG files only, up to 5MB each</p>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}




