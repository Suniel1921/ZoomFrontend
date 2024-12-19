// ********NEW CODE**********


// import React, { useState, useEffect } from 'react';
// import { Timeline, Select, message } from 'antd';
// import { CheckCircle, Clock, XCircle } from 'lucide-react';

// const { Option } = Select;

// const Step = ({ client, allData }) => {
//   const [completedSteps, setCompletedSteps] = useState({});
//   const [clientDataList, setClientDataList] = useState([]);

//   // Validate the structure of allData
//   if (!allData) {
//     console.error('Invalid allData structure:', allData);
//     return <p>Data structure is invalid.</p>;
//   }

//   // Find clientData based on client ID across all models (application, epassports, japanVisa, etc.)
//   const findClientData = (model) => {
//     return allData[model]?.find((data) => String(data.clientId?._id) === String(client));
//   };

//   // Collect client data from each model (e.g., application, epassports, japanVisa)
//   const clientDataApplication = findClientData("application");
//   const clientDataEpassport = findClientData("epassports");
//   const clientDataJapanVisa = findClientData("japanVisa");

//   // Merge all client data
//   useEffect(() => {
//     const newClientDataList = [
//       { model: "Application", data: clientDataApplication },
//       { model: "Epassport", data: clientDataEpassport },
//       { model: "Japan Visa", data: clientDataJapanVisa },
//     ].filter((item) => item.data); // Only keep models that have data for this client

//     setClientDataList(newClientDataList);
//   }, [clientDataApplication, clientDataEpassport, clientDataJapanVisa]); // Dependencies to update list when data changes

//   // Initialize completed steps when clientDataList is available
//   useEffect(() => {
//     if (clientDataList.length === 0) {
//       return;
//     }
//     const initialSteps = {};
//     clientDataList.forEach((modelData) => {
//       if (modelData.data?.step) {
//         Object.entries(modelData.data.step).forEach(([stepName, stepData]) => {
//           initialSteps[stepName] = stepData.status || 'pending'; // Default to 'pending' if status not available
//         });
//       }
//     });
//     setCompletedSteps(initialSteps);
//   }, [clientDataList]); // Runs once the clientDataList is set

//   // Update step status
//   const handleStatusChange = (step, value) => {
//     setCompletedSteps((prevState) => ({
//       ...prevState,
//       [step]: value,
//     }));

//     // Sync status with the server  (udpate for application visa)
//     fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateStatus/${client}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ step, status: value }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           message.success('Status updated successfully!');
//         } else {
//           message.error(data.message || 'Failed to update status.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error in fetch:', error);
//         message.error('Failed to communicate with the server.');
//       });
//   };

//   // Render step status with color and icon
//   const renderStatus = (status) => {
//     switch (status) {
//       case 'completed':
//         return { color: 'green', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
//       case 'processing':
//         return { color: 'yellow', icon: <Clock className="h-5 w-5 text-yellow-500" /> };
//       default:
//         return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
//     }
//   };

//   // Render steps for a specific model
//   const renderSteps = (modelData) => {
//     return Object.entries(modelData.data?.step?.stepNames || {}).map(([stepName, stepData]) => {
//       const status = stepData.status || 'pending'; // Default to 'pending'
//       const { color, icon } = renderStatus(status);

//       return (
//         <Timeline.Item key={stepName} color={color} dot={icon}>
//           <div className="flex items-center justify-between">
//             <h2>
//               {stepName}{" "}
//               {status === 'completed'
//                 ? '(Completed)'
//                 : status === 'processing'
//                 ? '(Processing)'
//                 : '(Pending)'}
//             </h2>
//             <Select
//               value={status}
//               style={{ width: 120 }}
//               onChange={(value) => handleStatusChange(stepName, value)}
//             >
//               <Option value="pending">Pending</Option>
//               <Option value="processing">Processing</Option>
//               <Option value="completed">Completed</Option>
//             </Select>
//           </div>
//         </Timeline.Item>
//       );
//     });
//   };

//   return (
//     <div>
//       <h1>Client: {client}</h1>
//       {clientDataList.map((modelData) => (
//         <div key={modelData.model}>
//           <h2>{modelData.model} Steps</h2>
//           <Timeline>
//             {renderSteps(modelData)}
//           </Timeline>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Step;












