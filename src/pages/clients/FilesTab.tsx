// import React, { useState, useEffect } from 'react';
// import { Button, Modal, Upload, message } from 'antd';
// import { Upload as LucideUpload, Eye } from 'lucide-react'; // Lucide icon
// import { useAccountTaskGlobally } from '../../context/AccountTaskContext';

// const FilesTab = () => {
//   const { accountTaskData, selectedClientId } = useAccountTaskGlobally();
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [fileList, setFileList] = useState([]);
//   const [selectedTaskId, setSelectedTaskId] = useState(null);
//   const [selectedModelName, setSelectedModelName] = useState('');
//   const [clientTasks, setClientTasks] = useState({
//     applications: [],
//     appointment: [],
//     documentTranslation: [],
//     epassport: [],
//     graphicDesigns: [],
//     japanVisit: [],
//     otherServices: [],
//   });
//   const [previewModalVisible, setPreviewModalVisible] = useState(false);
//   const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

//   // Fetch tasks based on clientId
//   useEffect(() => {
//     if (accountTaskData && selectedClientId) {
//       const updatedClientTasks = {
//         applications: [],
//         appointment: [],
//         documentTranslation: [],
//         epassport: [],
//         graphicDesigns: [],
//         japanVisit: [],
//         otherServices: [],
//       };

//       Object.keys(accountTaskData).forEach((key) => {
//         const modelData = accountTaskData[key];
//         if (Array.isArray(modelData)) {
//           modelData.forEach((item) => {
//             if (item?.clientId?._id === selectedClientId) {
//               if (key === "application") updatedClientTasks.applications.push(item);
//               if (key === "appointment") updatedClientTasks.appointment.push(item);
//               if (key === "documentTranslation") updatedClientTasks.documentTranslation.push(item);
//               if (key === "epassports") updatedClientTasks.epassport.push(item);
//               if (key === "graphicDesigns") updatedClientTasks.graphicDesigns.push(item);
//               if (key === "japanVisit") updatedClientTasks.japanVisit.push(item);
//               if (key === "otherServices") updatedClientTasks.otherServices.push(item);
//             }
//           });
//         }
//       });

//       setClientTasks(updatedClientTasks);
//     }
//   }, [selectedClientId, accountTaskData]);

//   const renderTaskSection = (title, tasks, modelName) => {
//     return (
//       tasks.length > 0 && (
//         <div className="space-y-4">
//           <h3 className="text-xl font-semibold">{title}</h3>
//           {tasks.map((task) => (
//             <div
//               key={task._id}
//               className="bg-gray-50 p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
//             >
//               <div className="flex justify-between items-center">
//                 <div>
//                   <p className="font-medium">{task.clientId.name || task.clientName}</p>
//                 </div>

//                 <Button
//                   icon={<LucideUpload className="h-5 w-5" />}
//                   onClick={() => handleModalOpen(task._id, modelName)}
//                   size="small"
//                   type="link"
//                   className="text-blue-500"
//                 />

//                 {/* Eye Button for file preview */}
//                 <Button
//                   icon={<Eye className="h-5 w-5" />}
//                   onClick={() => handlePreviewOpen(task._id)}
//                   size="small"
//                   type="link"
//                   className="text-green-500"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       )
//     );
//   };

//   // Open Modal for file upload
//   const handleModalOpen = (taskId, modelName) => {
//     setSelectedTaskId(taskId);
//     setSelectedModelName(modelName);
//     setIsModalVisible(true);
//   };

//   // Close Modal
//   const handleModalClose = () => {
//     setIsModalVisible(false);
//     setFileList([]);
//   };

//   // Handle file selection
//   const handleFileChange = ({ fileList }) => {
//     setFileList(fileList);
//   };

//   // Handle file upload
//   const handleUpload = async () => {
//     if (fileList.length === 0) {
//       message.error('Please select files before uploading.');
//       return;
//     }

//     const formData = new FormData();
//     fileList.forEach((file) => {
//       formData.append('clientFiles', file.originFileObj);
//     });

