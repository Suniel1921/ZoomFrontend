import { useState, useRef } from 'react';
import { useFileStore } from '../../store/fileStore';
import { useAdminStore } from '../../store/adminStore';
import { fileStorageService } from '../../services/fileStorageService';
import Button from '../../components/Button';
import { Eye, Download, Trash2, Upload, AlertTriangle } from 'lucide-react';
import type { Client } from '../../types';

interface FilesTabProps {
  client: Client;
}

export default function FilesTab({ client }: FilesTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentAdmin } = useAdminStore();
  const { addFile, deleteFile } = useFileStore();
  const clientFiles = useFileStore(state => state.getFilesByClient(client.id));

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentAdmin) return;

    try {
      setIsUploading(true);
      setError(null);

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF, Word documents, and images (JPEG/PNG) are allowed');
      }

      // Upload file and get ID
      const fileId = await fileStorageService.uploadFile(file);
      
      // Save file metadata
      addFile({
        taskId: 'general',
        taskType: 'other',
        clientId: client.id,
        fileName: file.name,
        fileType: file.type,
        driveFileId: fileId,
        driveViewLink: fileId,
        driveDownloadLink: fileId,
        uploadedBy: currentAdmin.id,
      });

      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = async (fileId: string, fileType: string) => {
    try {
      const file = await fileStorageService.getFile(fileId);
      if (!file?.data) {
        throw new Error('File not found');
      }

      // For images, create a temporary URL and open in new window
      if (fileType.startsWith('image/')) {
        const win = window.open('');
        if (!win) {
          alert('Please allow popups to view files');
          return;
        }
        win.document.write(`<img src="${file.data}" alt="Preview" style="max-width: 100%; height: auto;">`);
        return;
      }

      // For other files, create a blob and open in new tab
      const base64Data = file.data.split(',')[1];
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: fileType });
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank');
      
      // Clean up URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('View failed:', error);
      alert('Failed to view file. Please try downloading instead.');
    }
  };

  const handleDownload = async (fileId: string, fileName: string, fileType: string) => {
    try {
      const file = await fileStorageService.getFile(fileId);
      if (!file?.data) {
        throw new Error('File not found');
      }

      // Convert base64 to blob
      const base64Data = file.data.split(',')[1];
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: fileType });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await fileStorageService.deleteFile(fileId);
      deleteFile(fileId);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-4">
        {clientFiles.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No files uploaded yet.</p>
        ) : (
          <div className="grid gap-4">
            {clientFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{file.fileName}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(file.driveFileId, file.fileType)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file.driveFileId, file.fileName, file.fileType)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}