import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthGlobally } from './AuthContext';

interface Message {
  _id: string;
  from: {
    _id: string;
    name: string;
    superAdminPhoto?: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatContextType {
  privateChats: Map<string, Message[]>;
  groupChats: Map<string, Message[]>;
  users: any[];
  groups: any[];
  unreadCounts: Map<string, number>;
  sendPrivateMessage: (toId: string, content: string) => void;
  sendGroupMessage: (groupId: string, content: string) => void;
  createGroup: (name: string, members: string[]) => Promise<void>;
  markMessagesAsRead: (chatId: string, isGroup?: boolean) => Promise<void>;
  fetchPrivateChatHistory: (otherUserId: string) => Promise<void>;
  fetchGroupChatHistory: (groupId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }) => {
  const [auth] = useAuthGlobally();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [privateChats, setPrivateChats] = useState<Map<string, Message[]>>(new Map());
  const [groupChats, setGroupChats] = useState<Map<string, Message[]>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_URL,
    headers: { Authorization: `Bearer ${auth?.token}` },
  });

  const updateUnreadCount = useCallback((chatId, messages) => {
    const unreadCount = messages.filter(
      msg => !msg.read && msg.from._id !== auth?.user?.id // Changed from _id to id
    ).length;
    setUnreadCounts(prev => {
      const updated = new Map(prev);
      unreadCount > 0 ? updated.set(chatId, unreadCount) : updated.delete(chatId);
      return updated;
    });
  }, [auth?.user?.id]); // Changed from _id to id

