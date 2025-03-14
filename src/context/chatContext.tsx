import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuthGlobally } from './AuthContext';

interface Message {
  _id: string;
  from: { _id: string; name: string; superAdminPhoto?: string };
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
  onlineUsers: Set<string>;
  sendPrivateMessage: (toId: string, content: string) => void;
  sendGroupMessage: (groupId: string, content: string) => void;
  createGroup: (name: string, members: string[]) => Promise<void>;
  markMessagesAsRead: (chatId: string, isGroup?: boolean) => Promise<void>;
  fetchPrivateChatHistory: (otherUserId: string) => Promise<void>;
  fetchGroupChatHistory: (groupId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const ChatProvider = ({ children }) => {
  const [auth] = useAuthGlobally();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [privateChats, setPrivateChats] = useState<Map<string, Message[]>>(new Map());
  const [groupChats, setGroupChats] = useState<Map<string, Message[]>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const api = useMemo(() => axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_URL || 'http://localhost:3000',
    headers: { Authorization: `Bearer ${auth?.token}` },
  }), [auth?.token]);

  const updateUnreadCount = useCallback((chatId: string, messages: Message[]) => {
    const unreadCount = messages.filter(msg => !msg.read && msg.from._id !== auth?.user?.id).length;
    setUnreadCounts(prev => {
      const updated = new Map(prev);
      unreadCount > 0 ? updated.set(chatId, unreadCount) : updated.delete(chatId);
      return updated;
    });
  }, [auth?.user?.id]);

