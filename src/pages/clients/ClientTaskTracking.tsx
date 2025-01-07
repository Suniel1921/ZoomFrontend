import { useState, useEffect } from "react";
import { format } from "date-fns";
import FilesTab from "./FilesTab";
import ProcessFlowTab from "./ProcessFlowTab";
import Button from "../../components/Button";
import { useAccountTaskGlobally } from "../../context/AccountTaskContext";
import { Modal } from "antd";
import { Select, message } from "antd";
import { CheckCircle, Clock, XCircle, Loader } from "lucide-react";
import PaymentHistory from "./PaymentHistory";

const { Option } = Select;

export default function ClientTaskTracking({getAllModelData}) {
  const { accountTaskData, selectedClientId } = useAccountTaskGlobally();
  const [activeTab, setActiveTab] = useState("tasks");
  const [clientTasks, setClientTasks] = useState({
    applications: [],
    appointment: [],
    documentTranslation: [],
    epassport: [],
    graphicDesigns: [],
    japanVisit: [],
    otherServices: [],
  });
  const [visibleSteps, setVisibleSteps] = useState({}); // Tracks which tasks have visible steps
  const [completedSteps, setCompletedSteps] = useState({});

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

  const toggleStepVisibility = (taskId) => {
    setVisibleSteps((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };



  const renderStatus = (status) => {
    switch (status) {
      case "completed":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        };
      case "processing":
        return {
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
        };
      case "in-progress":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          icon: <Loader className="h-5 w-5 text-blue-500 animate-spin" />,
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          icon: <XCircle className="h-5 w-5 text-gray-400" />,
        };
    }
  };
  

  const handleStatusChange = (stepId, value, modelName) => {
    const updatedModelName = modelName.toLowerCase();
    setCompletedSteps((prevState) => ({
      ...prevState,
      [stepId]: value,
    }));

    const stepsToUpdate = [{ stepId, status: value, clientId: selectedClientId, modelName: updatedModelName }];
    handleBatchStatusChange(stepsToUpdate);
  };

  const handleBatchStatusChange = (stepsToUpdate) => {
    fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/updateStatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClientId,
        steps: stepsToUpdate,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          message.success("Statuses updated successfully!");
          getAllModelData();
        } else {
          message.error(data.message || "Failed to update statuses.");
        }
      })
      .catch((error) => {
        console.error("Error in fetch:", error);
        message.error("Failed to communicate with the server.");
      });
  };

  const renderTaskSection = (title, tasks, taskType) => {
    return (
      tasks.length > 0 && (
        <div>
          {/* <img src={tasks.profilePhoto} alt="" /> */}
          {/* <h1>{JSON.stringify(tasks.profilePhoto)}</h1> */}
  <h3 className="text-lg font-semibold mb-4">{title}</h3>
  <div className="space-y-4">
    {tasks.map((task) => (
      <div
        key={task._id}
        className="border border-gray-300 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex justify-between items-start">
          <div>
            {/* <p className="font-medium text-gray-800">{task.clientId.name || task.clientName}</p> */}
            <p className="text-sm text-gray-600">
              Status:{" "}
              <span className="font-semibold text-blue-500">
                {task.status || task.visaStatus || task.translationStatus || task.applicationStatus || task.jobStatus || "Pending"}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Deadline:{" "}
              {task.deadline
                ? format(new Date(task.deadline), "MMM d, yyyy")
                : "N/A"}
            </p>
          </div>

          <button
            className="text-brand-gray font-medium hover:underline"
            onClick={() => toggleStepVisibility(task._id)}
          >
            {visibleSteps[task._id] ? "Hide Steps" : "Update Step"}
          </button>
        </div>

        {task.steps &&
          visibleSteps[task._id] && (
            <div className="mt-4 border-t border-gray-200 pt-4 space-y-2">
              {task.steps.map((step) => {
                const status = step.status || "pending";
                const { bgColor, textColor, icon } = renderStatus(status);

                return (
                  <div
                    key={step._id}
                    className="flex items-center justify-between p-2 rounded border border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      {icon}
                      <div className="text-sm font-medium text-gray-700">{step.name}</div>
                    </div>
                    <Select
                      value={status}
                      style={{ width: 120 }}
                      onChange={(value) => handleStatusChange(step._id, value, taskType)}
                    >
                      <Option value="pending">Pending</Option>
                      <Option value="processing">Processing</Option>
                      <Option value="completed">Completed</Option>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    ))}
  </div>
</div>

      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tasks"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tasks
          </button>
          {/* <button
            onClick={() => setActiveTab("processes")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "processes"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Process Flows
          </button> */}
          <button
            onClick={() => setActiveTab("payment-history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payment-history"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "files"
                ? "border-brand-yellow text-brand-black"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Files
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {renderTaskSection("Visa Applications", clientTasks.applications, "application")}
          {/* {renderTaskSection("Appointments", clientTasks.appointment, "appointment")} */}
          {renderTaskSection("Document Translations", clientTasks.documentTranslation, "documentTranslation")}
          {renderTaskSection("Design Services", clientTasks.graphicDesigns, "graphicDesigns")}
          {renderTaskSection("Japan Visit Applications", clientTasks.japanVisit, "japanVisit")}
          {renderTaskSection("E-passport Applications", clientTasks.epassport, "epassport")}
          {renderTaskSection("Other Services", clientTasks.otherServices, "otherService")}
        </div>
      )}

      {activeTab === "processes" && <ProcessFlowTab />}
      {/* {activeTab === "payment-history" && <PaymentHistory />} */}
      {activeTab === "payment-history" && <PaymentHistory selectedClientId={selectedClientId} />}
      {activeTab === "files" && <FilesTab getAllModelData={getAllModelData} />} 
      {/* {activeTab === "files" && <FilesTab clientId={selectedClientId} modelName="applicationModel"  />}  */}
      
    </div>
  );
}










