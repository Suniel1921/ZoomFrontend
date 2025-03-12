
// components/dashboard/NotificationManager.tsx
import React, { useState, useEffect } from 'react';
import TaskAlertNotification from '../../components/notification/TaskAlertNotication';

interface NotificationManagerProps {
  notifications: TaskAlert[];
  onDismiss: (taskId: string) => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ notifications, onDismiss }) => {
  const [currentNotification, setCurrentNotification] = useState<TaskAlert | null>(null);
  const [queue, setQueue] = useState<TaskAlert[]>([]);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      setQueue(notifications);
      setCurrentNotification(notifications[0]);
    }
  }, [notifications]);

  useEffect(() => {
    if (currentNotification) {
      const timer = setTimeout(() => {
        handleDismiss(currentNotification.taskId);
      }, 5000); // Show each notification for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  const handleDismiss = (taskId: string) => {
    onDismiss(taskId);
    setQueue(prev => {
      const newQueue = prev.slice(1);
      setCurrentNotification(newQueue[0] || null);
      return newQueue;
    });
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50" aria-live="polite">
      {currentNotification && (
        <TaskAlertNotification
          key={`${currentNotification.taskId}-${currentNotification.alertType}`}
          alert={currentNotification}
          onDismiss={() => handleDismiss(currentNotification.taskId)}
        />
      )}
    </div>
  );
};