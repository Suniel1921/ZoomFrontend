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
