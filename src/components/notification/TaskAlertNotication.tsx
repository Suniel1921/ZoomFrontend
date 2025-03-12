import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskAlerts from './TaskAlerts';

interface AlertBellProps {
  deadlineAlerts: any[];
  paymentFollowUps: any[];
}

export default function AlertBell({ deadlineAlerts, paymentFollowUps }: AlertBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const totalAlerts = deadlineAlerts.length + paymentFollowUps.length;

  useEffect(() => {
    let currentIndex = 0;
    const allAlerts = [...deadlineAlerts, ...paymentFollowUps];

    if (allAlerts.length === 0) return;

    const interval = setInterval(() => {
      if (currentIndex < allAlerts.length) {
        const alert = allAlerts[currentIndex];
        const isDeadline = deadlineAlerts.includes(alert);

        toast.custom(
          (t) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {isDeadline ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isDeadline ? 'Deadline Alert' : 'Payment Follow-up'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{alert.message}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ),
          { duration: 5000 }
        );
        currentIndex++;
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [deadlineAlerts, paymentFollowUps]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {hasUnread && totalAlerts > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {totalAlerts}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                  <TaskAlerts deadlineAlerts={deadlineAlerts} paymentFollowUps={paymentFollowUps} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}