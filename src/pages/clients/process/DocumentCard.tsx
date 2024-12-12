import { useState } from 'react';
import { Upload, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../../components/Button';
import type { DocumentRequirement } from '../../../types/taskManagement';

interface DocumentCardProps {
  document: DocumentRequirement;
  onUpload: (file: File) => Promise<void>;
  onVerify: () => void;
  onReject: (reason: string) => void;
  canVerify?: boolean;
}

export default function DocumentCard({
  document,
  onUpload,
  onVerify,
  onReject,
  canVerify = false,
}: DocumentCardProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{document.name}</h4>
          <p className="text-sm text-gray-500">{document.description}</p>
          {document.required && (
            <span className="mt-1 inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              Required
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {document.uploadedFile ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(document.uploadedFile?.url)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(document.uploadedFile?.url)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {canVerify && document.status === 'received' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onVerify}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) onReject(reason);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </>
          ) : (
            <div>
              <input
                type="file"
                id={`file-${document.id}`}
                className="hidden"
                onChange={handleFileSelect}
              />
              <label
                htmlFor={`file-${document.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Status Information */}
      {document.status !== 'required' && (
        <div className="mt-4 text-sm">
          {document.status === 'verified' && (
            <p className="text-green-600">
              Verified on {new Date(document.verifiedAt!).toLocaleDateString()}
            </p>
          )}
          {document.status === 'rejected' && (
            <p className="text-red-600">
              Rejected: {document.rejectionReason}
            </p>
          )}
          {document.uploadedFile && (
            <p className="text-gray-500">
              Uploaded on {new Date(document.uploadedFile.uploadedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}