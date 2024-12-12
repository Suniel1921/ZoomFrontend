import { X, Download, AlertTriangle } from 'lucide-react';
import Button from '../../../components/Button';
import type { DocumentSubmission } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: DocumentSubmission;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  submission,
}: DocumentPreviewModalProps) {
  const handleDownload = () => {
    window.open(submission.fileUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{submission.fileName}</h2>
            <p className="text-sm text-gray-500">
              Uploaded on {new Date(submission.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
          {submission.status === 'rejected' && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Document Rejected
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{submission.rejectionReason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {submission.fileType.startsWith('image/') ? (
            <img
              src={submission.fileUrl}
              alt={submission.fileName}
              className="max-w-full h-auto mx-auto"
            />
          ) : (
            <iframe
              src={submission.fileUrl}
              className="w-full h-full rounded-lg border border-gray-200"
              title={submission.fileName}
            />
          )}
        </div>

        {submission.notes && (
          <div className="p-4 border-t">
            <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{submission.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}