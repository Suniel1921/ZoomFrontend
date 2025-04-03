// import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import io, { Socket } from 'socket.io-client';
// import axios from 'axios';
// import { useAuthGlobally } from './AuthContext';

// interface User {
//   _id: string;
//   name: string;
//   fullName?: string;
//   superAdminPhoto?: string | null;
//   profilePhoto?: string | null;
//   role: 'admin' | 'superadmin' | 'client';
// }

// interface Message {
//   _id: string;
//   from: { _id: string; name: string; profilePhoto?: string | null };
//   content: string;
//   timestamp: string;
//   read: boolean;
//   adminThatReplied?: string | null;
// }

// interface ChatContextType {
//   privateChats: Map<string, Message[]>;
//   clientChats: Map<string, Message[]>;
//   users: User[];
//   clients: User[];
//   unreadCounts: Map<string, number>;
//   onlineUsers: Set<string>;
//   typingUsers: Map<string, string>;
//   sendPrivateMessage: (toId: string, content: string) => void;
//   sendClientMessage: (clientId: string, content: string) => void;
//   fetchPrivateChatHistory: (otherUserId: string) => Promise<void>;
//   fetchClientChatHistory: (clientId: string) => Promise<void>;
//   sendTypingEvent: (chatId: string, chatType: 'private' | 'client') => void;
//   markMessagesAsRead: (chatId: string, chatType: 'private' | 'client') => void;
// }

// const ChatContext = createContext<ChatContextType | undefined>(undefined);

// export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [auth] = useAuthGlobally();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [privateChats, setPrivateChats] = useState<Map<string, Message[]>>(new Map());
//   const [clientChats, setClientChats] = useState<Map<string, Message[]>>(new Map());
//   const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
//   const [users, setUsers] = useState<User[]>([]);
//   const [clients, setClients] = useState<User[]>([]);
//   const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
//   const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

//   const api = axios.create({
//     baseURL: import.meta.env.VITE_REACT_APP_URL,
//     headers: { Authorization: `Bearer ${auth?.token}` },
//   });

//   const updateUnreadCount = useCallback((chatId: string, messages: Message[]) => {
//     const unreadCount = messages.filter((msg) => !msg.read && msg.from._id !== auth?.user?.id).length;
//     setUnreadCounts((prev) => new Map(prev).set(chatId, unreadCount));
//   }, [auth?.user?.id]);

//   const fetchInitialData = useCallback(async () => {
//     if (!auth?.token) return;
//     try {
//       const [adminsRes, superAdminsRes, clientsRes] = await Promise.all([
//         api.get('/api/v1/admin/getAllAdmin'),
//         api.get('/api/v1/superAdmin/getAllSuperAdmins'),
//         api.get('/api/v1/client/getClient'),
//       ]);
//       setUsers([
//         ...(adminsRes.data.admins || []).map((admin: User) => ({ ...admin, role: 'admin' })),
//         ...(superAdminsRes.data.superAdmins || []).map((superAdmin: User) => ({ ...superAdmin, role: 'superadmin' })),
//       ]);
//       setClients(clientsRes.data.clients || []);
//     } catch (err) {
//       console.error('Failed to fetch initial data:', err);
//     }
//   }, [auth?.token]);

//   const fetchPrivateChatHistory = useCallback(async (otherUserId: string) => {
//     try {
//       const response = await api.post('/api/v1/chat/history/private', { otherUserId });
//       const messages: Message[] = response.data.messages || [];
//       const chatKey = [auth.user.id, otherUserId].sort().join('-');
//       setPrivateChats((prev) => {
//         const updated = new Map(prev);
//         updated.set(chatKey, messages);
//         updateUnreadCount(chatKey, messages);
//         return updated;
//       });
//     } catch (err) {
//       console.error('Failed to fetch private chat history:', err);
//     }
//   }, [auth?.user?.id, updateUnreadCount]);

//   const fetchClientChatHistory = useCallback(async (clientId: string) => {
//     try {
//       console.log('Fetching client chat history for clientId:', clientId);
//       const response = await api.post('/api/v1/chat/history/client', { clientId });
//       const messages: Message[] = response.data.messages || [];
//       console.log('Fetched client chat messages:', messages);
//       setClientChats((prev) => {
//         const updated = new Map(prev);
//         updated.set(clientId, messages);
//         updateUnreadCount(clientId, messages);
//         return updated;
//       });
//     } catch (err) {
//       console.error('Failed to fetch client chat history:', err);
//     }
//   }, [updateUnreadCount]);

