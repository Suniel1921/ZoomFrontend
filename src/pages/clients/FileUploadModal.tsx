// Update the imports
import { fileStorageService } from '../../services/fileStorageService';
// ... rest of the imports remain the same

// Update the handleFileSelect function
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !currentAdmin) return;

  try {
    setIsUploading(true);
    setError(null);

    // Upload file and get URL
    const fileUrl = await fileStorageService.uploadFile(file);
    
    // Save file metadata to our store
    addFile({
      taskId,
      taskType,
      clientId,
      fileName: file.name,
      fileType: file.type,
      driveFileId: crypto.randomUUID(), // Temporary ID for development
      driveViewLink: fileUrl,
      driveDownloadLink: fileUrl,
      uploadedBy: currentAdmin.id,
    });

    onClose();
  } catch (error) {
    console.error('Upload failed:', error);
    setError('Failed to upload file. Please try again.');
  } finally {
    setIsUploading(false);
  }
};