// ****************************both working (if you call the applicationModel while updating the code then below code work and above not (check appliacationController )) *****************************



// import React, { useState, useEffect } from 'react';
// import { Timeline, Select, message } from 'antd';
// import { CheckCircle, Clock, XCircle } from 'lucide-react';

// const { Option } = Select;

// const Step = ({ client, allData }) => {
//   const [completedSteps, setCompletedSteps] = useState({});
//   const [clientDataList, setClientDataList] = useState([]);

//   // Validate the structure of allData
//   if (!allData) {
//     console.error('Invalid allData structure:', allData);
//     return <p>Data structure is invalid.</p>;
//   }

//   // Find clientData based on client ID across all models (application, epassports, japanVisa, etc.)
//   const findClientData = (model) => {
//     return allData[model]?.find((data) => String(data.clientId?._id) === String(client));
//   };

//   // Collect client data from each model (e.g., application, epassports, japanVisa)
//   const clientDataApplication = findClientData("application");
//   const clientDataEpassport = findClientData("epassports");
//   const clientDataJapanVisa = findClientData("japanVisa");

//   // Merge all client data
//   useEffect(() => {
//     const newClientDataList = [
//       { model: "Application", data: clientDataApplication },
//       { model: "Epassport", data: clientDataEpassport },
//       { model: "Japan Visa", data: clientDataJapanVisa },
//     ].filter((item) => item.data); // Only keep models that have data for this client

//     setClientDataList(newClientDataList);
//   }, [clientDataApplication, clientDataEpassport, clientDataJapanVisa]); // Dependencies to update list when data changes

//   // Initialize completed steps when clientDataList is available
//   useEffect(() => {
//     if (clientDataList.length === 0) {
//       return;
//     }
//     const initialSteps = {};
//     clientDataList.forEach((modelData) => {
//       if (modelData.data?.step) {
//         Object.entries(modelData.data.step).forEach(([stepName, stepData]) => {
//           initialSteps[stepName] = stepData.status || 'pending'; // Default to 'pending' if status not available
//         });
//       }
//     });
//     setCompletedSteps(initialSteps);
//   }, [clientDataList]); // Runs once the clientDataList is set

//   // Update step status
//   const handleStatusChange = (step, value) => {
//     const stepId = step;  // Assuming 'step' is the name of the step and used as the ID
  
//     setCompletedSteps((prevState) => ({
//       ...prevState,
//       [step]: value,
//     }));
  
//     // Sync status with the server
//     fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateStatus`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         clientId: client,    // Ensure you're sending the clientId correctly
//         stepId: stepId,      // Include stepId in the body
//         status: value,       // The new status (pending, processing, completed)
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           message.success('Status updated successfully!');
//         } else {
//           message.error(data.message || 'Failed to update status.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error in fetch:', error);
//         message.error('Failed to communicate with the server.');
//       });
//   };
  

//   // Render step status with color and icon
//   const renderStatus = (status) => {
//     switch (status) {
//       case 'completed':
//         return { color: 'green', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
//       case 'processing':
//         return { color: 'yellow', icon: <Clock className="h-5 w-5 text-yellow-500" /> };
//       default:
//         return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
//     }
//   };

//   // Render steps for a specific model
//   const renderSteps = (modelData) => {
//     return Object.entries(modelData.data?.step?.stepNames || {}).map(([stepName, stepData]) => {
//       const status = stepData.status || 'pending'; // Default to 'pending'
//       const { color, icon } = renderStatus(status);

//       return (
//         <Timeline.Item key={stepData.id || stepName} color={color} dot={icon}>  {/* Use stepData.id if available */}
//           <div className="flex items-center justify-between">
//             <h2>
//               {stepName}{" "}
//               {status === 'completed'
//                 ? '(Completed)'
//                 : status === 'processing'
//                 ? '(Processing)'
//                 : '(Pending)'}
//             </h2>
//             <Select
//               value={status}
//               style={{ width: 120 }}
//               onChange={(value) => handleStatusChange(stepName, value)}
//             >
//               <Option value="pending">Pending</Option>
//               <Option value="processing">Processing</Option>
//               <Option value="completed">Completed</Option>
//             </Select>
//           </div>
//         </Timeline.Item>
//       );
//     });
//   };

