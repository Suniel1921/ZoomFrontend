import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Check } from 'lucide-react';
import { useChat } from '../../context/ChatWithTeamContext';
import { useAuthGlobally } from '../../context/AuthContext';

interface ChatWithTeamProps {
  onClose: () => void;
}

const ChatWithTeam: React.FC<ChatWithTeamProps> = ({ onClose }) => {
  const [auth] = useAuthGlobally();
  const { clientChats, fetchClientChatHistory, sendClientMessage, markMessagesAsRead } = useChat();
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (auth?.user?.id) {
      fetchClientChatHistory(auth.user.id);
      markMessagesAsRead(auth.user.id, 'client');
    }
  }, [auth?.user?.id, fetchClientChatHistory, markMessagesAsRead]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [clientChats]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendClientMessage(auth.user.id, message);
    setMessage('');
  };

  const messages = clientChats.get(auth.user.id) || [];

  if (!auth?.user?.id) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[520px] bg-gray-900 text-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">Z</div>
          <div>
            <h3 className="text-lg font-semibold">Zoom Creatives</h3>
            <p className="text-xs opacity-80">We’re here to assist you!</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm italic">"Start chatting with our team!"</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`mb-2 flex ${msg.from._id === auth.user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`inline-block p-2 rounded-lg ${msg.from._id === auth.user.id ? 'bg-blue-600' : 'bg-gray-700'}`}>
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center justify-end mt-1">
                  <p className="text-xs text-gray-400 mr-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {msg.read && msg.from._id === auth.user.id && (
                    <Check size={12} className="text-green-400" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSend} className="p-2 bg-blue-500 rounded-full hover:bg-blue-600">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithTeam;