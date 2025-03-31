// src/components/Chat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, UserPlus, X } from 'lucide-react';
import { useAuthGlobally } from '../context/AuthContext';
import { useChat } from '../context/ChatWithTeamContext';

interface SelectedChat {
  type: 'private' | 'group' | 'client' | null;
  id: string | null;
}

const Chat: React.FC = () => {
  const { privateChats, groupChats, clientChats, users, clients, groups, unreadCounts, onlineUsers, typingUsers,
    sendPrivateMessage, sendGroupMessage, sendClientMessage, createGroup, fetchPrivateChatHistory,
    fetchGroupChatHistory, fetchClientChatHistory, sendTypingEvent } = useChat();
  const [auth] = useAuthGlobally();
  const [selectedChat, setSelectedChat] = useState<SelectedChat>({ type: null, id: null });
  const [message, setMessage] = useState('');
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'admin' | 'client'>('admin');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow) return;
    const isAtBottom = chatWindow.scrollHeight - chatWindow.scrollTop <= chatWindow.clientHeight + 50;
    if (isAtBottom) scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    chatWindow?.addEventListener('scroll', handleScroll);
    return () => chatWindow?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!selectedChat.id) return;
    const fetchChat = async () => {
      try {
        if (selectedChat.type === 'private') await fetchPrivateChatHistory(selectedChat.id!);
        else if (selectedChat.type === 'group') await fetchGroupChatHistory(selectedChat.id!);
        else if (selectedChat.type === 'client') await fetchClientChatHistory(selectedChat.id!);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };
    fetchChat();
  }, [selectedChat, fetchPrivateChatHistory, fetchGroupChatHistory, fetchClientChatHistory, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [privateChats, groupChats, clientChats, selectedChat, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !selectedChat.id) return;
    try {
      if (selectedChat.type === 'private') sendPrivateMessage(selectedChat.id, message);
      else if (selectedChat.type === 'group') sendGroupMessage(selectedChat.id, message);
      else if (selectedChat.type === 'client') sendClientMessage(selectedChat.id, message);
      setMessage('');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [message, selectedChat, sendPrivateMessage, sendGroupMessage, sendClientMessage]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return setError('Group name is required');
    try {
      await createGroup(groupName, groupMembers);
      setShowGroupCreator(false);
      setGroupName('');
      setGroupMembers([]);
      setError(null);
    } catch (err) {
      setError('Failed to create group');
    }
  };

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
  const filteredGroups = groups.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredClients = clients.filter(client => client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));

  const chatKey = selectedChat.type === 'private' 
    ? [auth.user.id, selectedChat.id!].sort().join('-') 
    : selectedChat.id!;
  const currentMessages = selectedChat.type === 'private' ? privateChats.get(chatKey) || [] :
    selectedChat.type === 'group' ? groupChats.get(chatKey) || [] : 
    clientChats.get(chatKey) || [];
  const selectedData = selectedChat.type === 'private' ? users.find(u => u._id === selectedChat.id) :
    selectedChat.type === 'group' ? groups.find(g => g._id === selectedChat.id) : 
    clients.find(c => c._id === selectedChat.id);
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
          {activeTab === 'admin' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Direct Messages</h3>
                <button 
                  onClick={() => setShowGroupCreator(true)} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <UserPlus size={20} />
                </button>
              </div>
              {filteredUsers.map(user => (
                <div 
                  key={user._id} 
                  onClick={() => setSelectedChat({ type: 'private', id: user._id })}
                  className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'private' && selectedChat.id === user._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <img 
                    src={user.superAdminPhoto || '/default-avatar.png'} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full" 
                  />
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
              <h3 className="text-lg font-semibold mt-6 mb-4">Groups</h3>
              {filteredGroups.map(group => (
                <div 
                  key={group._id} 
                  onClick={() => setSelectedChat({ type: 'group', id: group._id })}
                  className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'group' && selectedChat.id === group._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {group.name.charAt(0)}
                  </div>
                  <div className="ml-3 flex-1 font-medium">{group.name}</div>
                  {unreadCounts.get(group._id) > 0 && (
                    <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                      {unreadCounts.get(group._id)}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}
          {activeTab === 'client' && (
            <>
              <h3 className="text-lg font-semibold mb-4">Clients</h3>
              {filteredClients.map(client => (
                <div 
                  key={client._id} 
                  onClick={() => setSelectedChat({ type: 'client', id: client._id })}
                  className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'client' && selectedChat.id === client._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <img 
                    src={client.profilePhoto || '/default-avatar.png'} 
                    alt={client.fullName} 
                    className="w-10 h-10 rounded-full" 
                  />
                  <div className="ml-3 flex-1 font-medium">{client.fullName}</div>
                  {unreadCounts.get(client._id) > 0 && (
                    <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                      {unreadCounts.get(client._id)}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-gray-50 ml-64 h-screen">
        {selectedChat.id ? (
          <>
            <div className="fixed top-0 mt-14 left-[256px] right-0 p-4 border-b border-gray-200 flex items-center bg-white z-20">
              {selectedData && (
                <>
                  <img 
                    src={selectedData.superAdminPhoto || selectedData.profilePhoto || '/default-avatar.png'} 
                    alt={selectedData.name || selectedData.fullName} 
                    className="w-10 h-10 rounded-full" 
                  />
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
                    {selectedChat.type === 'client' && currentMessages.some(msg => msg.adminThatReplied) && (
                      <div className="text-sm text-gray-500">
                        Assigned: {users.find(u => u._id === currentMessages.find(msg => msg.adminThatReplied)?.adminThatReplied)?.name}
                      </div>
                    )}
                  </div>
                  {isTyping && <div className="ml-4 text-gray-500">Typing...</div>}
                </>
              )}
            </div>
            <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-4 pt-24 pb-20">
              {currentMessages.map(msg => (
                <div 
                  key={msg._id} 
                  className={`flex flex-col mb-2 ${msg.from._id === auth.user.id ? 'items-end' : 'items-start'}`}
                >
                  {msg.from._id !== auth.user.id && (
                    <div className="flex items-center mb-1">
                      <img 
                        src={msg.from.superAdminPhoto || msg.from.profilePhoto || '/default-avatar.png'} 
                        alt={msg.from.name} 
                        className="w-6 h-6 rounded-full mr-2" 
                      />
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
      {showGroupCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Group</h3>
              <button 
                onClick={() => setShowGroupCreator(false)} 
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <input 
              type="text" 
              value={groupName} 
              onChange={(e) => setGroupName(e.target.value)} 
              placeholder="Group Name"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-4" 
            />
            <div className="mb-4">
              <div className="font-medium mb-2">Select Members</div>
              <div className="max-h-48 overflow-y-auto">
                {users.map(user => (
                  <label 
                    key={user._id} 
                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      checked={groupMembers.includes(user._id)}
                      onChange={(e) => setGroupMembers(prev => 
                        e.target.checked ? [...prev, user._id] : prev.filter(id => id !== user._id)
                      )} 
                      className="mr-3" 
                    />
                    <img 
                      src={user.superAdminPhoto || '/default-avatar.png'} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full mr-2" 
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <button 
              onClick={handleCreateGroup} 
              className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;