//   return (
//     <div>
//       <h1>Client: {client}</h1>
//       {clientDataList.map((modelData) => (
//         <div key={modelData.model}>
//           <h2>{modelData.model} Steps</h2>
//           <Timeline>
//             {renderSteps(modelData)}
//           </Timeline>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Step;










// import React, { useState, useEffect } from 'react';
// import { Timeline, Select, message } from 'antd';
// import { CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

// const { Option } = Select;

// const Step = ({ client, allData }) => {
//   const [completedSteps, setCompletedSteps] = useState({});
//   const [clientDataList, setClientDataList] = useState([]);
//   console.log('Client data is:', allData);

//   // Validate the structure of allData
//   if (!allData) {
//     console.error('Invalid allData structure:', allData);
//     return <p>Data structure is invalid.</p>;
//   }

//   // Collect client data from each model
//   useEffect(() => {
//     const newClientDataList = Object.keys(allData)
//       .map((model) => {
//         const modelData = allData[model]?.find((data) => String(data.clientId?._id) === String(client));
//         return modelData ? { model, data: modelData } : null;
//       })
//       .filter((item) => item !== null); // Filter out null values (models with no data)

//     setClientDataList(newClientDataList);
//   }, [allData, client]);

//   // Initialize completed steps
//   useEffect(() => {
//     if (clientDataList.length === 0) {
//       return;
//     }
//     const initialSteps = {};
//     clientDataList.forEach((modelData) => {
//       if (modelData.data?.steps) {
//         modelData.data.steps.forEach((stepData) => {
//           initialSteps[stepData._id] = stepData.status || 'pending'; // Default to 'pending' if status not available
//         });
//       }
//     });
//     setCompletedSteps(initialSteps);
//   }, [clientDataList]);

//   // Update step status
//   const handleStatusChange = (stepId, value, modelName) => {
//     // Ensure model name is in lowercase before passing to backend
//     const updatedModelName = modelName.toLowerCase();

//     // Optimistic update: change the status in the frontend first
//     setCompletedSteps((prevState) => ({
//       ...prevState,
//       [stepId]: value,
//     }));

//     // Prepare the step update
//     const stepsToUpdate = [{ stepId, status: value, clientId: client, modelName: updatedModelName }];
    
//     // Call the batch update function
//     handleBatchStatusChange(stepsToUpdate);
//   };

