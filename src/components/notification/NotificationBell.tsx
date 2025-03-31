import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { Howl } from 'howler';
import { useAuthGlobally } from '../../context/AuthContext';

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  read: boolean;
  sender: {
    _id: string;
    name: string;
  };
  type: string;
  taskId: string;
  taskModel: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const soundRef = useRef<Howl | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = useRef(5);
  const retryCount = useRef(0);
  const [auth] = useAuthGlobally();
  const [isAudioPrimed, setIsAudioPrimed] = useState(false); // Track AudioContext priming

  const fetchNotifications = useCallback(async () => {
    if (!auth?.token) {
      console.log('No token available, skipping fetchNotifications');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/notify/getNotifications`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const fetchedNotifications = response.data?.notifications || [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      setNotifications([]);
    }
  }, [auth?.token]);

  useEffect(() => {
    soundRef.current = new Howl({
      src: ['/notification.mp3'], // Ensure this file is in /public
      preload: true,
      volume: 0.5,
      onload: () => console.log('Notification sound loaded'),
      onloaderror: (id, error) => console.error('Error loading sound:', error),
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (soundRef.current && isAudioPrimed) {
      if (!soundRef.current.playing()) {
        soundRef.current.play();
        console.log('Playing notification sound');
      } else {
        console.log('Sound already playing, skipping');
      }
    } else if (!isAudioPrimed) {
      console.log('Audio not primed yet, waiting for user interaction');
    }
  }, [isAudioPrimed]);

  const primeAudio = useCallback(() => {
    if (soundRef.current && !isAudioPrimed) {
      soundRef.current.play(); // Play briefly to prime AudioContext
      soundRef.current.stop(); // Stop immediately to avoid audible sound
      setIsAudioPrimed(true);
      console.log('AudioContext primed');
    }
  }, [isAudioPrimed]);

  const connectWebSocket = useCallback(() => {
    if (!auth?.token) {
      console.log('No token available, skipping WebSocket connection');
      return;
    }

    const wsUrl = `${import.meta.env.WS_URL || 'ws://localhost:3000'}?token=${auth.token}`;
    // const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}?token=${auth.token}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      retryCount.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    websocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        if (data.type === 'NEW_NOTIFICATION') {
          const newNotification = data.data || {};
          if (newNotification.type === 'TASK_ASSIGNED') { // Only play for TASK_ASSIGNED
            setNotifications((prev) => {
              if (!newNotification._id || prev.some((n) => n._id === newNotification._id)) return prev;
              return [newNotification, ...prev];
            });
            setUnreadCount((prev) => prev + 1);
            playNotificationSound();
          } else {
            // Add notification without sound for other types
            setNotifications((prev) => {
              if (!newNotification._id || prev.some((n) => n._id === newNotification._id)) return prev;
              return [newNotification, ...prev];
            });
            setUnreadCount((prev) => prev + (newNotification.read ? 0 : 1));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    websocket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      if (retryCount.current < maxRetries.current && event.code !== 1000) {
        const timeout = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
        retryCount.current++;
        console.log(`Attempting reconnection in ${timeout}ms (Retry ${retryCount.current}/${maxRetries.current})...`);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, timeout);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close(1000, 'Component unmounted');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [auth?.token, playNotificationSound]);

  useEffect(() => {
    if (auth?.token) {
      fetchNotifications();
      const cleanup = connectWebSocket();
      return () => cleanup?.();
    } else {
      console.log('No auth token, skipping initialization');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [fetchNotifications, connectWebSocket, auth?.token]);

  const markAsRead = async () => {
    if (!auth?.token) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/notify/markAsRead`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error.response?.data || error.message);
    }
  };

  const removeNotification = async (notificationId: string) => {
    if (!auth?.token) return;

    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/notify/${notificationId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error removing notification:', error.response?.data || error.message);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'TASK_ASSIGNED' && notification.taskModel === 'ePassportModel') {
      window.location.href = `/dashboard/epassport`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (unreadCount > 0) {
            markAsRead();
            primeAudio(); // Prime audio only when marking unread as read
          }
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-custom">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto border border-gray-200 animate-slide-in">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors animate-fade-in cursor-pointer ${
                    notification.read ? 'bg-white' : 'bg-blue-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notification.message || 'No message'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt || new Date().toISOString())}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification._id);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}