//   const markMessagesAsRead = useCallback((chatId: string, chatType: 'private' | 'client') => {
//     if (!socket) return;
//     socket.emit('markMessagesAsRead', { chatId, chatType });
//   }, [socket]);

//   const connectSocket = useCallback(() => {
//     if (!auth?.token) return;
//     const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
//       query: { token: auth.token },
//       transports: ['websocket'],
//     });

//     newSocket.on('connect', () => {
//       console.log('Socket.IO connected');
//       setSocket(newSocket);
//     });

//     newSocket.on('onlineUsers', ({ users }) => {
//       console.log('Online users:', users);
//       setOnlineUsers(new Set(users));
//     });

//     newSocket.on('privateMessage', ({ conversationId, message }) => {
//       console.log('Received privateMessage:', { conversationId, message });
//       const key = [auth.user.id, message.from._id].sort().join('-');
//       setPrivateChats((prev) => {
//         const updated = new Map(prev);
//         const messages = updated.get(key) || [];
//         if (!messages.some((m) => m._id === message._id)) {
//           updated.set(key, [...messages, message]);
//           updateUnreadCount(key, [...messages, message]);
//         }
//         return updated;
//       });
//     });

//     newSocket.on('clientMessage', ({ clientId, message }) => {
//       console.log('Received clientMessage:', { clientId, message });
//       setClientChats((prev) => {
//         const updated = new Map(prev);
//         const messages = updated.get(clientId) || [];
//         const tempMessageIndex = messages.findIndex((m) => m._id.startsWith('temp-') && m.content === message.content && m.from._id === message.from._id);
//         if (tempMessageIndex !== -1) {
//           messages[tempMessageIndex] = message;
//           updated.set(clientId, [...messages]);
//         } else if (!messages.some((m) => m._id === message._id)) {
//           updated.set(clientId, [...messages, message]);
//         }
//         updateUnreadCount(clientId, updated.get(clientId) || []);
//         return updated;
//       });
//     });

//     newSocket.on('messagesRead', ({ chatId, chatType, messages }) => {
//       console.log('Received messagesRead:', { chatId, chatType, messages });
//       if (chatType === 'private') {
//         setPrivateChats((prev) => {
//           const updated = new Map(prev);
//           updated.set(chatId, messages);
//           updateUnreadCount(chatId, messages);
//           return updated;
//         });
//       } else if (chatType === 'client') {
//         setClientChats((prev) => {
//           const updated = new Map(prev);
//           updated.set(chatId, messages);
//           updateUnreadCount(chatId, messages);
//           return updated;
//         });
//       }
//     });

//     newSocket.on('typing', ({ chatId, chatType, userId }) => {
//       setTypingUsers((prev) => {
//         const updated = new Map(prev);
//         updated.set(`${chatType}-${chatId}`, userId);
//         return updated;
//       });
//       setTimeout(() => {
//         setTypingUsers((prev) => {
//           const updated = new Map(prev);
//           updated.delete(`${chatType}-${chatId}`);
//           return updated;
//         });
//       }, 1500);
//     });

//     newSocket.on('disconnect', () => {
//       console.log('Socket.IO disconnected');
//       setSocket(null);
//       setTimeout(connectSocket, 2000);
//     });

//     return () => newSocket.disconnect();
//   }, [auth?.token, updateUnreadCount]);

//   useEffect(() => {
//     fetchInitialData();
//     const cleanup = connectSocket();
//     return cleanup;
//   }, [fetchInitialData, connectSocket]);

//   const sendPrivateMessage = (toId: string, content: string) => {
//     if (!socket) return;
//     const tempMessage: Message = {
//       _id: `temp-${Date.now()}`,
//       from: { _id: auth.user.id, name: auth.user.name, profilePhoto: auth.user.profilePhoto || null },
//       content,
//       timestamp: new Date().toISOString(),
//       read: true,
//     };
//     const chatKey = [auth.user.id, toId].sort().join('-');
//     setPrivateChats((prev) => new Map(prev).set(chatKey, [...(prev.get(chatKey) || []), tempMessage]));
//     socket.emit('privateMessage', { toUserId: toId, content });
//   };

