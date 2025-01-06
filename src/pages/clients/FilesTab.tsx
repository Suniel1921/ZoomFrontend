// import React, { useState, useEffect } from 'react';
// import { Button, Modal, Upload, message } from 'antd';
// import { Upload as LucideUpload, Eye, FileText, Trash2 } from 'lucide-react'; // Lucide icon
// import { useAccountTaskGlobally } from '../../context/AccountTaskContext';

// const FilesTab = ({getAllModelData}) => {
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
//   const [previewFiles, setPreviewFiles] = useState([]);
//   const [fileModalVisible, setFileModalVisible] = useState(false); // To manage file modal visibility


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

//                 <div className="flex space-x-2">
//                   <Button
//                     icon={<LucideUpload className="h-6 w-6 text-black" />} // Increased size and black color
//                     onClick={() => handleModalOpen(task._id, modelName)}
//                     size="small"
//                     type="link"
//                     className="text-blue-500"
//                   />
//                   {/* Eye Button for file preview */}
//                   <Button
//                     icon={<Eye className="h-6 w-6 text-black" />} // Increased size and black color
//                     onClick={() => handlePreviewOpen(task)}
//                     size="small"
//                     type="link"
//                     className="text-green-500"
//                   />

//                   {/* File Button to open the new modal */}
//                   <Button
//                     icon={<FileText className="h-6 w-6 text-black" />}
//                     onClick={() =>
//                       handleFileModalOpen(task.clientFiles, modelName)
//                     }
//                     size="small"
//                     type="link"
//                     className="text-orange-500"
//                   />

//                 </div>
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

//   const handlePreviewOpen = (task) => {
//     if (task?.clientFiles?.length > 0) {
//       console.log('Previewing files:', task.clientFiles); // Debugging log
//       setPreviewFiles(task.clientFiles);
//       setPreviewModalVisible(true);
//     } else {
//       message.warning('No files available for preview.');
//       console.log('No files found for task:', task); // Debugging log
//     }
//   };

//   const handlePreviewClose = () => {
//     setPreviewModalVisible(false);
//     setPreviewFiles([]);
//   };


  
//   // Open the new modal showing all client files
//   const handleFileModalOpen = (files, modelName) => {
//     setPreviewFiles(files);
//     setSelectedModelName(modelName); // Update model name here
//     setFileModalVisible(true);
//   };

//    // Close the file modal
//    const handleFileModalClose = () => {
//     setFileModalVisible(false);
//     setPreviewFiles([]);
//   };

//   const handleDeleteFile = async (fileUrl) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/deleteFile`,
//         {
//           method: "DELETE",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             clientId: selectedClientId,
//             modelName: selectedModelName,
//             fileUrl,
//           }),
//         }
//       );

//       const data = await response.json();
//       if (data.success) {
//         getAllModelData();
//         message.success("File deleted successfully!");
//         setPreviewFiles(previewFiles.filter((file) => file !== fileUrl));
//       } else {
//         message.error(data.message || "Failed to delete file.");
//       }
//     } catch (error) {
//       message.error("An error occurred while deleting the file.");
//     }
//   };



//   // JSX for the Preview Modal
//   <Modal
//     title="Preview Files"
//     open={previewModalVisible}
//     onCancel={handlePreviewClose}
//     footer={null}
//     width="90%"
//   >
//     <div className="p-4 bg-gray-50 space-y-4">
//       {previewFiles.map((fileUrl, index) => (
//         <iframe
//           key={index}
//           src={fileUrl.endsWith('.pdf') ? fileUrl : `https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
//           className="w-full h-96 border"
//           title={`Preview ${index + 1}`}
//         />
//       ))}
//     </div>
//   </Modal>

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

// <Modal
//   title="Preview Files"
//   open={previewModalVisible}
//   onCancel={handlePreviewClose}
//   footer={null}
//   width="90%"
// >
//   <div className="p-4 bg-gray-50 space-y-4">
//     {previewFiles.map((fileUrl, index) => (
//       <iframe
//         key={index}
//         src={fileUrl.endsWith('.pdf') ? fileUrl : `https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
//         className="w-full h-96 border"
//         title={`Preview ${index + 1}`}
//       />
//     ))}
//   </div>
// </Modal>

