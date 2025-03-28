import React, { useState, useEffect, useCallback } from 'react';
import { X, Smile, Paperclip, Send } from 'lucide-react';
import { useAuthGlobally } from '../../context/AuthContext';
import { useChat } from '../../context/ChatWithTeamContext';


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
}

interface ChatWithTeamProps {
    onClose: () => void;
}

const ChatWithTeam: React.FC<ChatWithTeamProps> = ({ onClose }) => {
    const [auth] = useAuthGlobally();
    const { clientChats, fetchClientChatHistory, sendClientMessage } = useChat();
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

    // Fetch chat history on mount
    useEffect(() => {
        if (auth?.user?.id) {
            fetchClientChatHistory(auth.user.id);
        }
    }, [auth?.user?.id, fetchClientChatHistory]);

    // Update messages when clientChats changes
    useEffect(() => {
        if (clientChats.has(auth?.user?.id)) {
            setMessages(clientChats.get(auth.user.id) || []);
        }
    }, [clientChats, auth?.user?.id]);

    const connectWebSocket = useCallback(() => {
        if (!auth?.token || retryCount >= 5) return;
        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}?token=${auth.token}`);

        websocket.onopen = () => {
            console.log('WebSocket connected:', auth.user.id);
            setWs(websocket);
            setRetryCount(0);
        };

        websocket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.type === 'CLIENT_MESSAGE') {
                setMessages(prev => {
                    if (!prev.some(msg => msg._id === data.message._id)) return [...prev, data.message];
                    return prev;
                });
            }
        };

        websocket.onerror = (error: Event) => console.error('WebSocket error:', error);
        websocket.onclose = () => {
            console.log('WebSocket disconnected:', auth.user.id);
            setWs(null);
            if (retryCount < 5) {
                setTimeout(connectWebSocket, 2000 * (retryCount + 1));
                setRetryCount(prev => prev + 1);
            }
        };

        return () => websocket.close();
    }, [auth?.token, auth?.user?.id, retryCount]);

    useEffect(() => {
        const cleanup = connectWebSocket();
        return cleanup;
    }, [connectWebSocket]);

    const handleSendMessage = () => {
        if (!message.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
        const newMessage: Message = {
            _id: `temp-${Date.now()}`,
            from: { _id: auth.user.id, name: auth.user.fullName, profilePhoto: auth.user.profilePhoto || null },
            content: message,
            timestamp: new Date().toISOString(),
            read: true
        };
        setMessages(prev => [...prev, newMessage]);
        sendClientMessage(auth.user.id, message);
        setMessage('');
    };

    if (!auth?.user?.id) return null;

    return (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col z-50">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fcda00] to-[#232323] text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                    <img src="/logo2.png" alt="Zoom Logo" className="h-6 w-6" />
                    <div>
                        <h3 className="font-semibold">Zoom Creatives</h3>
                        <p className="text-xs">The team can also help</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-white hover:text-gray-200"><X className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {messages.map(msg => (
                        <div key={msg._id} className={`mb-4 flex ${msg.from._id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col">
                                {msg.from._id !== auth.user.id && (
                                    <div className="flex items-center mb-1">
                                        <img src={msg.from.profilePhoto || '/default-avatar.png'} alt={msg.from.name} className="w-6 h-6 rounded-full mr-2" />
                                        <div className="text-xs text-gray-500">{msg.from.name}</div>
                                    </div>
                                )}
                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.from._id === auth.user.id ? 'bg-purple-100 text-gray-800' : 'bg-white text-gray-800 shadow-sm'}`}>
                                    <p>{msg.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                {msg.from._id === auth.user.id && (
                                    <div className="flex items-center justify-end mt-1">
                                        <div className="text-xs text-gray-500 mr-2">{msg.from.name}</div>
                                        <img src={msg.from.profilePhoto || '/default-avatar.png'} alt={msg.from.name} className="w-6 h-6 rounded-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Message..." className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#fcda00] text-sm" />
                        <button className="text-gray-500 hover:text-[#fcda00]"><Smile className="h-5 w-5" /></button>
                        <button className="text-gray-500 hover:text-[#fcda00]"><Paperclip className="h-5 w-5" /></button>
                        <button onClick={handleSendMessage} className="bg-[#fcda00] text-white rounded-full p-2 hover:bg-yellow-300"><Send className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
        );
    };

    export default ChatWithTeam;