//     const loadingMessage = message.loading('Uploading files...', 0);

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/fileUpload/${selectedClientId}/${selectedModelName}`,
//         {
//           method: 'POST',
//           body: formData,
//         }
//       );
//       const data = await response.json();

//       if (data.success) {
//         message.success('Files uploaded successfully!');
//       } else {
//         message.error(data.message || 'Failed to upload files.');
//       }
//     } catch (error) {
//       message.error('An error occurred while uploading files.');
//     } finally {
//       loadingMessage();
//     }

//     setFileList([]);
//     setIsModalVisible(false);
//   };

//   // Handle file preview modal
//   const handlePreviewOpen = (taskId) => {
//     const task = clientTasks.applications.find((task) => task._id === taskId); // Assuming you want to preview files for a task
//     if (task) {
//       setPreviewModalVisible(true);
//       setCurrentPreviewIndex(0); // Start with the first file
//     }
//   };

//   const handlePreviewClose = () => {
//     setPreviewModalVisible(false);
//     setCurrentPreviewIndex(0); // Reset to the first file
//   };

//   const handleNextPreview = () => {
//     setCurrentPreviewIndex((prevIndex) => (prevIndex + 1) % fileList.length);
//   };

//   const handlePrevPreview = () => {
//     setCurrentPreviewIndex((prevIndex) =>
//       prevIndex === 0 ? fileList.length - 1 : prevIndex - 1
//     );
//   };

//   return (
//     <div className="space-y-4">
//       <Modal
//         title="Upload Files"
//         visible={isModalVisible}
//         onCancel={handleModalClose}
//         footer={[
//           <Button key="back" onClick={handleModalClose}>Cancel</Button>,
//           <Button
//             key="submit"
//             type="primary"
//             onClick={handleUpload}
//             disabled={fileList.length === 0}
//           >
//             Upload
//           </Button>,
//         ]}
//       >
//         <Upload
//           multiple
//           fileList={fileList}
//           onChange={handleFileChange}
//           beforeUpload={() => false} // Prevent auto upload
//         >
//           <Button icon={<LucideUpload className="h-5 w-5" />}>Select Files</Button>
//         </Upload>

//         {fileList.length > 0 && (
//           <div className="mt-4">
//             <h4 className="font-semibold">Selected Files:</h4>
//             {fileList.map((file) => (
//               <div key={file.uid} className="flex justify-between items-center">
//                 <a
//                   href="#"
//                   onClick={() => handlePreview(file.url)}
//                   className="text-blue-500 text-sm"
//                 >
//                   {file.name}
//                 </a>
//                 <Button
//                   type="link"
//                   onClick={() => handleFileChange({ fileList: [] })} // Update with new file
//                   className="text-red-500"
//                 >
//                   Change
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal>

//       {/* Preview Modal for images */}
//       <Modal
//         visible={previewModalVisible}
//         onCancel={handlePreviewClose}
//         footer={[
//           <Button key="prev" onClick={handlePrevPreview}>Previous</Button>,
//           <Button key="next" onClick={handleNextPreview}>Next</Button>,
//         ]}
//       >
//         <div>
//           <img
//             src={fileList[currentPreviewIndex]?.url || fileList[currentPreviewIndex]?.thumbUrl}
//             alt="Preview"
//             className="w-full h-auto"
//           />
//         </div>
//       </Modal>

//       {renderTaskSection("Visa Applications", clientTasks.applications, "applicationModel")}
//       {renderTaskSection("Document Translations", clientTasks.documentTranslation, "documentTranslationModel")}
//       {renderTaskSection("Design Services", clientTasks.graphicDesigns, "GraphicDesignModel")}
//       {renderTaskSection("Japan Visit Applications", clientTasks.japanVisit, "japanVisitApplicationModel")}
//       {renderTaskSection("E-passport Applications", clientTasks.epassport, "ePassportModel")}
//       {renderTaskSection("Other Services", clientTasks.otherServices, "OtherServiceModel")}
//     </div>
//   );
// };

// export default FilesTab;












import React, { useState, useEffect } from 'react';
import { Button, Modal, Upload, message } from 'antd';
import { Upload as LucideUpload, Eye } from 'lucide-react'; // Lucide icon
import { useAccountTaskGlobally } from '../../context/AccountTaskContext';

const FilesTab = () => {
  const { accountTaskData, selectedClientId } = useAccountTaskGlobally();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedModelName, setSelectedModelName] = useState('');
  const [clientTasks, setClientTasks] = useState({
    applications: [],
    appointment: [],
    documentTranslation: [],
    epassport: [],
    graphicDesigns: [],
    japanVisit: [],
    otherServices: [],
  });
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);

  // Fetch tasks based on clientId
  useEffect(() => {
    if (accountTaskData && selectedClientId) {
      const updatedClientTasks = {
        applications: [],
        appointment: [],
        documentTranslation: [],
        epassport: [],
        graphicDesigns: [],
        japanVisit: [],
        otherServices: [],
      };

      Object.keys(accountTaskData).forEach((key) => {
        const modelData = accountTaskData[key];
        if (Array.isArray(modelData)) {
          modelData.forEach((item) => {
            if (item?.clientId?._id === selectedClientId) {
              if (key === "application") updatedClientTasks.applications.push(item);
              if (key === "appointment") updatedClientTasks.appointment.push(item);
              if (key === "documentTranslation") updatedClientTasks.documentTranslation.push(item);
              if (key === "epassports") updatedClientTasks.epassport.push(item);
              if (key === "graphicDesigns") updatedClientTasks.graphicDesigns.push(item);
              if (key === "japanVisit") updatedClientTasks.japanVisit.push(item);
              if (key === "otherServices") updatedClientTasks.otherServices.push(item);
            }
          });
        }
      });

      setClientTasks(updatedClientTasks);
    }
  }, [selectedClientId, accountTaskData]);

  const renderTaskSection = (title, tasks, modelName) => {
    return (
      tasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-gray-50 p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{task.clientId.name || task.clientName}</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    icon={<LucideUpload className="h-6 w-6 text-black" />} // Increased size and black color
                    onClick={() => handleModalOpen(task._id, modelName)}
                    size="small"
                    type="link"
                    className="text-blue-500"
                  />
                  {/* Eye Button for file preview */}
                  <Button
                    icon={<Eye className="h-6 w-6 text-black" />} // Increased size and black color
                    onClick={() => handlePreviewOpen(task)}
                    size="small"
                    type="link"
                    className="text-green-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    );
  };

  // Open Modal for file upload
  const handleModalOpen = (taskId, modelName) => {
    setSelectedTaskId(taskId);
    setSelectedModelName(modelName);
    setIsModalVisible(true);
  };

  // Close Modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setFileList([]);
  };

  // Handle file selection
  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select files before uploading.');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('clientFiles', file.originFileObj);
    });

    const loadingMessage = message.loading('Uploading files...', 0);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/fileUpload/${selectedClientId}/${selectedModelName}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();

      if (data.success) {
        message.success('Files uploaded successfully!');
      } else {
        message.error(data.message || 'Failed to upload files.');
      }
    } catch (error) {
      message.error('An error occurred while uploading files.');
    } finally {
      loadingMessage();
    }

    setFileList([]);
    setIsModalVisible(false);
  };

  const handlePreviewOpen = (task) => {
    if (task?.clientFiles?.length > 0) {
      console.log('Previewing files:', task.clientFiles); // Debugging log
      setPreviewFiles(task.clientFiles);
      setPreviewModalVisible(true);
    } else {
      message.warning('No files available for preview.');
      console.log('No files found for task:', task); // Debugging log
    }
  };
  
  
  const handlePreviewClose = () => {
    setPreviewModalVisible(false);
    setPreviewFiles([]);
  };
  
  // JSX for the Preview Modal
  <Modal
    title="Preview Files"
    open={previewModalVisible}
    onCancel={handlePreviewClose}
    footer={null}
    width="90%"
  >
    <div className="p-4 bg-gray-50 space-y-4">
      {previewFiles.map((fileUrl, index) => (
        <iframe
          key={index}
          src={fileUrl.endsWith('.pdf') ? fileUrl : `https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
          className="w-full h-96 border"
          title={`Preview ${index + 1}`}
        />
      ))}
    </div>
  </Modal>
  



  return (
    <div className="space-y-4">
      <Modal
        title="Upload Files"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload
          multiple
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false} // Prevent auto upload
        >
          <Button icon={<LucideUpload className="h-5 w-5" />}>Select Files</Button>
        </Upload>

        {fileList.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold">Selected Files:</h4>
            {fileList.map((file) => (
              <div key={file.uid} className="flex justify-between items-center">
                <a
                  href="#"
                  onClick={() => handlePreview(file.url)}
                  className="text-blue-500 text-sm"
                >
                  {file.name}
                </a>
                <Button
                  type="link"
                  onClick={() => handleFileChange({ fileList: [] })} // Update with new file
                  className="text-red-500"
                >
                  Change
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Preview Modal for Google Docs Viewer */}
      {/* <Modal
        visible={previewModalVisible}
        onCancel={handlePreviewClose}
        footer={null}
        width="80%" // Adjust the modal width as needed
      >
        <div className="flex-1 p-4 bg-gray-50 overflow-auto space-y-4">
          {previewFiles.map((fileUrl, idx) => (
            <iframe
              key={idx}
              src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
              className="w-full h-64 border mb-4"
              title={`Preview ${idx + 1}`}
            />
          ))}
        </div>
      </Modal> */}


<Modal
  title="Preview Files"
  open={previewModalVisible}
  onCancel={handlePreviewClose}
  footer={null}
  width="90%"
>
  <div className="p-4 bg-gray-50 space-y-4">
    {previewFiles.map((fileUrl, index) => (
      <iframe
        key={index}
        src={fileUrl.endsWith('.pdf') ? fileUrl : `https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
        className="w-full h-96 border"
        title={`Preview ${index + 1}`}
      />
    ))}
  </div>
</Modal>

      {renderTaskSection("Visa Applications", clientTasks.applications, "applicationModel")}
      {renderTaskSection("Document Translations", clientTasks.documentTranslation, "documentTranslationModel")}
      {renderTaskSection("Design Services", clientTasks.graphicDesigns, "GraphicDesignModel")}
      {renderTaskSection("Japan Visit Applications", clientTasks.japanVisit, "japanVisitApplicationModel")}
      {renderTaskSection("E-passport Applications", clientTasks.epassport, "ePassportModel")}
      {renderTaskSection("Other Services", clientTasks.otherServices, "OtherServiceModel")}
    </div>
  );
};

export default FilesTab;