  const fetchInitialData = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const [adminsRes, superAdminsRes, groupsRes] = await Promise.all([
        api.get('/api/v1/admin/getAllAdmin'),
        api.get('/api/v1/superAdmin/getAllSuperAdmins'),
        api.get('/api/v1/chat/group/list'),
      ]);
      setUsers([
        ...(adminsRes.data.admins || []).map((admin: any) => ({ ...admin, role: 'admin' })),
        ...(superAdminsRes.data.superAdmins || []).map((superAdmin: any) => ({
          ...superAdmin,
          role: 'superadmin',
        })),
      ]);
      setGroups(groupsRes.data.groups || []);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  }, [auth?.token, api]);

  const fetchPrivateChatHistory = useCallback(async (otherUserId: string) => {
    if (!auth?.token || !otherUserId) return;
    try {
      const response = await api.post('/api/v1/chat/history/private', { otherUserId });
      const messages = response.data.messages || [];
      const chatKey = [auth.user.id, otherUserId].sort().join('-');
      setPrivateChats(prev => {
        const updated = new Map(prev);
        updated.set(chatKey, messages);
        updateUnreadCount(chatKey, messages);
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch private chat history:', err);
    }
  }, [auth?.token, auth?.user?.id, api, updateUnreadCount]);

  const fetchGroupChatHistory = useCallback(async (groupId: string) => {
    if (!auth?.token || !groupId) return;
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
  }, [auth?.token, auth?.user?.id, api, updateUnreadCount]);

  const markMessagesAsRead = useCallback(async (chatId: string, isGroup = false) => {
    if (!auth?.token || !chatId) return;
    try {
      const endpoint = isGroup ? '/api/v1/chat/history/group' : '/api/v1/chat/history/private';
      const payload = isGroup ? { groupId: chatId } : { otherUserId: chatId };
      await api.post(endpoint, payload);
      const chats = isGroup ? groupChats : privateChats;
      const setChats = isGroup ? setGroupChats : setPrivateChats;
      setChats(prev => {
        const updated = new Map(prev);
        const messages = updated.get(chatId)?.map(msg => ({ ...msg, read: true })) || [];
        updated.set(chatId, messages);
        return updated;
      });
      setUnreadCounts(prev => {
        const updated = new Map(prev);
        updated.delete(chatId);
        return updated;
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [auth?.token, auth?.user?.id, privateChats, groupChats, api]);

  const connectWebSocket = useCallback(() => {
    if (!auth?.token) return;
    const websocket = new WebSocket(
      `${import.meta.env.VITE_REACT_APP_WS_URL || 'ws://localhost:3000'}?token=${auth.token}`
    );

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
      websocket.send(JSON.stringify({ type: 'USER_ONLINE', userId: auth.user.id }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'PRIVATE_MESSAGE': {
            const key = [auth.user.id, data.message.from._id].sort().join('-');
            setPrivateChats(prev => {
              const updated = new Map(prev);
              const messages = updated.get(key) || [];
              if (!messages.some(m => m._id === data.message._id)) {
                updated.set(key, [...messages, data.message]);
                updateUnreadCount(key, [...messages, data.message]);
              }
              return updated;
            });
            break;
          }
          case 'GROUP_MESSAGE': {
            setGroupChats(prev => {
              const updated = new Map(prev);
              const messages = updated.get(data.groupId) || [];
              if (!messages.some(m => m._id === data.message._id)) {
                updated.set(data.groupId, [...messages, data.message]);
                updateUnreadCount(data.groupId, [...messages, data.message]);
              }
              return updated;
            });
            break;
          }
          case 'GROUP_CREATED': {
            setGroups(prev => [...prev, data.group]);
            setGroupChats(prev => {
              const updated = new Map(prev);
              updated.set(data.group._id, [
                {
                  _id: Date.now().toString(),
                  from: { _id: data.createdBy, name: data.createdByName },
                  content: `${data.createdByName} created this group`,
                  timestamp: new Date().toISOString(),
                  read: false,
                },
              ]);
              return updated;
            });
            break;
          }
          case 'USER_ONLINE': {
            setOnlineUsers(prev => new Set([...prev, data.userId]));
            break;
          }
          case 'USER_OFFLINE': {
            setOnlineUsers(prev => {
              const updated = new Set(prev);
              updated.delete(data.userId);
              return updated;
            });
            break;
          }
          case 'ONLINE_USERS': {
            setOnlineUsers(new Set(data.users));
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
      setTimeout(connectWebSocket, 2000); // Increased delay for stability
    };

    return () => websocket.close();
  }, [auth?.token, auth?.user?.id, updateUnreadCount]);

  useEffect(() => {
    fetchInitialData();
    const cleanup = connectWebSocket();
    return cleanup;
  }, [fetchInitialData, connectWebSocket]);

  const sendPrivateMessage = useCallback((toId: string, content: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }
    const chatKey = [auth.user.id, toId].sort().join('-');
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      from: { _id: auth.user.id, name: auth.user.fullName, superAdminPhoto: auth.user.profilePhoto },
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setPrivateChats(prev => {
      const updated = new Map(prev);
      const messages = [...(updated.get(chatKey) || []), tempMessage];
      updated.set(chatKey, messages);
      return updated;
    });
    ws.send(JSON.stringify({ type: 'PRIVATE_MESSAGE', toUserId: toId, content }));
  }, [ws, auth?.user]);

  const sendGroupMessage = useCallback((groupId: string, content: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      from: { _id: auth.user.id, name: auth.user.fullName, superAdminPhoto: auth.user.profilePhoto },
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setGroupChats(prev => {
      const updated = new Map(prev);
      const messages = [...(updated.get(groupId) || []), tempMessage];
      updated.set(groupId, messages);
      return updated;
    });
    ws.send(JSON.stringify({ type: 'GROUP_MESSAGE', groupId, content }));
  }, [ws, auth?.user]);

  const createGroup = useCallback(async (name: string, members: string[]) => {
    if (!name || !members.length) throw new Error('Invalid group data');
    try {
      const response = await api.post('/api/v1/chat/group/create', { name, members });
      setGroups(prev => [...prev, response.data.group]);
    } catch (err) {
      console.error('Failed to create group:', err);
      throw err;
    }
  }, [api]);

  const value = useMemo(() => ({
    privateChats,
    groupChats,
    users,
    groups,
    unreadCounts,
    onlineUsers,
    sendPrivateMessage,
    sendGroupMessage,
    createGroup,
    markMessagesAsRead: debounce(markMessagesAsRead, 500),
    fetchPrivateChatHistory: debounce(fetchPrivateChatHistory, 500),
    fetchGroupChatHistory,
  }), [privateChats, groupChats, users, groups, unreadCounts, onlineUsers, sendPrivateMessage, sendGroupMessage, createGroup, markMessagesAsRead, fetchPrivateChatHistory, fetchGroupChatHistory]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};