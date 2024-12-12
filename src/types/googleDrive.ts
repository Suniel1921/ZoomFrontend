export interface GoogleDriveFile {
  id: string;
  name: string;
  viewLink: string;
  downloadLink: string;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
}

export interface TaskFile {
  id: string;
  taskId: string;
  taskType: 'visa' | 'japan-visit' | 'translation' | 'design' | 'epassport' | 'other';
  clientId: string;
  fileName: string;
  fileType: string;
  driveFileId: string;
  driveViewLink: string;
  driveDownloadLink: string;
  uploadedBy: string;
  uploadedAt: string;
}