import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Eye } from 'lucide-react';
import Button from '../../components/Button';
import { useAuthGlobally } from '../../context/AuthContext';

interface DocumentsSectionProps {
  userId: string;
}

export default function DocumentsSection({ userId }: DocumentsSectionProps) {
  const [groupedFiles, setGroupedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const [auth] = useAuthGlobally();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`
        );
        const clientFiles = response.data.allData || {};
        const extractedFiles = groupFilesByType(clientFiles);
        setGroupedFiles(extractedFiles);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [userId, auth.user.id]);

  const groupFilesByType = (data: any) => {
    const friendlyNames: { [key: string]: string } = {
      ApplicationModel: 'Application Document',
      PassportModel: 'Passport Document',
      OtherModel: 'Other Document', // Add more model-to-name mappings as needed
    };

    const grouped: Map<string, any> = new Map();

    for (const modelType in data) {
      if (data.hasOwnProperty(modelType) && Array.isArray(data[modelType])) {
        data[modelType].forEach((item: any) => {
          if (item.clientFiles && Array.isArray(item.clientFiles)) {
            const key = friendlyNames[modelType] || modelType.replace('Model', ' Document');
            const files = item.clientFiles.map((fileUrl: string) => ({
              fileUrl,
              uploadedAt: item.updatedAt || item.createdAt,
            }));

            if (!grouped.has(key)) {
              grouped.set(key, { files: [], modelType });
            }
            grouped.get(key).files.push(...files);
          }
        });
      } else {
        console.warn(`Skipping ${modelType}: not an array`, data[modelType]);
      }
    }

    return Array.from(grouped.entries()).map(([fileName, details]) => ({
      fileName,
      files: details.files,
    }));
  };

  const handlePreview = (files: string[], fileName: string) => {
    setPreviewFiles(files);
    setPreviewFileName(fileName);
    setIsPreviewModalOpen(true);
  };

  const handleDownload = (files: string[]) => {
    files.forEach((fileUrl) => {
      const anchor = document.createElement('a');
      anchor.href = fileUrl;
      anchor.download = fileUrl.split('/').pop();
      anchor.click();
    });
  };

  const renderPreview = (fileUrl: string) => {
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

    // Check if the file is an image and render accordingly
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExtension || '')) {
      return <img src={fileUrl} alt="Preview" className="w-full h-auto border mb-4" />;
    }

    // For documents, use Google Docs Viewer (iframe)
    return (
      <iframe
        src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
        className="w-full h-64 border mb-4"
        title="Document Preview"
      />
    );
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {groupedFiles.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {isLoading ? 'Loading documents...' : 'No documents available.'}
        </p>
      ) : (
        <div className="space-y-4">
          {groupedFiles.map((group, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{group.fileName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {group.files.length} file(s) uploaded
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(group.files.map((f: any) => f.fileUrl), group.fileName)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(group.files.map((f: any) => f.fileUrl))}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{previewFileName}</h3>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setPreviewFiles([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-50 overflow-auto space-y-4">
              {previewFiles.map((fileUrl, idx) => (
                <div key={idx}>
                  {renderPreview(fileUrl)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



