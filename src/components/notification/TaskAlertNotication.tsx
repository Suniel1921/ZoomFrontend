import React, { useEffect } from "react";
import { AlertTriangle, DollarSign, X } from "lucide-react";

interface TaskAlert {
  taskId: string;
  taskModel: string;
  message: string;
  priority?: "high" | "urgent";
  clientName?: string;
  dueAmount?: number;
  handledBy: string;
  alertType: "deadline" | "payment";
}

interface NotificationProps {
  alert: TaskAlert;
  onDismiss: () => void;
}

export default function TaskAlertNotification({ alert, onDismiss }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000); // Dismiss after 10 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isDeadlineAlert = alert.priority !== undefined;
  const gradientColor = isDeadlineAlert
    ? alert.priority === "urgent"
      ? "from-[#4C1D95] to-[#7C3AED]" // Purple gradient for urgent (deadline passed)
      : "from-[#1E3A8A] to-[#3B82F6]" // Blue gradient for high (deadline ≤ 2 days)
    : "from-[#14532D] to-[#22C55E]"; // Green gradient for payment follow-up
  const textColor = "text-white"; // White text for contrast
  const iconColor = "text-white"; // White icons for contrast

  return (
    <div
      className={`w-80 p-4 rounded-xl shadow-lg flex items-start space-x-4 bg-gradient-to-r ${gradientColor} border border-gray-300/20 animate-slide-in`}
    >
      {isDeadlineAlert ? (
        <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      ) : (
        <DollarSign className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      )}
      <div className="flex-1">
        <p className={`text-base font-semibold ${textColor}`}>{alert.message}</p>
        <p className={`text-sm ${textColor} opacity-80 mt-1`}>
          {alert.clientName} | {alert.taskModel}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className={`p-1 rounded-full hover:bg-white/20 transition-colors ${textColor}`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}