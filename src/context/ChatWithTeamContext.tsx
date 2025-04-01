// src/context/ChatWithTeamContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthGlobally } from './AuthContext';

interface User {
  _id: string;
  name: string;
  fullName?: string;
  superAdminPhoto?: string | null;
  profilePhoto?: string | null;
  role: 'admin' | 'superadmin' | 'client';
}

interface Message {
  _id: string;
  from: {
    _id: string;
    name: string;
    profilePhoto?: string | null;
  };
  content: string;
  timestamp: string;
  read: boolean;
  adminThatReplied?: string | null;
}

interface ChatContextType {
  privateChats: Map<string, Message[]>;
  clientChats: Map<string, Message[]>;
  users: User[];
  clients: User[];
  unreadCounts: Map<string, number>;
  onlineUsers: Set<string>;
  typingUsers: Map<string, string>;
  sendPrivateMessage: (toId: string, content: string) => void;
  sendClientMessage: (clientId: string, content: string) => void;
  fetchPrivateChatHistory: (otherUserId: string) => Promise<void>;
  fetchClientChatHistory: (clientId: string) => Promise<void>;
  sendTypingEvent: (chatId: string, chatType: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth] = useAuthGlobally();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [privateChats, setPrivateChats] = useState<Map<string, Message[]>>(new Map());
  const [clientChats, setClientChats] = useState<Map<string, Message[]>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_URL,
    headers: { Authorization: `Bearer ${auth?.token}` },
    timeout: 10000,
  });

  const updateUnreadCount = useCallback((chatId: string, messages: Message[]) => {
    const unreadCount = messages.filter(msg => !msg.read && msg.from._id !== auth?.user?.id).length;
    setUnreadCounts(prev => new Map(prev).set(chatId, unreadCount > 0 ? unreadCount : 0));
  }, [auth?.user?.id]);

  const fetchInitialData = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const [adminsRes, superAdminsRes, clientsRes] = await Promise.all([
        api.get('/api/v1/admin/getAllAdmin'),
        api.get('/api/v1/superAdmin/getAllSuperAdmins'),
        api.get('/api/v1/client/getClient')
      ]);

      setUsers([
        ...(adminsRes.data.admins || []).map((admin: User) => ({ ...admin, role: 'admin' as const })),
        ...(superAdminsRes.data.superAdmins || []).map((superAdmin: User) => ({ ...superAdmin, role: 'superadmin' as const }))
      ]);
      setClients(clientsRes.data.clients || []);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  }, [auth?.token]);

  const fetchPrivateChatHistory = useCallback(async (otherUserId: string) => {
    if (!auth?.token) return;
    try {
      const response = await api.post('/api/v1/chat/history/private', { otherUserId });
      const messages: Message[] = response.data.messages || [];
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
  }, [auth?.token, auth?.user?.id, updateUnreadCount]);

  const fetchClientChatHistory = useCallback(async (clientId: string) => {
    if (!auth?.token) return;
    try {
      const response = await api.post('/api/v1/chat/history/client', { clientId });
      const messages: Message[] = response.data.messages || [];
      setClientChats(prev => {
        const updated = new Map(prev);
        updated.set(clientId, messages);
        updateUnreadCount(clientId, messages);
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch client chat history:', err);
    }
  }, [auth?.token, auth?.user?.id, updateUnreadCount]);

  const connectWebSocket = useCallback(() => {
    if (!auth?.token) return;
    const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}?token=${auth.token}`);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWs(websocket);
      websocket.send(JSON.stringify({ type: 'USER_ONLINE', userId: auth.user.id }));
      if (auth.user.role === 'client') {
        fetchClientChatHistory(auth.user.id);
      }
    };

    websocket.onmessage = (event: MessageEvent) => {
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
          case 'CLIENT_MESSAGE': {
            setClientChats(prev => {
              const updated = new Map(prev);
              const messages = updated.get(data.clientId) || [];
              if (!messages.some(m => m._id === data.message._id)) {
                updated.set(data.clientId, [...messages, data.message]);
                updateUnreadCount(data.clientId, [...messages, data.message]);
              }
              return updated;
            });
            break;
          }
          case 'ONLINE_USERS': {
            setOnlineUsers(new Set(data.users));
            break;
          }
          case 'TYPING': {
            const { chatId, userId, chatType } = data;
            setTypingUsers(prev => new Map(prev).set(`${chatType}-${chatId}`, userId));
            setTimeout(() => setTypingUsers(prev => {
              const updated = new Map(prev);
              updated.delete(`${chatType}-${chatId}`);
              return updated;
            }), 1500);
            break;
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    websocket.onerror = (error: Event) => console.error('WebSocket error:', error);
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWs(null);
      setTimeout(connectWebSocket, 3000);
    };

    return () => websocket.close();
  }, [auth?.token, auth?.user?.id, auth?.user?.role, fetchClientChatHistory, updateUnreadCount]);

  useEffect(() => {
    fetchInitialData();
    const cleanup = connectWebSocket();
    return cleanup;
  }, [fetchInitialData, connectWebSocket]);

  const sendPrivateMessage = (toId: string, content: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      from: { _id: auth.user.id, name: auth.user.name, profilePhoto: auth.user.profilePhoto || null },
      content,
      timestamp: new Date().toISOString(),
      read: true
    };
    const chatKey = [auth.user.id, toId].sort().join('-');
    setPrivateChats(prev => new Map(prev).set(chatKey, [...(prev.get(chatKey) || []), tempMessage]));
    ws.send(JSON.stringify({ type: 'PRIVATE_MESSAGE', toUserId: toId, content }));
  };

  const sendClientMessage = (clientId: string, content: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      from: { _id: auth.user.id, name: auth.user.name || auth.user.fullName, 
        profilePhoto: auth.user.profilePhoto || auth.user.superAdminPhoto || null },
      content,
      timestamp: new Date().toISOString(),
      read: true,
      adminThatReplied: auth.user.role !== 'client' ? auth.user.id : null
    };
    setClientChats(prev => new Map(prev).set(clientId, [...(prev.get(clientId) || []), tempMessage]));
    ws.send(JSON.stringify({ 
      type: 'CLIENT_MESSAGE', 
      clientId, 
      content, 
      adminThatReplied: auth.user.role !== 'client' ? auth.user.id : null 
    }));
  };

  const sendTypingEvent = (chatId: string, chatType: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'TYPING', chatId, chatType, userId: auth.user.id }));
  };

  const value: ChatContextType = {
    privateChats,
    clientChats,
    users,
    clients,
    unreadCounts,
    onlineUsers,
    typingUsers,
    sendPrivateMessage,
    sendClientMessage,
    fetchPrivateChatHistory,
    fetchClientChatHistory,
    sendTypingEvent
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};