  const fetchInitialData = useCallback(async () => {
    if (!auth?.token) return;

    try {
      const [adminsRes, superAdminsRes, groupsRes] = await Promise.all([
        api.get('/api/v1/admin/getAllAdmin'),
        api.get('/api/v1/superAdmin/getAllSuperAdmins'),
        api.get('/api/v1/chat/group/list'),
      ]);

      setUsers([
        ...(adminsRes.data.admins || []).map((admin) => ({ ...admin, role: 'admin' })),
        ...(superAdminsRes.data.superAdmins || []).map((superAdmin) => ({
          ...superAdmin,
          role: 'superadmin'
        })),
      ]);
      setGroups(groupsRes.data.groups || []);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  }, [auth?.token]);

  const fetchPrivateChatHistory = useCallback(async (otherUserId) => {
    if (!auth?.token) return;

    try {
      const response = await api.post('/api/v1/chat/history/private', { otherUserId });
      const messages = response.data.messages || [];
      const chatKey = [auth.user.id, otherUserId].sort().join('-'); // Changed from _id to id
      setPrivateChats(prev => {
        const updated = new Map(prev);
        updated.set(chatKey, messages);
        updateUnreadCount(chatKey, messages);
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch private chat history:', err);
    }
  }, [auth?.token, auth?.user?.id, updateUnreadCount]); // Changed from _id to id

  const fetchGroupChatHistory = useCallback(async (groupId) => {
    if (!auth?.token) return;

    try {
      const response = await api.post('/api/v1/chat/history/group', { groupId });
      const messages = response.data.messages || [];
      setGroupChats(prev => {
        const updated = new Map(prev);
        updated.set(groupId, messages);
        updateUnreadCount(groupId, messages);
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch group chat history:', err);
    }
  }, [auth?.token, auth?.user?.id, updateUnreadCount]); // Changed from _id to id

  const markMessagesAsRead = useCallback(async (chatId, isGroup = false) => {
    try {
      const chats = isGroup ? groupChats : privateChats;
      const setChats = isGroup ? setGroupChats : setPrivateChats;

      setChats(prev => {
        const updated = new Map(prev);
        const messages = updated.get(chatId) || [];
        const hasUnread = messages.some(msg => !msg.read && msg.from._id !== auth?.user?.id); // Changed from _id to id

        if (hasUnread) {
          const updatedMessages = messages.map(msg => ({
            ...msg,
            read: true,
          }));
          updated.set(chatId, updatedMessages);
        }
        return updated;
      });

      setUnreadCounts(prev => {
        const updated = new Map(prev);
        updated.delete(chatId);
        return updated;
      });

      await api.post(isGroup ? '/api/v1/chat/history/group' : '/api/v1/chat/history/private', {
        [isGroup ? 'groupId' : 'otherUserId']: chatId,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [privateChats, groupChats, auth?.user?.id, api]); // Changed from _id to id

  const connectWebSocket = useCallback(() => {
    if (!auth?.token) return;

    const websocket = new WebSocket(
      `${import.meta.env.VITE_REACT_APP_WS_URL || 'ws://localhost:3000'}?token=${auth.token}`
    );

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'PRIVATE_MESSAGE': {
            const key = [auth.user.id, data.message.from._id].sort().join('-'); // Changed from _id to id
            setPrivateChats(prev => {
              const updated = new Map(prev);
              const messages = [...(updated.get(key) || [])];
              const existingIdx = messages.findIndex(m => m._id === data.message._id || (m.content === data.message.content && m.timestamp === data.message.timestamp));
              if (existingIdx >= 0) {
                messages[existingIdx] = data.message;
              } else {
                messages.push(data.message);
              }
              updated.set(key, messages);
              updateUnreadCount(key, messages);
              return updated;
            });
            break;
          }
          case 'GROUP_MESSAGE': {
            setGroupChats(prev => {
              const updated = new Map(prev);
              const messages = [...(updated.get(data.groupId) || [])];
              const existingIdx = messages.findIndex(m => m._id === data.message._id || (m.content === data.message.content && m.timestamp === data.message.timestamp));
              if (existingIdx >= 0) {
                messages[existingIdx] = data.message;
              } else {
                messages.push(data.message);
              }
              updated.set(data.groupId, messages);
              updateUnreadCount(data.groupId, messages);
              return updated;
            });
            break;
          }
          case 'GROUP_CREATED': {
            setGroups(prev => [...prev, data.group]);
            setGroupChats(prev => {
              const updated = new Map(prev);
              updated.set(data.group._id, [{
                _id: Date.now().toString(),
                from: { _id: data.createdBy, name: data.createdByName },
                content: `${data.createdByName} created this group`,
                timestamp: new Date().toISOString(),
                read: false
              }]);
              return updated;
            });
            break;
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    websocket.onerror = (error) => console.error('WebSocket error:', error);
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
      setTimeout(connectWebSocket, 1000);
    };

    return websocket;
  }, [auth?.token, auth?.user?.id, updateUnreadCount]); // Changed from _id to id

  useEffect(() => {
    fetchInitialData();
    const websocket = connectWebSocket();
    return () => websocket?.close();
  }, [fetchInitialData, connectWebSocket]);

  const sendPrivateMessage = (toId, content) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const chatKey = [auth.user.id, toId].sort().join('-'); // Changed from _id to id
    const tempMessage = {
      _id: Date.now().toString(),
      from: {
        _id: auth.user.id, // Changed from _id to id
        name: auth.user.fullName, // Changed from name to fullName to match auth.user structure
        superAdminPhoto: auth.user.profilePhoto // Changed from superAdminPhoto to profilePhoto
      },
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    setPrivateChats(prev => {
      const updated = new Map(prev);
      const messages = [...(updated.get(chatKey) || []), tempMessage];
      updated.set(chatKey, messages);
      updateUnreadCount(chatKey, messages);
      return updated;
    });

    ws.send(JSON.stringify({ type: 'PRIVATE_MESSAGE', toUserId: toId, content }));
  };

  const sendGroupMessage = (groupId, content) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const tempMessage = {
      _id: Date.now().toString(),
      from: {
        _id: auth.user.id, // Changed from _id to id
        name: auth.user.fullName, // Changed from name to fullName
        superAdminPhoto: auth.user.profilePhoto // Changed from superAdminPhoto to profilePhoto
      },
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    setGroupChats(prev => {
      const updated = new Map(prev);
      const messages = [...(updated.get(groupId) || []), tempMessage];
      updated.set(groupId, messages);
      updateUnreadCount(groupId, messages);
      return updated;
    });

    ws.send(JSON.stringify({ type: 'GROUP_MESSAGE', groupId, content }));
  };

  const createGroup = async (name, members) => {
    try {
      const response = await api.post('/api/v1/chat/group/create', { name, members });
      setGroups(prev => [...prev, response.data.group]);
    } catch (err) {
      console.error('Failed to create group:', err);
      throw err;
    }
  };

  const value = {
    privateChats,
    groupChats,
    users,
    groups,
    unreadCounts,
    sendPrivateMessage,
    sendGroupMessage,
    createGroup,
    markMessagesAsRead,
    fetchPrivateChatHistory,
    fetchGroupChatHistory,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};