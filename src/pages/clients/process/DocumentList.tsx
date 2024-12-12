import { useState } from 'react';
import { Upload, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../../components/Button';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import { useAdminStore } from '../../../store/adminStore';
import { fileStorageService } from '../../../services/fileStorageService';
import type { ClientProcess } from '../../../types/taskManagement';

interface DocumentListProps {
  process: ClientProcess;
}

export default function DocumentList({ process }: DocumentListProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentAdmin } = useAdminStore();
  const { updateDocument } = useTaskManagementStore();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = event.target.files?.[0];
    if (!file || !currentAdmin) return;

    try {
      setIsUploading(true);
      setError(null);

      // Upload file and get URL
      const fileId = await fileStorageService.uploadFile(file);
      const fileUrl = await fileStorageService.getFileUrl(fileId);

      // Update document status
      updateDocument(process.id, docId, {
        status: 'received',
        uploadedFile: {
          id: fileId,
          name: file.name,
          url: fileUrl,
          uploadedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerify = (docId: string) => {
    if (!currentAdmin) return;

    updateDocument(process.id, docId, {
      status: 'verified',
      verifiedBy: currentAdmin.id,
      verifiedAt: new Date().toISOString(),
    });
  };

  const handleReject = (docId: string, reason: string) => {
    updateDocument(process.id, docId, {
      status: 'rejected',
      rejectionReason: reason,
    });
  };

  return (
    <div className="space-y-4">
      {process.documents.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No documents required for this process.</p>
      ) : (
        process.documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{doc.name}</h4>
                <p className="text-sm text-gray-500">{doc.description}</p>
                {doc.required && (
                  <span className="mt-1 inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {doc.uploadedFile ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.uploadedFile?.url)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.uploadedFile?.url)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {currentAdmin?.role === 'super_admin' && doc.status === 'received' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(doc.id)}
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
                            if (reason) handleReject(doc.id, reason);
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
                      id={`file-${doc.id}`}
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, doc.id)}
                    />
                    <label
                      htmlFor={`file-${doc.id}`}
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
            {doc.status !== 'required' && (
              <div className="mt-4 text-sm">
                {doc.status === 'verified' && (
                  <p className="text-green-600">
                    Verified on {new Date(doc.verifiedAt!).toLocaleDateString()}
                  </p>
                )}
                {doc.status === 'rejected' && (
                  <p className="text-red-600">
                    Rejected: {doc.rejectionReason}
                  </p>
                )}
                {doc.uploadedFile && (
                  <p className="text-gray-500">
                    Uploaded on {new Date(doc.uploadedFile.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}