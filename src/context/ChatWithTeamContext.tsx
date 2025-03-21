import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthGlobally } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [auth] = useAuthGlobally();
    const [ws, setWs] = useState(null);
    const [privateChats, setPrivateChats] = useState(new Map());
    const [groupChats, setGroupChats] = useState(new Map());
    const [unreadCounts, setUnreadCounts] = useState(new Map());
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Map()); // Map to track typing users per chat

    const api = axios.create({
        baseURL: import.meta.env.VITE_REACT_APP_URL,
        headers: { Authorization: `Bearer ${auth?.token}` },
    });

    const updateUnreadCount = useCallback((chatId, messages) => {
        const unreadCount = messages.filter(
            msg => !msg.read && msg.from._id !== auth?.user?.id
        ).length;
        setUnreadCounts(prev => new Map(prev).set(chatId, unreadCount > 0 ? unreadCount : 0));
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
                ...(adminsRes.data.admins || []).map(admin => ({ ...admin, role: 'admin' })),
                ...(superAdminsRes.data.superAdmins || []).map(superAdmin => ({ ...superAdmin, role: 'superadmin' })),
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
    }, [auth?.token, auth?.user?.id, updateUnreadCount]);

    const connectWebSocket = useCallback(() => {
        if (!auth?.token) return;
        const websocket = new WebSocket(
            `${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}?token=${auth.token}`
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
                        setGroupChats(prev => new Map(prev).set(data.group._id, []));
                        break;
                    }
                    case 'USER_ONLINE': {
                        setOnlineUsers(prev => new Set(prev).add(data.userId));
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
                    case 'TYPING': {
                        const { chatId, userId, chatType } = data;
                        setTypingUsers(prev => {
                            const updated = new Map(prev);
                            updated.set(`${chatType}-${chatId}`, userId);
                            return updated;
                        });
                        setTimeout(() => {
                            setTypingUsers(prev => {
                                const updated = new Map(prev);
                                updated.delete(`${chatType}-${chatId}`);
                                return updated;
                            });
                        }, 1500); // Clear typing indicator after 1.5 seconds
                        break;
                    }
                    default:
                        console.warn('Unknown message type:', data.type);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        websocket.onerror = (error) => console.error('WebSocket error:', error);
        websocket.onclose = () => {
            console.log('WebSocket disconnected');
            setWs(null);
            setTimeout(connectWebSocket, 3000); // Retry connection after 3 seconds
        };

        return () => {
            websocket.close();
            setTypingUsers(new Map()); // Clear typing state on disconnect
        };
    }, [auth?.token, auth?.user?.id, updateUnreadCount]);

    useEffect(() => {
        fetchInitialData();
        const cleanup = connectWebSocket();
        return cleanup;
    }, [fetchInitialData, connectWebSocket]);

    const sendPrivateMessage = (toId, content) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        const tempMessage = {
            _id: `temp-${Date.now()}`,
            from: {
                _id: auth.user.id,
                name: auth.user.name,
                superAdminPhoto: auth.user.superAdminPhoto || null,
            },
            content,
            timestamp: new Date().toISOString(),
            read: true,
        };

        const chatKey = [auth.user.id, toId].sort().join('-');
        setPrivateChats(prev => {
            const updated = new Map(prev);
            const existingMessages = updated.get(chatKey) || [];
            updated.set(chatKey, [...existingMessages, tempMessage]);
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
            _id: `temp-${Date.now()}`,
            from: {
                _id: auth.user.id,
                name: auth.user.name,
                superAdminPhoto: auth.user.superAdminPhoto || null,
            },
            content,
            timestamp: new Date().toISOString(),
            read: true,
        };

        setGroupChats(prev => {
            const updated = new Map(prev);
            const existingMessages = updated.get(groupId) || [];
            updated.set(groupId, [...existingMessages, tempMessage]);
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

    const sendTypingEvent = (chatId, chatType) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }
        ws.send(JSON.stringify({ type: 'TYPING', chatId, chatType, userId: auth.user.id }));
    };

    const value = {
        privateChats,
        groupChats,
        users,
        groups,
        unreadCounts,
        onlineUsers,
        typingUsers,
        sendPrivateMessage,
        sendGroupMessage,
        createGroup,
        fetchPrivateChatHistory,
        fetchGroupChatHistory,
        sendTypingEvent,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
};