//   const sendClientMessage = (clientId: string, content: string) => {
//     if (!socket) return;
//     const tempMessage: Message = {
//       _id: `temp-${Date.now()}`,
//       from: {
//         _id: auth.user.id,
//         name: auth.user.name || auth.user.fullName,
//         profilePhoto: auth.user.profilePhoto || auth.user.superAdminPhoto || null,
//       },
//       content,
//       timestamp: new Date().toISOString(),
//       read: true,
//       adminThatReplied: auth.user.role !== 'client' ? auth.user.id : null,
//     };
//     setClientChats((prev) => {
//       const updated = new Map(prev);
//       const messages = updated.get(clientId) || [];
//       updated.set(clientId, [...messages, tempMessage]);
//       return updated;
//     });
//     socket.emit('clientMessage', { clientId, content });
//   };

//   const sendTypingEvent = (chatId: string, chatType: 'private' | 'client') => {
//     if (!socket) return;
//     socket.emit('typing', { chatId, chatType });
//   };

//   const value: ChatContextType = {
//     privateChats,
//     clientChats,
//     users,
//     clients,
//     unreadCounts,
//     onlineUsers,
//     typingUsers,
//     sendPrivateMessage,
//     sendClientMessage,
//     fetchPrivateChatHistory,
//     fetchClientChatHistory,
//     sendTypingEvent,
//     markMessagesAsRead,
//   };

//   return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// };

// export const useChat = (): ChatContextType => {
//   const context = useContext(ChatContext);
//   if (!context) throw new Error('useChat must be used within a ChatProvider');
//   return context;
// };





