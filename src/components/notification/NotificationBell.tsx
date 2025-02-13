import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthGlobally } from '../../context/AuthContext';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [auth] = useAuthGlobally();

  const checkDeadlines = async () => {
    try {
      // Get current user's name from auth context
      const currentUserName = auth?.user?.fullName;
      
      if (!currentUserName) {
        console.log('No user name found');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/visaApplication/getAllVisaApplication`
      );
      
      const applications = response.data?.applications || [];
      
      if (!Array.isArray(applications) || applications.length === 0) {
        return;
      }

      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

      console.log('Two days from now:', twoDaysFromNow); // Debugging
      
      const deadlineNotifications = applications
        .filter(app => {
          if (!app?.deadline || !app?.handledBy || !app?.translationHandler) {
            return false;
          }
          
          const deadline = new Date(app.deadline);
          console.log('Deadline for app:', deadline); // Debugging

          // Compare with handler names instead of IDs
          const isHandlerMatch = app.handledBy === currentUserName || app.translationHandler === currentUserName;
          const isDeadlineApproaching = deadline <= twoDaysFromNow && deadline >= new Date();
          
          return isHandlerMatch && isDeadlineApproaching;
        })
        .map(app => ({
          id: app._id,
          message: `Deadline approaching for ${app.clientName || 'Unknown Client'}'s ${app.type || 'Visa'} application (${new Date(app.deadline).toLocaleDateString()})`,
          isRead: false,
          createdAt: new Date().toISOString()
        }));

      if (deadlineNotifications.length > 0) {
        setNotifications(prev => {
          const newNotifications = [...deadlineNotifications, ...prev];
          const uniqueNotifications = Array.from(
            new Map(newNotifications.map(item => [item.id, item])).values()
          );
          return uniqueNotifications;
        });
        
        setUnreadCount(prev => prev + deadlineNotifications.length);
        
        // Show toast for new notifications
        deadlineNotifications.forEach(notification => {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-white shadow-lg rounded-lg p-4 max-w-md`}>
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-sm text-gray-800">{notification.message}</p>
              </div>
            </div>
          ));
        });
      }
    } catch (error) {
      console.error('Error checking deadlines:', error);
      toast.error('Failed to check for notifications');
    }
  };

  useEffect(() => {
    if (auth?.user?.fullName) {
      checkDeadlines();
      const interval = setInterval(checkDeadlines, 60 * 1000); // Poll every 60 seconds
      return () => clearInterval(interval);
    }
  }, [auth?.user?.fullName]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Notifications **</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
