import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Upload, message } from 'antd';
import { Upload as LucideUpload, Eye, FileText, Trash2 } from 'lucide-react';
import { useAccountTaskGlobally } from '../../context/AccountTaskContext';

// Define types for clarity
interface Task {
  _id: string;
  clientId: { _id: string; name: string };
  clientName?: string;
  clientFiles: string[];
}

interface ClientTasks {
  applications: Task[];
  appointment: Task[];
  documentTranslation: Task[];
  epassport: Task[];
  graphicDesigns: Task[];
  japanVisit: Task[];
  otherServices: Task[];
}

interface FilesTabProps {
  getAllModelData: () => void;
}

const keyMap: Record<string, keyof ClientTasks> = {
  application: 'applications',
  appointment: 'appointment',
  documentTranslation: 'documentTranslation',
  epassports: 'epassport',
  graphicDesigns: 'graphicDesigns',
  japanVisit: 'japanVisit',
  otherServices: 'otherServices',
};

const FilesTab: React.FC<FilesTabProps> = ({ getAllModelData }) => {
  const { accountTaskData, selectedClientId } = useAccountTaskGlobally();
  const [modalState, setModalState] = useState({
    uploadVisible: false,
    previewVisible: false,
    filesVisible: false,
    deleteConfirmVisible: false, // New state for delete confirmation
    selectedTaskId: null as string | null,
    selectedModelName: '',
    fileList: [] as any[],
    previewFiles: [] as string[],
    fileToDelete: null as string | null, // Track file to delete
  });

  const [clientTasks, setClientTasks] = useState<ClientTasks>({
    applications: [],
    appointment: [],
    documentTranslation: [],
    epassport: [],
    graphicDesigns: [],
    japanVisit: [],
    otherServices: [],
  });

  // Fetch and filter tasks based on selectedClientId
  useEffect(() => {
    if (!accountTaskData || !selectedClientId) return;

    const updatedTasks: ClientTasks = {
      applications: [],
      appointment: [],
      documentTranslation: [],
      epassport: [],
      graphicDesigns: [],
      japanVisit: [],
      otherServices: [],
    };

    Object.entries(accountTaskData).forEach(([key, modelData]) => {
      const mappedKey = keyMap[key];
      if (mappedKey && Array.isArray(modelData)) {
        modelData.forEach((item: Task) => {
          if (item?.clientId?._id === selectedClientId) {
            updatedTasks[mappedKey].push(item);
          }
        });
      }
    });

    setClientTasks(updatedTasks);
  }, [selectedClientId, accountTaskData]);

  // Handle modal visibility and state updates
  const updateModalState = (updates: Partial<typeof modalState>) => {
    setModalState((prev) => ({ ...prev, ...updates }));
  };

  // Open upload modal
  const handleModalOpen = (taskId: string, modelName: string) => {
    updateModalState({ uploadVisible: true, selectedTaskId: taskId, selectedModelName: modelName });
  };

  // Open preview modal
  const handlePreviewOpen = (task: Task) => {
    if (task.clientFiles?.length) {
      updateModalState({ previewVisible: true, previewFiles: task.clientFiles });
    } else {
      message.warning('No files available for preview.');
    }
  };

  // Open files modal
  const handleFilesOpen = (files: string[], modelName: string) => {
    updateModalState({ filesVisible: true, previewFiles: files, selectedModelName: modelName });
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!modalState.fileList.length) {
      message.error('Please select files to upload.');
      return;
    }

    const formData = new FormData();
    modalState.fileList.forEach((file) => formData.append('clientFiles', file.originFileObj));
    const loadingMessage = message.loading('Uploading files...', 0);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/fileUpload/${selectedClientId}/${modalState.selectedModelName}`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();

      if (data.success) {
        message.success('Files uploaded successfully!');
        getAllModelData();

        const newFileUrls = data.clientFiles || data.updatedTask?.clientFiles || [];
        if (newFileUrls.length) {
          setClientTasks((prevTasks) => {
            const updatedTasks = { ...prevTasks };
            const taskSection = keyMap[modalState.selectedModelName.toLowerCase()] || modalState.selectedModelName.toLowerCase();
            const sectionTasks = updatedTasks[taskSection as keyof ClientTasks];
            if (sectionTasks) {
              const taskIndex = sectionTasks.findIndex((task) => task._id === modalState.selectedTaskId);
              if (taskIndex !== -1) {
                sectionTasks[taskIndex] = {
                  ...sectionTasks[taskIndex],
                  clientFiles: newFileUrls,
                };
              }
            }
            return updatedTasks;
          });

          if (modalState.previewVisible || modalState.filesVisible) {
            updateModalState({ previewFiles: newFileUrls });
          }
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload files.');
    } finally {
      loadingMessage();
      updateModalState({ uploadVisible: false, fileList: [] });
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (fileUrl: string) => {
    updateModalState({ deleteConfirmVisible: true, fileToDelete: fileUrl });
  };

  // Handle file deletion after confirmation
  const handleDeleteFile = async () => {
    if (!modalState.fileToDelete) return;

    const fileUrl = modalState.fileToDelete;
    const loadingMessage = message.loading('Deleting file...', 0);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/deleteFile`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: selectedClientId,
            modelName: modalState.selectedModelName,
            fileUrl,
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        message.success('File deleted successfully!');
        getAllModelData();
        updateModalState({
          previewFiles: modalState.previewFiles.filter((file) => file !== fileUrl),
          deleteConfirmVisible: false,
          fileToDelete: null,
        });
      } else {
        throw new Error(data.message || 'Deletion failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete file.');
    } finally {
      loadingMessage();
    }
  };

  // Render a single task
  const renderTask = (task: Task, modelName: string) => (
    <div
      key={task._id}
      className="bg-gray-50 p-3 rounded-lg border border-gray-400 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center">
        <p className="font-medium">{task.clientId.name || task.clientName}</p>
        <div className="flex space-x-2">
          <Button
            icon={<LucideUpload className="h-5 w-5" />}
            onClick={() => handleModalOpen(task._id, modelName)}
            size="small"
            type="link"
            className="text-blue-500"
          />
          <Button
            icon={<Eye className="h-5 w-5" />}
            onClick={() => handlePreviewOpen(task)}
            size="small"
            type="link"
            className="text-green-500"
          />
          <Button
            icon={<FileText className="h-5 w-5" />}
            onClick={() => handleFilesOpen(task.clientFiles, modelName)}
            size="small"
            type="link"
            className="text-orange-500"
          />
        </div>
      </div>
    </div>
  );

  // Render task section with memoization
  const taskSections = useMemo(() => {
    const sections = [
      { title: 'Visa Applications', tasks: clientTasks.applications, modelName: 'applicationModel' },
      { title: 'Document Translations', tasks: clientTasks.documentTranslation, modelName: 'documentTranslationModel' },
      { title: 'Design Services', tasks: clientTasks.graphicDesigns, modelName: 'GraphicDesignModel' },
      { title: 'Japan Visit Applications', tasks: clientTasks.japanVisit, modelName: 'japanVisitApplicationModel' },
      { title: 'E-passport Applications', tasks: clientTasks.epassport, modelName: 'ePassportModel' },
      { title: 'Other Services', tasks: clientTasks.otherServices, modelName: 'OtherServiceModel' },
    ];

    return sections.map(({ title, tasks, modelName }) =>
      tasks.length > 0 ? (
        <div key={title} className="space-y-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          {tasks.map((task) => renderTask(task, modelName))}
        </div>
      ) : null
    );
  }, [clientTasks]);

  // Check if there are no tasks at all
  const hasTasks = Object.values(clientTasks).some((tasks) => tasks.length > 0);

  return (
    <div className="space-y-6">
      {/* Upload Modal */}
      <Modal
        title="Upload Files"
        open={modalState.uploadVisible}
        onCancel={() => updateModalState({ uploadVisible: false, fileList: [] })}
        footer={[
          <Button key="cancel" onClick={() => updateModalState({ uploadVisible: false, fileList: [] })}>
            Cancel
          </Button>,
          <Button key="upload" type="primary" onClick={handleUpload} disabled={!modalState.fileList.length}>
            Upload
          </Button>,
        ]}
      >
        <Upload
          multiple
          fileList={modalState.fileList}
          onChange={({ fileList }) => updateModalState({ fileList })}
          beforeUpload={() => false}
        >
          <Button icon={<LucideUpload className="h-5 w-5" />}>Select Files</Button>
        </Upload>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Preview Files"
        open={modalState.previewVisible}
        onCancel={() => updateModalState({ previewVisible: false, previewFiles: [] })}
        footer={null}
        width="60%"
      >
        <div className="space-y-4">
          {modalState.previewFiles.map((fileUrl, index) => (
            <div key={index}>
              {fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <img src={fileUrl} alt={`Preview ${index}`} className="w-full h-auto border rounded" />
              ) : fileUrl.endsWith('.pdf') ? (
                <iframe
                  src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
                  className="w-full h-96 border rounded"
                  title={`PDF Preview ${index}`}
                />
              ) : (
                <p className="text-gray-500">File format not supported for preview</p>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Files Modal */}
      <Modal
        title="Client Files"
        open={modalState.filesVisible}
        onCancel={() => updateModalState({ filesVisible: false, previewFiles: [] })}
        footer={null}
        width="50%" // Decreased from 80% to 50%
      >
        {modalState.previewFiles.length ? (
          <div className="space-y-4">
            {modalState.previewFiles.map((fileUrl, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  {fileUrl.split('/').pop()}
                </a>
                <Button
                  icon={<Trash2 className="h-5 w-5 text-red-500" />}
                  onClick={() => showDeleteConfirmation(fileUrl)}
                  type="link"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No files found</p>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={modalState.deleteConfirmVisible}
        onCancel={() => updateModalState({ deleteConfirmVisible: false, fileToDelete: null })}
        footer={[
          <Button
            key="cancel"
            onClick={() => updateModalState({ deleteConfirmVisible: false, fileToDelete: null })}
          >
            Cancel
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDeleteFile}>
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this file?</p>
        {modalState.fileToDelete && (
          <p className="text-gray-600">{modalState.fileToDelete.split('/').pop()}</p>
        )}
      </Modal>

      {/* Task Sections or No Data Message */}
      {hasTasks ? (
        taskSections
      ) : (
        <div className="text-center py-8 text-gray-500">No documents found</div>
      )}
    </div>
  );
};

export default FilesTab;