import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
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
  from: { _id: string; name: string; profilePhoto?: string | null };
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
  sendTypingEvent: (chatId: string, chatType: 'private' | 'client') => void;
  markMessagesAsRead: (chatId: string, chatType: 'private' | 'client') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth] = useAuthGlobally();
  const [socket, setSocket] = useState<Socket | null>(null);
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
  });

  const updateUnreadCount = useCallback((chatId: string, messages: Message[]) => {
    const unreadCount = messages.filter((msg) => !msg.read && msg.from._id !== auth?.user?.id).length;
    setUnreadCounts((prev) => new Map(prev).set(chatId, unreadCount));
  }, [auth?.user?.id]);

  const fetchInitialData = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const [adminsRes, superAdminsRes, clientsRes] = await Promise.all([
        api.get('/api/v1/admin/getAllAdmin'),
        api.get('/api/v1/superAdmin/getAllSuperAdmins'),
        api.get('/api/v1/client/getClient'),
      ]);
      setUsers([
        ...(adminsRes.data.admins || []).map((admin: User) => ({ ...admin, role: 'admin' })),
        ...(superAdminsRes.data.superAdmins || []).map((superAdmin: User) => ({ ...superAdmin, role: 'superadmin' })),
      ]);
      setClients(clientsRes.data.clients || []);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  }, [auth?.token]);

  const fetchPrivateChatHistory = useCallback(async (otherUserId: string) => {
    try {
      const response = await api.post('/api/v1/chat/history/private', { otherUserId });
      const messages: Message[] = response.data.messages || [];
      const chatKey = [auth.user.id, otherUserId].sort().join('-');
      setPrivateChats((prev) => {
        const updated = new Map(prev);
        updated.set(chatKey, messages);
        updateUnreadCount(chatKey, messages);
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch private chat history:', err);
    }
  }, [auth?.user?.id, updateUnreadCount]);

  const fetchClientChatHistory = useCallback(async (clientId: string) => {
    try {
      console.log('Fetching client chat history for clientId:', clientId);
      const response = await api.post('/api/v1/chat/history/client', { clientId });
      const messages: Message[] = response.data.messages || [];
      console.log('Fetched client chat messages:', messages);
      setClientChats((prev) => {
        const updated = new Map(prev);
        updated.set(clientId, messages);
        updateUnreadCount(clientId, messages);
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch client chat history:', err);
    }
  }, [updateUnreadCount]);

  const markMessagesAsRead = useCallback((chatId: string, chatType: 'private' | 'client') => {
    if (!socket) return;
    socket.emit('markMessagesAsRead', { chatId, chatType });
  }, [socket]);

  const connectSocket = useCallback(() => {
    if (!auth?.token) return;
    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      query: { token: auth.token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
      setSocket(newSocket);
    });

    newSocket.on('onlineUsers', ({ users }) => {
      console.log('Online users:', users);
      setOnlineUsers(new Set(users));
    });

    newSocket.on('privateMessage', ({ conversationId, message }) => {
      console.log('Received privateMessage:', { conversationId, message });
      const key = [auth.user.id, message.from._id].sort().join('-');
      setPrivateChats((prev) => {
        const updated = new Map(prev);
        const messages = updated.get(key) || [];
        if (!messages.some((m) => m._id === message._id)) {
          updated.set(key, [...messages, message]);
          updateUnreadCount(key, [...messages, message]);
        }
        return updated;
      });
    });

    newSocket.on('clientMessage', ({ clientId, message }) => {
      console.log('Received clientMessage:', { clientId, message });
      setClientChats((prev) => {
        const updated = new Map(prev);
        const messages = updated.get(clientId) || [];
        const tempMessageIndex = messages.findIndex((m) => m._id.startsWith('temp-') && m.content === message.content && m.from._id === message.from._id);
        if (tempMessageIndex !== -1) {
          messages[tempMessageIndex] = message;
          updated.set(clientId, [...messages]);
        } else if (!messages.some((m) => m._id === message._id)) {
          updated.set(clientId, [...messages, message]);
        }
        updateUnreadCount(clientId, updated.get(clientId) || []);
        return updated;
      });
    });

    newSocket.on('messagesRead', ({ chatId, chatType, messages }) => {
      console.log('Received messagesRead:', { chatId, chatType, messages });
      if (chatType === 'private') {
        setPrivateChats((prev) => {
          const updated = new Map(prev);
          updated.set(chatId, messages);
          updateUnreadCount(chatId, messages);
          return updated;
        });
      } else if (chatType === 'client') {
        setClientChats((prev) => {
          const updated = new Map(prev);
          updated.set(chatId, messages);
          updateUnreadCount(chatId, messages);
          return updated;
        });
      }
    });

    newSocket.on('typing', ({ chatId, chatType, userId }) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        updated.set(`${chatType}-${chatId}`, userId);
        return updated;
      });
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(`${chatType}-${chatId}`);
          return updated;
        });
      }, 1500);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setSocket(null);
      setTimeout(connectSocket, 2000);
    });

    return () => newSocket.disconnect();
  }, [auth?.token, updateUnreadCount]);

  useEffect(() => {
    fetchInitialData();
    const cleanup = connectSocket();
    return cleanup;
  }, [fetchInitialData, connectSocket]);

  const sendPrivateMessage = (toId: string, content: string) => {
    if (!socket) return;
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      from: { _id: auth.user.id, name: auth.user.name, profilePhoto: auth.user.profilePhoto || null },
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };
    const chatKey = [auth.user.id, toId].sort().join('-');
    setPrivateChats((prev) => new Map(prev).set(chatKey, [...(prev.get(chatKey) || []), tempMessage]));
    socket.emit('privateMessage', { toUserId: toId, content });
  };

  const sendClientMessage = (clientId: string, content: string) => {
    if (!socket) return;
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      from: {
        _id: auth.user.id,
        name: auth.user.name || auth.user.fullName,
        profilePhoto: auth.user.profilePhoto || auth.user.superAdminPhoto || null,
      },
      content,
      timestamp: new Date().toISOString(),
      read: true,
      adminThatReplied: auth.user.role !== 'client' ? auth.user.id : null,
    };
    setClientChats((prev) => {
      const updated = new Map(prev);
      const messages = updated.get(clientId) || [];
      updated.set(clientId, [...messages, tempMessage]);
      return updated;
    });
    socket.emit('clientMessage', { clientId, content });
  };

  const sendTypingEvent = (chatId: string, chatType: 'private' | 'client') => {
    if (!socket) return;
    socket.emit('typing', { chatId, chatType });
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
    sendTypingEvent,
    markMessagesAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};