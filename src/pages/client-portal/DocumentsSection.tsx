import { useState } from 'react';
import { Files, Download, Eye } from 'lucide-react';
import Button from '../../components/Button';
import { useFileStore } from '../../store/fileStore';
import { fileStorageService } from '../../services/fileStorageService';
import { format } from 'date-fns';

interface DocumentsSectionProps {
  clientId: string;
}

export default function DocumentsSection({ clientId }: DocumentsSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');

  const clientFiles = useFileStore(state => state.getFilesByClient(clientId));

  const handlePreview = async (fileId: string, fileType: string, fileName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For images and PDFs, use the drive view link directly
      if (fileType.startsWith('image/') || fileType === 'application/pdf') {
        const fileUrl = await fileStorageService.getFileUrl(fileId);
        setPreviewUrl(fileUrl);
        setPreviewFileName(fileName);
        setIsPreviewModalOpen(true);
        return;
      }

      // For other file types, show download prompt
      handleDownload(fileId, fileName);
    } catch (error) {
      console.error('Preview failed:', error);
      setError('Failed to preview file. Please try downloading instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const fileUrl = await fileStorageService.getFileUrl(fileId);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {clientFiles.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No documents available.</p>
      ) : (
        <div className="space-y-4">
          {clientFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{file.fileName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Uploaded on {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(file.driveFileId, file.fileType, file.fileName)}
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file.driveFileId, file.fileName)}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{previewFileName}</h3>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setPreviewUrl(null);
                  setPreviewFileName('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-50 overflow-auto">
              {previewUrl.startsWith('data:image/') || previewUrl.includes('image') ? (
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Document preview"
                  sandbox="allow-same-origin allow-scripts"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}