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



import React, { useState, useEffect } from 'react';
import { Timeline, Select, message } from 'antd';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const { Option } = Select;

const Step = ({ client, allData }) => {
  const [completedSteps, setCompletedSteps] = useState({});
  const [clientDataList, setClientDataList] = useState([]);

  // Validate the structure of allData
  if (!allData) {
    console.error('Invalid allData structure:', allData);
    return <p>Data structure is invalid.</p>;
  }

  // Find clientData based on client ID across all models (application, epassports, japanVisa, etc.)
  const findClientData = (model) => {
    return allData[model]?.find((data) => String(data.clientId?._id) === String(client));
  };

  // Collect client data from each model (e.g., application, epassports, japanVisa)
  const clientDataApplication = findClientData("application");
  const clientDataEpassport = findClientData("epassports");
  const clientDataJapanVisa = findClientData("japanVisa");

  // Merge all client data
  useEffect(() => {
    const newClientDataList = [
      { model: "Application", data: clientDataApplication },
      { model: "Epassport", data: clientDataEpassport },
      { model: "Japan Visa", data: clientDataJapanVisa },
    ].filter((item) => item.data); // Only keep models that have data for this client

    setClientDataList(newClientDataList);
  }, [clientDataApplication, clientDataEpassport, clientDataJapanVisa]); // Dependencies to update list when data changes

  // Initialize completed steps when clientDataList is available
  useEffect(() => {
    if (clientDataList.length === 0) {
      return;
    }
    const initialSteps = {};
    clientDataList.forEach((modelData) => {
      if (modelData.data?.step) {
        Object.entries(modelData.data.step).forEach(([stepName, stepData]) => {
          initialSteps[stepName] = stepData.status || 'pending'; // Default to 'pending' if status not available
        });
      }
    });
    setCompletedSteps(initialSteps);
  }, [clientDataList]); // Runs once the clientDataList is set

  // Update step status
  const handleStatusChange = (step, value) => {
    const stepId = step;  // Assuming 'step' is the name of the step and used as the ID
  
    setCompletedSteps((prevState) => ({
      ...prevState,
      [step]: value,
    }));
  
    // Sync status with the server
    fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateStatus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: client,    // Ensure you're sending the clientId correctly
        stepId: stepId,      // Include stepId in the body
        status: value,       // The new status (pending, processing, completed)
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          message.success('Status updated successfully!');
        } else {
          message.error(data.message || 'Failed to update status.');
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
      default:
        return { color: 'gray', icon: <XCircle className="h-5 w-5 text-gray-400" /> };
    }
  };

  // Render steps for a specific model
  const renderSteps = (modelData) => {
    return Object.entries(modelData.data?.step?.stepNames || {}).map(([stepName, stepData]) => {
      const status = stepData.status || 'pending'; // Default to 'pending'
      const { color, icon } = renderStatus(status);

      return (
        <Timeline.Item key={stepData.id || stepName} color={color} dot={icon}>  {/* Use stepData.id if available */}
          <div className="flex items-center justify-between">
            <h2>
              {stepName}{" "}
              {status === 'completed'
                ? '(Completed)'
                : status === 'processing'
                ? '(Processing)'
                : '(Pending)'}
            </h2>
            <Select
              value={status}
              style={{ width: 120 }}
              onChange={(value) => handleStatusChange(stepName, value)}
            >
              <Option value="pending">Pending</Option>
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
      {clientDataList.map((modelData) => (
        <div key={modelData.model}>
          <h2>{modelData.model} Steps</h2>
          <Timeline>
            {renderSteps(modelData)}
          </Timeline>
        </div>
      ))}
    </div>
  );
};

export default Step;