//   // Send the batch update request
//   const handleBatchStatusChange = (stepsToUpdate) => {
//     console.log('Batch status update:', stepsToUpdate);
//     fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateStatus`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         clientId: client,
//         steps: stepsToUpdate, // Send all the step updates with model names
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) {
//           message.success('Statuses updated successfully!');
//         } else {
//           message.error(data.message || 'Failed to update statuses.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error in fetch:', error);
//         message.error('Failed to communicate with the server.');
//       });
//   };

//   // Render step status with color and icon
//   const renderStatus = (status) => {
//     switch (status) {
//       case 'completed':
//         return { color: 'green', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
//       case 'processing':
//         return { color: 'yellow', icon: <Clock className="h-5 w-5 text-yellow-500" /> };
//       case 'in-progress':
//         return { color: 'blue', icon: <Loader className="h-5 w-5 text-blue-500 animate-spin" /> }; // Adding blue color and spin animation for "in-progress"
//       default:
//         return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
//     }
//   };

//   // Render steps for a specific model
//   const renderSteps = (modelData) => {
//     return modelData.data?.steps?.map((stepData) => {
//       const status = stepData.status || 'pending'; // Default to 'pending'
//       const { color, icon } = renderStatus(status);

//       return (
//         <Timeline.Item key={stepData._id} color={color} dot={icon}>
//           <div className="flex items-center justify-between">
//             <span>{stepData.name}</span>
//             <Select
//               value={status}
//               style={{ width: 120 }}
//               onChange={(value) => handleStatusChange(stepData._id, value, modelData.model)} // Pass model name here
//             >
//               <Option value="pending">Pending</Option>
//               <Option value="in-progress">In-progress</Option>
//               <Option value="processing">Processing</Option>
//               <Option value="completed">Completed</Option>
//             </Select>
//           </div>
//         </Timeline.Item>
//       );
//     });
//   };

//   return (
//     <div>
//       <h1>Client: {client}</h1>
//       {clientDataList.length === 0 ? (
//         <p>No models found for this client.</p>
//       ) : (
//         clientDataList.map((modelData) => (
//           <div key={modelData.model}>
//             <h2>{modelData.model} Steps</h2>
//             <Timeline>
//               {renderSteps(modelData)}
//             </Timeline>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default Step;











import React, { useState, useEffect } from 'react';
import { Timeline, Select, message } from 'antd';
import { CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

const { Option } = Select;

const Step = ({ client, allData }) => {
  const [completedSteps, setCompletedSteps] = useState({});
  const [clientDataList, setClientDataList] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null); // Track selected model

  // Validate the structure of allData
  if (!allData) {
    console.error('Invalid allData structure:', allData);
    return <p>Data structure is invalid.</p>;
  }

  // Collect client data from each model
  useEffect(() => {
    const newClientDataList = Object.keys(allData)
      .map((model) => {
        const modelData = allData[model]?.find((data) => String(data.clientId?._id) === String(client));
        return modelData ? { model, data: modelData } : null;
      })
      .filter((item) => item !== null); // Filter out null values (models with no data)

    setClientDataList(newClientDataList);
  }, [allData, client]);

  // Initialize completed steps
  useEffect(() => {
    if (clientDataList.length === 0) {
      return;
    }
    const initialSteps = {};
    clientDataList.forEach((modelData) => {
      if (modelData.data?.steps) {
        modelData.data.steps.forEach((stepData) => {
          initialSteps[stepData._id] = stepData.status || 'pending'; // Default to 'pending' if status not available
        });
      }
    });
    setCompletedSteps(initialSteps);
  }, [clientDataList]);

  // Update step status
  const handleStatusChange = (stepId, value, modelName) => {
    const updatedModelName = modelName.toLowerCase();
    setCompletedSteps((prevState) => ({
      ...prevState,
      [stepId]: value,
    }));

    const stepsToUpdate = [{ stepId, status: value, clientId: client, modelName: updatedModelName }];
    handleBatchStatusChange(stepsToUpdate);
  };

  // Send the batch update request
  const handleBatchStatusChange = (stepsToUpdate) => {
    console.log('Batch status update:', stepsToUpdate);
    fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateStatus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: client,
        steps: stepsToUpdate,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          message.success('Statuses updated successfully!');
        } else {
          message.error(data.message || 'Failed to update statuses.');
        }
      })
      .catch((error) => {
        console.error('Error in fetch:', error);
        message.error('Failed to communicate with the server.');
      });
  };

  // Render step status with color and icon
  const renderStatus = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'green', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
      case 'processing':
        return { color: 'yellow', icon: <Clock className="h-5 w-5 text-yellow-500" /> };
      case 'in-progress':
        return { color: 'blue', icon: <Loader className="h-5 w-5 text-blue-500 animate-spin" /> };
      default:
        return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
    }
  };

  // Render steps for a specific model
  const renderSteps = (modelData) => {
    return modelData.data?.steps?.map((stepData) => {
      const status = stepData.status || 'pending'; // Default to 'pending'
      const { color, icon } = renderStatus(status);

      return (
        <Timeline.Item key={stepData._id} color={color} dot={icon}>
          <div className="flex items-center justify-between">
            <span>{stepData.name}</span>
            <Select
              value={status}
              style={{ width: 120 }}
              onChange={(value) => handleStatusChange(stepData._id, value, modelData.model)} // Pass model name here
            >
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In-progress</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </div>
        </Timeline.Item>
      );
    });
  };

  return (
    <div>
      <h1>Client: {client}</h1>

      {/* Dropdown to select model */}
      <Select
        value={selectedModel}
        style={{ width: 200, marginBottom: 20 }}
        onChange={(value) => setSelectedModel(value)}
        placeholder="Select model"
      >
        {clientDataList.map((modelData) => (
          <Option key={modelData.model} value={modelData.model}>
            {modelData.model}
          </Option>
        ))}
      </Select>

      {clientDataList.length === 0 ? (
        <p>No models found for this client.</p>
      ) : (
        selectedModel && (
          <div>
            <h2>{selectedModel} Steps</h2>
            <Timeline>
              {clientDataList
                .filter((modelData) => modelData.model === selectedModel)
                .map((modelData) => renderSteps(modelData))}
            </Timeline>
          </div>
        )
      )}
    </div>
  );
};

export default Step;
