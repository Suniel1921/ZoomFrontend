import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Button from '../../components/Button';
import { useStore } from '../../store';
import type { EpassportApplication } from '../../types';

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: EpassportApplication;
}

export default function PDFUploadModal({
  isOpen,
  onClose,
  application,
}: PDFUploadModalProps) {
  const { updateEpassportApplication } = useStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(selectedFile);

      // Update the application with the PDF file
      updateEpassportApplication(application.id, {
        ...application,
        pdfFile: {
          url: fileUrl,
          name: selectedFile.name,
        },
      });

      onClose();
    } catch (error) {
      setError('Failed to upload file');
      console.error('Upload error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload PDF</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Client Info */}
          <div>
            <p className="text-sm text-gray-500">Client</p>
            <p className="font-medium">{application.clientName}</p>
          </div>

          {/* Current File */}
          {application.pdfFile && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium">Current File</p>
              <p className="text-sm text-gray-500">{application.pdfFile.name}</p>
            </div>
          )}

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF files only, up to 5MB</p>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}