import React, { useState } from "react";
import { AlertTriangle, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

interface TaskAlert {
  taskId: string;
  taskModel: string;
  message: string;
  priority?: "high" | "urgent";
  clientName?: string;
  dueAmount?: number;
  handledBy: string; // Updated to match DB
}

interface TaskAlertsProps {
  deadlineAlerts: TaskAlert[];
  paymentFollowUps: TaskAlert[];
}

export default function TaskAlerts({ deadlineAlerts, paymentFollowUps }: TaskAlertsProps) {
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);

  return (
    <div className="space-y-4">
      {deadlineAlerts.length > 0 && (
        <div>
          <button
            onClick={() => setIsDeadlineOpen(!isDeadlineOpen)}
            className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-900 bg-gray-100 rounded-t-md hover:bg-gray-200 focus:outline-none"
          >
            <span className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              Deadline Alerts ({deadlineAlerts.length})
            </span>
            {isDeadlineOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isDeadlineOpen && (
            <ul className="mt-2 space-y-2">
              {deadlineAlerts.map((alert) => (
                <li
                  key={alert.taskId}
                  className={`p-3 rounded-md shadow-sm ${
                    alert.priority === "urgent" ? "bg-red-50 border-l-4 border-red-500" : "bg-yellow-50 border-l-4 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start">
                    <AlertTriangle
                      className={`w-5 h-5 mr-2 ${alert.priority === "urgent" ? "text-red-600" : "text-yellow-600"}`}
                    />
                    <div>
                      <p className="text-sm text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">Task: {alert.taskModel} | ID: {alert.taskId}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {paymentFollowUps.length > 0 && (
        <div>
          <button
            onClick={() => setIsPaymentOpen(!isPaymentOpen)}
            className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-900 bg-gray-100 rounded-t-md hover:bg-gray-200 focus:outline-none"
          >
            <span className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
              Payment Follow-ups ({paymentFollowUps.length})
            </span>
            {isPaymentOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {isPaymentOpen && (
            <ul className="mt-2 space-y-2">
              {paymentFollowUps.map((alert) => (
                <li key={alert.taskId} className="p-3 rounded-md shadow-sm bg-orange-50 border-l-4 border-orange-500">
                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Client: {alert.clientName} | Task: {alert.taskModel} | ID: {alert.taskId}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}






