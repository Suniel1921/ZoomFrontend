import { useState, useRef } from 'react';
import { Upload, Trash2, Eye, Download } from 'lucide-react';
import Button from './Button';
import { useFileStore } from '../store/fileStore';
import { googleDriveService } from '../services/googleDriveService';
import type { TaskFile } from '../types/googleDrive';

interface FileUploadProps {
  taskId: string;
  taskType: TaskFile['taskType'];
  clientId: string;
  folderId: string;
}

export default function FileUpload({
  taskId,
  taskType,
  clientId,
  folderId,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFile, deleteFile, getFilesByTask } = useFileStore();
  const files = getFilesByTask(taskId, taskType);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedFile = await googleDriveService.uploadFile(file, folderId);
      
      addFile({
        taskId,
        taskType,
        clientId,
        fileName: file.name,
        fileType: file.type,
        driveFileId: uploadedFile.id,
        driveViewLink: uploadedFile.viewLink,
        driveDownloadLink: uploadedFile.downloadLink,
        uploadedBy: 'system', // Removed admin reference
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string, driveFileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await googleDriveService.deleteFile(driveFileId);
      deleteFile(fileId);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm font-medium">{file.fileName}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(file.driveViewLink, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(file.driveDownloadLink, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(file.id, file.driveFileId)}
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
  );
}
