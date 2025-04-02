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

    useEffect(() => {
        if (auth?.user?.id) {
            fetchClientChatHistory(auth.user.id);
        }
    }, [auth?.user?.id, fetchClientChatHistory]);

    useEffect(() => {
        if (clientChats.has(auth?.user?.id)) {
            setMessages(clientChats.get(auth.user.id) || []);
        }
    }, [clientChats, auth?.user?.id]);

    const connectWebSocket = useCallback(() => {
        if (!auth?.token || retryCount >= 5) return;
        const websocket = new WebSocket(`${import.meta.env.WS_URL || 'ws://localhost:3000'}?token=${auth.token}`);

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
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[520px] bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                            Z
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Zoom Creatives</h3>
                            <p className="text-xs opacity-80">We're here to assist you!</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {/* Welcome Message */}
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <p className="text-sm italic">
                            "Start chatting with our creative team! We're excited to help you bring your ideas to life."
                        </p>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg._id} className={`mb-4 flex ${msg.from._id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex flex-col max-w-[80%]">
                            {msg.from._id !== auth.user.id && (
                                <div className="flex items-center mb-1 gap-2">
                                    <img 
                                        src={msg.from.profilePhoto || '/default-avatar.png'} 
                                        alt={msg.from.name} 
                                        className="w-8 h-8 rounded-full object-cover" 
                                    />
                                    <span className="text-sm font-medium text-gray-700">{msg.from.name}</span>
                                </div>
                            )}
                            <div className={`p-3 rounded-2xl shadow-sm ${msg.from._id === auth.user.id ? 'bg-indigo-100 text-indigo-900' : 'bg-white text-gray-800'}`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        onKeyUp={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..." 
                        className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                    />
                    <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                        <Smile className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                        <Paperclip className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={handleSendMessage} 
                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWithTeam;


