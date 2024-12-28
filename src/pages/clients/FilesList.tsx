import { useState } from 'react';
import { Eye, Download, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import { useFileStore } from '../../store/fileStore';
import { googleDriveService } from '../../services/googleDriveService';
import type { TaskFile } from '../../types/googleDrive';

interface FilesListProps {
  taskId: string;
  taskType: TaskFile['taskType'];
}

export default function FilesList({ taskId, taskType }: FilesListProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const files = useFileStore((state) => state.getFilesByTask(taskId, taskType));

  const handleDelete = async (fileId: string, driveFileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      setIsDeleting(true);
      await googleDriveService.deleteFile(driveFileId);
      useFileStore.getState().deleteFile(fileId);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (files.length === 0) {
    return <p className="text-sm text-gray-500">No files uploaded yet.</p>;
  }

  return (
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
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}