//  {/* Modal for Viewing Client Files */}
//  <Modal
//         title="Client Files"
//         open={fileModalVisible}
//         onCancel={handleFileModalClose}
//         footer={null}
//         width="80%"
//        >
//         <div className="space-y-4">
//           {previewFiles.map((fileUrl, index) => (
//             <div
//               key={index}
//               className="flex justify-between items-center p-2 border-b"
//             >
//               <a
//                 href={fileUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500"
//               >
//                 {fileUrl.split("/").pop()}
//               </a>
//               <Button
//                 icon={<Trash2 className="h-5 w-5 text-red-500" />}
//                 onClick={() => handleDeleteFile(fileUrl, selectedModelName)}
//                 type="link"
//               />
//             </div>
//           ))}
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
import { Upload as LucideUpload, Eye, FileText, Trash2 } from 'lucide-react'; // Lucide icon
import { useAccountTaskGlobally } from '../../context/AccountTaskContext';

const FilesTab = ({ getAllModelData }) => {
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
  const [fileModalVisible, setFileModalVisible] = useState(false); // To manage file modal visibility

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
              className="bg-gray-50 p-3 rounded-lg border border-gray-400 transition-shadow duration-300"

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

                  {/* File Button to open the new modal */}
                  <Button
                    icon={<FileText className="h-6 w-6 text-black" />}
                    onClick={() =>
                      handleFileModalOpen(task.clientFiles, modelName)
                    }
                    size="small"
                    type="link"
                    className="text-orange-500"
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

  // Open the new modal showing all client files
  const handleFileModalOpen = (files, modelName) => {
    setPreviewFiles(files);
    setSelectedModelName(modelName); // Update model name here
    setFileModalVisible(true);
  };

  // Close the file modal
  const handleFileModalClose = () => {
    setFileModalVisible(false);
    setPreviewFiles([]);
  };

  const handleDeleteFile = async (fileUrl) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/deleteFile`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: selectedClientId,
            modelName: selectedModelName,
            fileUrl,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        getAllModelData();
        message.success("File deleted successfully!");
        setPreviewFiles(previewFiles.filter((file) => file !== fileUrl));
      } else {
        message.error(data.message || "Failed to delete file.");
      }
    } catch (error) {
      message.error("An error occurred while deleting the file.");
    }
  };

  // JSX for the Preview Modal
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

      {/* Modal for Viewing Client Files */}
      <Modal
        title="Client Files"
        open={fileModalVisible}
        onCancel={handleFileModalClose}
        footer={null}
        width="80%"
      >
        <div className="space-y-4">
          {previewFiles.map((fileUrl, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 border-b"
            >
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                {fileUrl.split("/").pop()}
              </a>
              <Button
                icon={<Trash2 className="h-5 w-5 text-red-500" />}
                onClick={() => handleDeleteFile(fileUrl)}
                type="link"
              />
            </div>
          ))}
        </div>
      </Modal>

      {/* Preview Files Modal */}
      <Modal
        title="Preview Files"
        open={previewModalVisible}
        onCancel={handlePreviewClose}
        footer={null}
        width="60%"
      >
        <div className="p-4 bg-gray-50 space-y-4">
          {previewFiles.map((fileUrl, index) => {
            const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/);
            const isPDF = fileUrl.endsWith('.pdf');
            return (
              <div key={index}>
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-auto border"
                  />
                ) : isPDF ? (
                  <iframe
                    src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
                    className="w-full h-96 border"
                    title={`Preview ${index + 1}`}
                  />
                ) : (
                  <p>File format not supported for preview</p>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Task Sections */}
      {renderTaskSection("Applications", clientTasks.applications, "application")}
      {renderTaskSection("Appointment", clientTasks.appointment, "appointment")}
      {renderTaskSection("Document Translation", clientTasks.documentTranslation, "documentTranslation")}
      {renderTaskSection("E-Passport", clientTasks.epassport, "epassport")}
      {renderTaskSection("Graphic Designs", clientTasks.graphicDesigns, "graphicDesigns")}
      {renderTaskSection("Japan Visit", clientTasks.japanVisit, "japanVisit")}
      {renderTaskSection("Other Services", clientTasks.otherServices, "otherServices")}
    </div>
  );
};

export default FilesTab;

