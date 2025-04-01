// src/components/Chat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, UserPlus, X } from 'lucide-react';
import { useAuthGlobally } from '../context/AuthContext';
import { useChat } from '../context/ChatWithTeamContext';

interface SelectedChat {
  type: 'private' | 'client' | null;
  id: string | null;
}

const Chat: React.FC = () => {
  const { privateChats, clientChats, users, clients, unreadCounts, onlineUsers, typingUsers,
    sendPrivateMessage, sendClientMessage, fetchPrivateChatHistory, fetchClientChatHistory, sendTypingEvent } = useChat();
  const [auth] = useAuthGlobally();
  const [selectedChat, setSelectedChat] = useState<SelectedChat>({ type: null, id: null });
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'admin' | 'client'>('admin');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!selectedChat.id) return;
    const fetchChat = async () => {
      if (selectedChat.type === 'private') await fetchPrivateChatHistory(selectedChat.id!);
      else if (selectedChat.type === 'client') await fetchClientChatHistory(selectedChat.id!);
      scrollToBottom();
    };
    fetchChat();
  }, [selectedChat, fetchPrivateChatHistory, fetchClientChatHistory, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [privateChats, clientChats, selectedChat, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !selectedChat.id) return;
    if (selectedChat.type === 'private') sendPrivateMessage(selectedChat.id, message);
    else if (selectedChat.type === 'client') sendClientMessage(selectedChat.id, message);
    setMessage('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [message, selectedChat, sendPrivateMessage, sendClientMessage]);

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!selectedChat.id || !e.target.value) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      return;
    }
    const chatId = selectedChat.type === 'private' 
      ? [auth.user.id, selectedChat.id].sort().join('-') 
      : selectedChat.id;
    sendTypingEvent(chatId, selectedChat.type!);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {}, 1500);
  }, [selectedChat, auth.user.id, sendTypingEvent]);

  const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredClients = clients.filter(client => client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));

  const chatKey = selectedChat.type === 'private' 
    ? [auth.user.id, selectedChat.id!].sort().join('-') 
    : selectedChat.id!;
  const currentMessages = selectedChat.type === 'private' 
    ? privateChats.get(chatKey) || [] 
    : clientChats.get(chatKey) || [];
  const selectedData = selectedChat.type === 'private' 
    ? users.find(u => u._id === selectedChat.id) 
    : clients.find(c => c._id === selectedChat.id);
  const isTyping = typingUsers.has(`${selectedChat.type}-${chatKey}`) && 
    typingUsers.get(`${selectedChat.type}-${chatKey}`) !== auth.user.id;

  if (!auth?.user?.id) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden mt-11">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-4 border-b border-gray-200">
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <div className="flex">
          <button 
            className={`flex-1 p-3 text-sm font-semibold ${activeTab === 'admin' ? 'bg-gray-100 border-b-2 border-blue-500' : 'hover:bg-gray-50'}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Chats
          </button>
          <button 
            className={`flex-1 p-3 text-sm font-semibold ${activeTab === 'client' ? 'bg-gray-100 border-b-2 border-blue-500' : 'hover:bg-gray-50'}`}
            onClick={() => setActiveTab('client')}
          >
            Client Chats
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'admin' && filteredUsers.map(user => (
            <div 
              key={user._id} 
              onClick={() => setSelectedChat({ type: 'private', id: user._id })}
              className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'private' && selectedChat.id === user._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="ml-3 flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">
                  {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  {onlineUsers.has(user._id) ? 
                    <span className="ml-1 text-green-500">• Online</span> : 
                    <span className="ml-1 text-gray-400">• Offline</span>}
                </div>
              </div>
              {unreadCounts.get([auth.user.id, user._id].sort().join('-')) > 0 && (
                <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                  {unreadCounts.get([auth.user.id, user._id].sort().join('-'))}
                </span>
              )}
            </div>
          ))}
          {activeTab === 'client' && filteredClients.map(client => (
            <div 
              key={client._id} 
              onClick={() => setSelectedChat({ type: 'client', id: client._id })}
              className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'client' && selectedChat.id === client._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              {client.profilePhoto ? (
                <img src={client.profilePhoto} alt={client.fullName} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {client.fullName?.charAt(0).toUpperCase() || 'C'}
                </div>
              )}
              <div className="ml-3 flex-1 font-medium">{client.fullName}</div>
              {unreadCounts.get(client._id) > 0 && (
                <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                  {unreadCounts.get(client._id)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-gray-50 ml-64 h-screen">
        {selectedChat.id ? (
          <>
            <div className="fixed top-0 mt-14 left-[256px] right-0 p-4 border-b border-gray-200 flex items-center bg-white z-20">
              {selectedData && (
                <>
                  {selectedData.profilePhoto ? (
                    <img src={selectedData.profilePhoto} alt={selectedData.name || selectedData.fullName} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {(selectedData.name || selectedData.fullName)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="font-medium">{selectedData.name || selectedData.fullName}</div>
                    {selectedChat.type === 'private' && (
                      <div className="text-sm text-gray-500">
                        {selectedData.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                        {onlineUsers.has(selectedData._id) ? 
                          <span className="ml-1 text-green-500">• Online</span> : 
                          <span className="ml-1 text-gray-400">• Offline</span>}
                      </div>
                    )}
                    {isTyping && <div className="ml-4 text-gray-500">Typing...</div>}
                  </div>
                </>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 pt-24 pb-20">
              {currentMessages.map(msg => (
                <div 
                  key={msg._id} 
                  className={`flex flex-col mb-2 ${msg.from._id === auth.user.id ? 'items-end' : 'items-start'}`}
                >
                  {msg.from._id !== auth.user.id && (
                    <div className="flex items-center mb-1">
                      {msg.from.profilePhoto ? (
                        <img src={msg.from.profilePhoto} alt={msg.from.name} className="w-6 h-6 rounded-full mr-2" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">
                          {msg.from.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">{msg.from.name}</div>
                    </div>
                  )}
                  <div 
                    className={`rounded-xl p-2 break-words max-w-[70%] ${msg.from._id === auth.user.id ? 'bg-green-100 text-gray-700' : 'bg-white border border-gray-200'}`}
                  >
                    {msg.content}
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="fixed bottom-0 left-[256px] right-0 p-4 border-t border-gray-200 bg-white z-20">
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={message} 
                  onChange={handleTyping} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                <button 
                  onClick={handleSend} 
                  className="ml-2 p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Chat Selected</h2>
              <p>Select a chat from the left to start!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;