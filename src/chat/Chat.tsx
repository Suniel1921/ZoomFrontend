import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuthGlobally } from '../context/AuthContext';
import { Send, UserPlus, X } from 'lucide-react';

const Chat = () => {
  const { 
    privateChats, 
    groupChats, 
    users, 
    groups, 
    sendPrivateMessage, 
    sendGroupMessage, 
    createGroup,
    fetchPrivateChatHistory,
    fetchGroupChatHistory
  } = useChat();
  const [auth] = useAuthGlobally();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedUser) {
      fetchPrivateChatHistory(selectedUser);
    } else if (selectedGroup) {
      fetchGroupChatHistory(selectedGroup);
    }
  }, [selectedUser, selectedGroup, fetchPrivateChatHistory, fetchGroupChatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [privateChats, groupChats, selectedUser, selectedGroup]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (selectedUser) {
      sendPrivateMessage(selectedUser, message);
    } else if (selectedGroup) {
      sendGroupMessage(selectedGroup, message);
    }
    setMessage('');
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chatKey = selectedUser ?
    [auth.user.id, selectedUser].sort().join('-') : // Changed from auth.user._id to auth.user.id
    selectedGroup;

  const currentMessages = chatKey ?
    (selectedUser ? privateChats.get(chatKey) : groupChats.get(chatKey)) || []
    : [];

  const selectedUserData = selectedUser ?
    users.find(u => u._id === selectedUser) : null;

  const selectedGroupData = selectedGroup ?
    groups.find(g => g._id === selectedGroup) : null;

  // Debugging: Log auth.user.id and messages to check alignment logic
  // console.log('Auth User ID:', auth?.user?.id);
  // console.log('Current Messages:', currentMessages);

  // Ensure auth.user.id is available before rendering messages
  if (!auth?.user?.id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
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
                onClick={() => {
                  setSelectedUser(user._id);
                  setSelectedGroup(null);
                }}
                className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedUser === user._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                {user.superAdminPhoto ? (
                  <img
                    src={user.superAdminPhoto}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="ml-3 flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </div>
                </div>
              </div>
            ))}
            <h3 className="text-lg font-semibold mt-6 mb-4">Groups</h3>
            {filteredGroups.map(group => (
              <div
                key={group._id}
                onClick={() => {
                  setSelectedGroup(group._id);
                  setSelectedUser(null);
                }}
                className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedGroup === group._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {group.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{group.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-white">
        {(selectedUser || selectedGroup) && (
          <div className="p-4 border-b border-gray-200 flex items-center">
            {selectedUserData && (
              <>
                {selectedUserData.superAdminPhoto ? (
                  <img
                    src={selectedUserData.superAdminPhoto}
                    alt={selectedUserData.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {selectedUserData.name.charAt(0)}
                  </div>
                )}
                <div className="ml-3">
                  <div className="font-medium">{selectedUserData.name}</div>
                  <div className="text-sm text-gray-500">
                    {selectedUserData.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </div>
                </div>
              </>
            )}
            {selectedGroupData && (
              <>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {selectedGroupData.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{selectedGroupData.name}</div>
                </div>
              </>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {currentMessages.map((msg, idx) => {
            // Ensure msg.from._id is a string for comparison
            const senderId = msg.from._id.toString();
            const currentUserId = auth.user.id.toString(); // Changed from auth.user._id to auth.user.id
            const isSender = senderId === currentUserId;

            // Debug: Log each message's sender and comparison result
            console.log(`Message ${idx}:`, {
              content: msg.content,
              senderId: senderId,
              currentUserId: currentUserId,
              isSender: isSender,
            });

            return (
              <div
                key={msg._id || idx}
                className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                {!isSender && (
                  <div className="flex items-start mr-2">
                    {msg.from.superAdminPhoto ? (
                      <img
                        src={msg.from.superAdminPhoto}
                        alt={msg.from.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                        {msg.from.name.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${isSender ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                >
                  <div className="text-sm font-medium mb-1">{msg.from.name}</div>
                  <div>{msg.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
        {(selectedUser || selectedGroup) && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="ml-2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              >
                <Send size={20} />
              </button>
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGroupMembers(prev => [...prev, user._id]);
                        } else {
                          setGroupMembers(prev => prev.filter(id => id !== user._id));
                        }
                      }}
                      className="mr-3"
                    />
                    {user.superAdminPhoto ? (
                      <img
                        src={user.superAdminPhoto}
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        {user.name.charAt(0)}
                      </div>
                    )}
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
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <button
              onClick={handleCreateGroup}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

