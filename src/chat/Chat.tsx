import { useState, useEffect, useRef } from 'react';
import { useAuthGlobally } from '../context/AuthContext';
import { Send, UserPlus, X } from 'lucide-react';
import { useChat } from '../context/ChatWithTeamContext';

interface ChatSelection {
    type: 'private' | 'group' | null;
    id: string | null;
}

interface ChatUser {
    _id: string;
    name: string;
    role: 'admin' | 'superadmin';
    superAdminPhoto?: string;
}

interface Group {
    _id: string;
    name: string;
    members: string[];
}

const Chat = () => {
    const {
        privateChats,
        groupChats,
        users: chatUsers,
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
    } = useChat();
    const [auth] = useAuthGlobally();
    if (!auth?.user?.id) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;

    const user = auth.user;

    const [selectedChat, setSelectedChat] = useState<ChatSelection>({ type: null, id: null });
    const [message, setMessage] = useState('');
    const [showGroupCreator, setShowGroupCreator] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const chatEndRef = useRef(null);
    const chatWindowRef = useRef(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [users, setUsers] = useState<ChatUser[]>(chatUsers);

    useEffect(() => {
        if (selectedChat.type === 'private' && selectedChat.id) {
            fetchPrivateChatHistory(selectedChat.id);
        } else if (selectedChat.type === 'group' && selectedChat.id) {
            fetchGroupChatHistory(selectedChat.id);
        }
    }, [selectedChat, fetchPrivateChatHistory, fetchGroupChatHistory]);

    const clearTypingTimeout = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    const handleSend = () => {
        if (!message.trim() || !selectedChat.id) return;
        if (selectedChat.type === 'private') {
            sendPrivateMessage(selectedChat.id, message);
        } else if (selectedChat.type === 'group') {
            sendGroupMessage(selectedChat.id, message);
        }
        setMessage('');
        clearTypingTimeout();
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
            console.error('Error creating group:', err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const chatKey = selectedChat.type === 'private'
        ? [user.id, selectedChat.id].sort().join('-')
        : selectedChat.id;

    const currentMessages = chatKey
        ? (selectedChat.type === 'private' ? privateChats.get(chatKey) : groupChats.get(chatKey)) || []
        : [];

    const selectedData = selectedChat.type === 'private'
        ? users.find(u => u._id === selectedChat.id)
        : groups.find(g => g._id === selectedChat.id);

    // Add type guard function
    const isPrivateChat = (data: ChatUser | Group): data is ChatUser => {
        return 'role' in data;
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        if (!e.target.value || !selectedChat.id || !selectedChat.type) {
            clearTypingTimeout();
            return;
        }

        const chatKey = selectedChat.type === 'private'
            ? [user.id, selectedChat.id].sort().join('-')
            : selectedChat.id;

        sendTypingEvent(chatKey, selectedChat.type);

        clearTypingTimeout();
        typingTimeoutRef.current = setTimeout(() => {
            // Optionally, you can emit a "STOP_TYPING" event if needed
        }, 1500);
    };

    // Check if someone is typing in the current chat (excluding the current user)
    const isTyping = selectedChat.id && typingUsers.has(`${selectedChat.type}-${chatKey}`)
        ? typingUsers.get(`${selectedChat.type}-${chatKey}`) !== user.id
        : false;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden mt-11">
            {/* Chat List (Sidebar) */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-0">
                <div className="p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Direct Messages</h3>
                        <button
                            onClick={() => setShowGroupCreator(true)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <UserPlus size={20} />
                        </button>
                    </div>
                    {filteredUsers.map(chatUser => (
                        <div
                            key={chatUser._id}
                            onClick={() => setSelectedChat({ type: 'private', id: chatUser._id })}
                            className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'private' && selectedChat.id === chatUser._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                            {chatUser.superAdminPhoto ? (
                                <img src={chatUser.superAdminPhoto} alt={chatUser.name} className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    {chatUser.name.charAt(0)}
                                </div>
                            )}
                            <div className="ml-3 flex-1">
                                <div className="font-medium">{chatUser.name}</div>
                                <div className="text-sm text-gray-500">
                                    {chatUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                    {onlineUsers.has(chatUser._id) ? (
                                        <span className="ml-1 text-green-500">• Online</span>
                                    ) : (
                                        <span className="ml-1 text-gray-400">• Offline</span>
                                    )}
                                </div>
                            </div>
                            {(() => {
                                const chatKey = [user.id, chatUser._id].sort().join('-');
                                const unreadCount = unreadCounts.get(chatKey);
                                return unreadCount && unreadCount > 0 ? (
                                    <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                                        {unreadCount}
                                    </span>
                                ) : null;
                            })()}
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
                            <div className="ml-3 flex-1">
                                <div className="font-medium">{group.name}</div>
                            </div>
                            {(() => {
                                const unreadCount = unreadCounts.get(group._id);
                                return unreadCount && unreadCount > 0 ? (
                                    <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                                        {unreadCount}
                                    </span>
                                ) : null;
                            })()}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-gray-50 ml-64 h-screen">
                {selectedChat.id ? (
                    <>
                        {/* Fixed Chat Header */}
                        <div className="fixed top-0 mt-14 left-[256px] right-0 p-4 border-b border-gray-200 flex items-center bg-white z-20">
                            {selectedData && (
                                <>
                                    {selectedChat.type === 'private' && isPrivateChat(selectedData) && selectedData.superAdminPhoto ? (
                                        <img src={selectedData.superAdminPhoto} alt={selectedData.name} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            {selectedData.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="ml-3">
                                        <div className="font-medium">{selectedData.name}</div>
                                        {selectedChat.type === 'private' && isPrivateChat(selectedData) && (
                                            <div className="text-sm text-gray-500">
                                                {selectedData.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                                {onlineUsers.has(selectedData._id) ? (
                                                    <span className="ml-1 text-green-500">• Online</span>
                                                ) : (
                                                    <span className="ml-1 text-gray-400">• Offline</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {isTyping && <div className="ml-4 text-gray-500">Typing...</div>}
                                </>
                            )}
                        </div>

                        {/* Scrollable Chat Messages */}
                        <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-4 pt-24 pb-20">
                            {currentMessages.map((msg:any) => (
                                <div
                                    key={msg._id}
                                    className={`flex flex-col mb-2 ${msg.from._id === user.id ? 'items-end' : 'items-start'}`}
                                >
                                    {msg.from._id !== user.id && (
                                        <div className="flex items-center mb-1">
                                            {msg.from.superAdminPhoto ? (
                                                <img
                                                    src={msg.from.superAdminPhoto}
                                                    alt={msg.from.name}
                                                    className="w-6 h-6 rounded-full mr-2"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2">
                                                    {msg.from.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500">{msg.from.name}</div>
                                        </div>
                                    )}
                                    <div
                                        className={`rounded-xl p-2 break-words max-w-[70%] ${msg.from._id === user.id ? 'bg-green-100 text-gray-700' : 'bg-white border border-gray-200'}`}
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

                        {/* Fixed Chat Input */}
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
                            <p>Select a direct message or group from the left to start chatting!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Group Creation Modal */}
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
                                    <label key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={groupMembers.includes(user._id)}
                                            onChange={(e) =>
                                                setGroupMembers(prev =>
                                                    e.target.checked ? [...prev, user._id] : prev.filter(id => id !== user._id)
                                                )
                                            }
                                            className="mr-3"
                                        />
                                        {user.superAdminPhoto ? (
                                            <img src={user.superAdminPhoto} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
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
                        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                        <button
                            onClick={handleCreateGroup}
                            className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-500"
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




