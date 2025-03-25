import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthGlobally } from '../context/AuthContext';
import { Send, UserPlus, X } from 'lucide-react';
import { useChat } from '../context/ChatWithTeamContext';

const Chat = () => {
    const {
        privateChats,
        clientChats,
        groupChats,
        users,
        clients,
        groups,
        unreadCounts,
        onlineUsers,
        typingUsers,
        sendPrivateMessage,
        sendClientMessage,
        sendGroupMessage,
        createGroup,
        fetchPrivateChatHistory,
        fetchClientChatHistory,
        fetchGroupChatHistory,
        sendTypingEvent,
    } = useChat();
    const [auth] = useAuthGlobally();
    const [selectedChat, setSelectedChat] = useState({ type: null, id: null });
    const [message, setMessage] = useState('');
    const [showGroupCreator, setShowGroupCreator] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const chatEndRef = useRef(null);
    const chatWindowRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'client'

    const handleScroll = useCallback(() => {
        if (!chatWindowRef.current) return;
        const currentScrollPos = chatWindowRef.current.scrollTop;
        // Optional: Add logic to show/hide navbar if needed
    }, []);

    useEffect(() => {
        const chatWindow = chatWindowRef.current;
        if (chatWindow) {
            chatWindow.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (chatWindow) {
                chatWindow.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll]);

    useEffect(() => {
        if (selectedChat.type === 'private' && selectedChat.id) {
            fetchPrivateChatHistory(selectedChat.id);
        } else if (selectedChat.type === 'group' && selectedChat.id) {
            fetchGroupChatHistory(selectedChat.id);
        } else if (selectedChat.type === 'client' && selectedChat.id) {
            fetchClientChatHistory(selectedChat.id);
        }

    }, [selectedChat, fetchPrivateChatHistory, fetchGroupChatHistory, fetchClientChatHistory]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [privateChats, groupChats, clientChats, selectedChat]);

    const handleSend = () => {
        if (!message.trim() || !selectedChat.id) return;
        if (selectedChat.type === 'private') {
            sendPrivateMessage(selectedChat.id, message);
        } else if (selectedChat.type === 'group') {
            sendGroupMessage(selectedChat.id, message);
        } else if (selectedChat.type === 'client') {
            sendClientMessage(selectedChat.id, message);
        }
        setMessage('');
        clearTimeout(typingTimeoutRef.current);
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

    //newly add it
    const filteredClients = Array.isArray(clients) ? clients.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const chatKey = selectedChat.type === 'private'
        ? [auth.user.id, selectedChat.id].sort().join('-')
        : selectedChat.type === 'group'
            ? selectedChat.id
            : selectedChat.id; // Client chat ID

    const currentMessages = chatKey
        ? (selectedChat.type === 'private' ? privateChats.get(chatKey)
            : selectedChat.type === 'group' ? groupChats.get(chatKey)
                : clientChats.get(selectedChat.id)) || [] //client msg

        : [];

    const selectedData = selectedChat.type === 'private'
        ? users.find(u => u._id === selectedChat.id)
        : selectedChat.type === 'group'
            ? groups.find(g => g._id === selectedChat.id)
            : Array.isArray(clients) ? clients.find(c => c._id === selectedChat.id) : undefined; // Client

    useEffect(() => {
        console.log("Selected Data", selectedData)
    }, [selectedData])


    const handleTyping = (e) => {
        setMessage(e.target.value);

        if (!e.target.value) {
            clearTimeout(typingTimeoutRef.current);
            return;
        }

        // Emit typing event to the server
        sendTypingEvent(chatKey, selectedChat.type);

        // Reset typing event after 1.5 seconds
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            // Optionally, you can emit a "STOP_TYPING" event if needed
        }, 1500);
    };

    // Check if someone is typing in the current chat (excluding the current user)
    const isTyping = selectedChat.id && typingUsers.has(`${selectedChat.type}-${chatKey}`)
        ? typingUsers.get(`${selectedChat.type}-${chatKey}`) !== auth.user.id
        : false;

    if (!auth?.user?.id) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;

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

                {/* Tab Navigation */}
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
                                    {user.superAdminPhoto ? (
                                        <img src={user.superAdminPhoto} alt={user.name} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="ml-3 flex-1">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                            {onlineUsers.has(user._id) ? (
                                                <span className="ml-1 text-green-500">• Online</span>
                                            ) : (
                                                <span className="ml-1 text-gray-400">• Offline</span>
                                            )}
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
                                    <div className="ml-3 flex-1">
                                        <div className="font-medium">{group.name}</div>
                                    </div>
                                    {unreadCounts.get(group._id) > 0 && (
                                        <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
                                            {unreadCounts.get(group._id)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* Client Chat List */}
                    {activeTab === 'client' && (
                        <>
                            <h3 className="text-lg font-semibold mb-4">Clients</h3>
                            {filteredClients.map(client => (
                                <div
                                    key={client._id}
                                    onClick={() => setSelectedChat({ type: 'client', id: client._id })}
                                    className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'client' && selectedChat.id === client._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    {client.profilePhoto ? (
                                        <img src={client.profilePhoto} alt={client.fullName} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            {client.fullName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="ml-3 flex-1">
                                        <div className="font-medium">{client.fullName}</div>
                                    </div>
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

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-gray-50 ml-64 h-screen">
                {selectedChat.id ? (
                    <>
                        {/* Fixed Chat Header */}
                        <div className="fixed top-0 mt-14 left-[256px] right-0 p-4 border-b border-gray-200 flex items-center bg-white z-20">
                            {selectedData && (
                                <>
                                    {selectedChat.type === 'private' && selectedData?.superAdminPhoto ? (
                                        <img src={selectedData.superAdminPhoto} alt={selectedData.name} className="w-10 h-10 rounded-full" />
                                    ) : selectedChat.type === 'client' && selectedData?.profilePhoto ? (
                                        <img src={selectedData.profilePhoto} alt={selectedData.fullName} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            {selectedData?.name ? selectedData.name.charAt(0) : selectedData?.fullName?.charAt(0) || "?"}
                                        </div>
                                    )}
                                    <div className="ml-3">
                                        <div className="font-medium">{selectedData?.name || selectedData?.fullName}</div>
                                        {selectedChat.type === 'private' && (
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
                            {currentMessages.map((msg: any) => (
                                <div
                                    key={msg._id}
                                    className={`flex flex-col mb-2 ${msg.from._id === auth.user.id ? 'items-end' : 'items-start'}`}
                                >
                                    {msg.from._id !== auth.user.id && (
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
















// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useAuthGlobally } from '../context/AuthContext';
// import { Send, UserPlus, X } from 'lucide-react';
// import { useChat } from '../context/ChatWithTeamContext';

// const Chat = () => {
//     const {
//         privateChats,
//         groupChats,
//         users,
//         groups,
//         unreadCounts,
//         onlineUsers,
//         typingUsers,
//         sendPrivateMessage,
//         sendGroupMessage,
//         createGroup,
//         fetchPrivateChatHistory,
//         fetchGroupChatHistory,
//         sendTypingEvent,
//     } = useChat();
//     const [auth] = useAuthGlobally();
//     const [selectedChat, setSelectedChat] = useState({ type: null, id: null });
//     const [message, setMessage] = useState('');
//     const [showGroupCreator, setShowGroupCreator] = useState(false);
//     const [groupName, setGroupName] = useState('');
//     const [groupMembers, setGroupMembers] = useState([]);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const chatEndRef = useRef(null);
//     const chatWindowRef = useRef(null);
//     const typingTimeoutRef = useRef(null);

//     const handleScroll = useCallback(() => {
//         if (!chatWindowRef.current) return;
//         const currentScrollPos = chatWindowRef.current.scrollTop;
//         // Optional: Add logic to show/hide navbar if needed
//     }, []);

//     useEffect(() => {
//         const chatWindow = chatWindowRef.current;
//         if (chatWindow) {
//             chatWindow.addEventListener('scroll', handleScroll);
//         }
//         return () => {
//             if (chatWindow) {
//                 chatWindow.removeEventListener('scroll', handleScroll);
//             }
//         };
//     }, [handleScroll]);

//     useEffect(() => {
//         if (selectedChat.type === 'private' && selectedChat.id) {
//             fetchPrivateChatHistory(selectedChat.id);
//         } else if (selectedChat.type === 'group' && selectedChat.id) {
//             fetchGroupChatHistory(selectedChat.id);
//         }
//     }, [selectedChat, fetchPrivateChatHistory, fetchGroupChatHistory]);

//     useEffect(() => {
//         chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [privateChats, groupChats, selectedChat]);

//     const handleSend = () => {
//         if (!message.trim() || !selectedChat.id) return;
//         if (selectedChat.type === 'private') {
//             sendPrivateMessage(selectedChat.id, message);
//         } else if (selectedChat.type === 'group') {
//             sendGroupMessage(selectedChat.id, message);
//         }
//         setMessage('');
//         clearTimeout(typingTimeoutRef.current);
//     };

//     const handleCreateGroup = async () => {
//         if (!groupName.trim()) {
//             setError('Group name is required');
//             return;
//         }
//         try {
//             await createGroup(groupName, groupMembers);
//             setShowGroupCreator(false);
//             setGroupName('');
//             setGroupMembers([]);
//             setError(null);
//         } catch (err) {
//             setError('Failed to create group');
//             console.error('Error creating group:', err);
//         }
//     };

//     const filteredUsers = users.filter(user =>
//         user.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     const filteredGroups = groups.filter(group =>
//         group.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const chatKey = selectedChat.type === 'private'
//         ? [auth.user.id, selectedChat.id].sort().join('-')
//         : selectedChat.id;

//     const currentMessages = chatKey
//         ? (selectedChat.type === 'private' ? privateChats.get(chatKey) : groupChats.get(chatKey)) || []
//         : [];

//     const selectedData = selectedChat.type === 'private'
//         ? users.find(u => u._id === selectedChat.id)
//         : groups.find(g => g._id === selectedChat.id);

//     const handleTyping = (e) => {
//         setMessage(e.target.value);

//         if (!e.target.value) {
//             clearTimeout(typingTimeoutRef.current);
//             return;
//         }

//         // Emit typing event to the server
//         sendTypingEvent(chatKey, selectedChat.type);

//         // Reset typing event after 1.5 seconds
//         clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = setTimeout(() => {
//             // Optionally, you can emit a "STOP_TYPING" event if needed
//         }, 1500);
//     };

//     // Check if someone is typing in the current chat (excluding the current user)
//     const isTyping = selectedChat.id && typingUsers.has(`${selectedChat.type}-${chatKey}`)
//         ? typingUsers.get(`${selectedChat.type}-${chatKey}`) !== auth.user.id
//         : false;

//     if (!auth?.user?.id) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;

//     return (
//         <div className="flex h-screen bg-gray-50 overflow-hidden mt-11">
//             {/* Chat List (Sidebar) */}
//             <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-0">
//                 <div className="p-4 border-b border-gray-200">
//                     <input
//                         type="text"
//                         placeholder="Search chats..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//                 <div className="flex-1 overflow-y-auto p-4">
//                     <div className="flex justify-between items-center mb-4">
//                         <h3 className="text-lg font-semibold">Direct Messages</h3>
//                         <button
//                             onClick={() => setShowGroupCreator(true)}
//                             className="p-2 hover:bg-gray-100 rounded-full"
//                         >
//                             <UserPlus size={20} />
//                         </button>
//                     </div>
//                     {filteredUsers.map(user => (
//                         <div
//                             key={user._id}
//                             onClick={() => setSelectedChat({ type: 'private', id: user._id })}
//                             className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'private' && selectedChat.id === user._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
//                         >
//                             {user.superAdminPhoto ? (
//                                 <img src={user.superAdminPhoto} alt={user.name} className="w-10 h-10 rounded-full" />
//                             ) : (
//                                 <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
//                                     {user.name.charAt(0)}
//                                 </div>
//                             )}
//                             <div className="ml-3 flex-1">
//                                 <div className="font-medium">{user.name}</div>
//                                 <div className="text-sm text-gray-500">
//                                     {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
//                                     {onlineUsers.has(user._id) ? (
//                                         <span className="ml-1 text-green-500">• Online</span>
//                                     ) : (
//                                         <span className="ml-1 text-gray-400">• Offline</span>
//                                     )}
//                                 </div>
//                             </div>
//                             {unreadCounts.get([auth.user.id, user._id].sort().join('-')) > 0 && (
//                                 <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
//                                     {unreadCounts.get([auth.user.id, user._id].sort().join('-'))}
//                                 </span>
//                             )}
//                         </div>
//                     ))}
//                     <h3 className="text-lg font-semibold mt-6 mb-4">Groups</h3>
//                     {filteredGroups.map(group => (
//                         <div
//                             key={group._id}
//                             onClick={() => setSelectedChat({ type: 'group', id: group._id })}
//                             className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer ${selectedChat.type === 'group' && selectedChat.id === group._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
//                         >
//                             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
//                                 {group.name.charAt(0)}
//                             </div>
//                             <div className="ml-3 flex-1">
//                                 <div className="font-medium">{group.name}</div>
//                             </div>
//                             {unreadCounts.get(group._id) > 0 && (
//                                 <span className="bg-blue-500 text-white rounded-full px-2 text-xs">
//                                     {unreadCounts.get(group._id)}
//                                 </span>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Chat Window */}
//             <div className="flex-1 flex flex-col bg-gray-50 ml-64 h-screen">
//                 {selectedChat.id ? (
//                     <>
//                         {/* Fixed Chat Header */}
//                         <div className="fixed top-0 mt-14 left-[256px] right-0 p-4 border-b border-gray-200 flex items-center bg-white z-20">
//                             {selectedData && (
//                                 <>
//                                     {selectedChat.type === 'private' && selectedData.superAdminPhoto ? (
//                                         <img src={selectedData.superAdminPhoto} alt={selectedData.name} className="w-10 h-10 rounded-full" />
//                                     ) : (
//                                         <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
//                                             {selectedData.name.charAt(0)}
//                                         </div>
//                                     )}
//                                     <div className="ml-3">
//                                         <div className="font-medium">{selectedData.name}</div>
//                                         {selectedChat.type === 'private' && (
//                                             <div className="text-sm text-gray-500">
//                                                 {selectedData.role === 'superadmin' ? 'Super Admin' : 'Admin'}
//                                                 {onlineUsers.has(selectedData._id) ? (
//                                                     <span className="ml-1 text-green-500">• Online</span>
//                                                 ) : (
//                                                     <span className="ml-1 text-gray-400">• Offline</span>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                     {isTyping && <div className="ml-4 text-gray-500">Typing...</div>}
//                                 </>
//                             )}
//                         </div>

//                         {/* Scrollable Chat Messages */}
//                         <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-4 pt-24 pb-20">
//                             {currentMessages.map((msg:any) => (
//                                 <div
//                                     key={msg._id}
//                                     className={`flex flex-col mb-2 ${msg.from._id === auth.user.id ? 'items-end' : 'items-start'}`}
//                                 >
//                                     {msg.from._id !== auth.user.id && (
//                                         <div className="flex items-center mb-1">
//                                             {msg.from.superAdminPhoto ? (
//                                                 <img
//                                                     src={msg.from.superAdminPhoto}
//                                                     alt={msg.from.name}
//                                                     className="w-6 h-6 rounded-full mr-2"
//                                                 />
//                                             ) : (
//                                                 <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2">
//                                                     {msg.from.name.charAt(0)}
//                                                 </div>
//                                             )}
//                                             <div className="text-xs text-gray-500">{msg.from.name}</div>
//                                         </div>
//                                     )}
//                                     <div
//                                         className={`rounded-xl p-2 break-words max-w-[70%] ${msg.from._id === auth.user.id ? 'bg-green-100 text-gray-700' : 'bg-white border border-gray-200'}`}
//                                     >
//                                         {msg.content}
//                                         <div className="text-xs text-gray-500 mt-1 text-right">
//                                             {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                             <div ref={chatEndRef} />
//                         </div>

//                         {/* Fixed Chat Input */}
//                         <div className="fixed bottom-0 left-[256px] right-0 p-4 border-t border-gray-200 bg-white z-20">
//                             <div className="flex items-center">
//                                 <input
//                                     type="text"
//                                     value={message}
//                                     onChange={handleTyping}
//                                     onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//                                     placeholder="Type a message..."
//                                     className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <button
//                                     onClick={handleSend}
//                                     className="ml-2 p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600"
//                                 >
//                                     <Send size={20} />
//                                 </button>
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex items-center justify-center h-full text-gray-500">
//                         <div className="text-center">
//                             <h2 className="text-xl font-semibold mb-2">No Chat Selected</h2>
//                             <p>Select a direct message or group from the left to start chatting!</p>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Group Creation Modal */}
//             {showGroupCreator && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
//                         <div className="flex justify-between items-center mb-4">
//                             <h3 className="text-lg font-semibold">Create New Group</h3>
//                             <button
//                                 onClick={() => setShowGroupCreator(false)}
//                                 className="p-1 hover:bg-gray-100 rounded-full"
//                             >
//                                 <X size={20} />
//                             </button>
//                         </div>
//                         <input
//                             type="text"
//                             value={groupName}
//                             onChange={(e) => setGroupName(e.target.value)}
//                             placeholder="Group Name"
//                             className="w-full px-4 py-2 rounded-lg border border-gray-200 mb-4"
//                         />
//                         <div className="mb-4">
//                             <div className="font-medium mb-2">Select Members</div>
//                             <div className="max-h-48 overflow-y-auto">
//                                 {users.map(user => (
//                                     <label key={user._id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
//                                         <input
//                                             type="checkbox"
//                                             checked={groupMembers.includes(user._id)}
//                                             onChange={(e) =>
//                                                 setGroupMembers(prev =>
//                                                     e.target.checked ? [...prev, user._id] : prev.filter(id => id !== user._id)
//                                                 )
//                                             }
//                                             className="mr-3"
//                                         />
//                                         {user.superAdminPhoto ? (
//                                             <img src={user.superAdminPhoto} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
//                                         ) : (
//                                             <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
//                                                 {user.name.charAt(0)}
//                                             </div>
//                                         )}
//                                         <div>
//                                             <div className="font-medium">{user.name}</div>
//                                             <div className="text-sm text-gray-500">
//                                                 {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
//                                             </div>
//                                         </div>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//                         {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
//                         <button
//                             onClick={handleCreateGroup}
//                             className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-500"
//                         >
//                             Create Group
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Chat;




// // handle also client msg also 
// import React, { useState } from 'react';
// import { X, Smile, Paperclip, Send } from 'lucide-react';
// import { useAuthGlobally } from '../../context/AuthContext';

// const ChatWithTeam = ({ onClose }) => {
//   const [auth] = useAuthGlobally();
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       sender: 'Zoom Creatives',
//       content: 'Hello 👋! Please briefly describe your issue so we can help you better.',
//       timestamp: new Date(),
//       profilePhoto: '/logo2.png', // Zoom Creatives logo
//     },
//   ]);

//   const handleSendMessage = () => {
//     if (!message.trim()) return;

//     const newMessage = {
//       id: messages.length + 1,
//       sender: auth.user.fullName || 'You', // Use client's full name
//       content: message,
//       timestamp: new Date(),
//       profilePhoto: auth.user.profilePhoto || null, // Use client's profile photo
//     };

//     setMessages([...messages, newMessage]);
//     setMessage('');

//     // Simulate a response from Zoom Creatives after a short delay
//     setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: prev.length + 1,
//           sender: 'Zoom Creatives',
//           content: 'Thank you for your message! We’ll get back to you shortly.',
//           timestamp: new Date(),
//           profilePhoto: '/logo2.png',
//         },
//       ]);
//     }, 1000);
//   };

//   return (
//     <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col z-50">
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fcda00] to-[#232323] text-white rounded-t-lg">
//         <div className="flex items-center gap-2">
//           <img src="/logo2.png" alt="Zoom Logo" className="h-6 w-6" />
//           <div>
//             <h3 className="font-semibold">Zoom Creatives</h3>
//             <p className="text-xs">The team can also help</p>
//           </div>
//         </div>
//         <button onClick={onClose} className="text-white hover:text-gray-200">
//           <X className="h-5 w-5" />
//         </button>
//       </div>

//       {/* Messages Area */}
//       <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`mb-4 flex ${msg.sender === auth.user.fullName ? 'justify-end' : 'justify-start'}`}
//           >
//             <div className="flex flex-col">
//               {/* Sender Name and Photo */}
//               <div className="flex items-center mb-1">
//                 {msg.sender !== auth.user.fullName && (
//                   <>
//                     {msg.profilePhoto ? (
//                       <img
//                         src={msg.profilePhoto}
//                         alt={msg.sender}
//                         className="w-6 h-6 rounded-full mr-2"
//                       />
//                     ) : (
//                       <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2">
//                         {msg.sender.charAt(0)}
//                       </div>
//                     )}
//                     <div className="text-xs text-gray-500">{msg.sender}</div>
//                   </>
//                 )}
//               </div>
//               {/* Message Content */}
//               <div
//                 className={`max-w-[80%] p-3 rounded-lg ${
//                   msg.sender === auth.user.fullName
//                     ? 'bg-purple-100 text-gray-800'
//                     : 'bg-white text-gray-800 shadow-sm'
//                 }`}
//               >
//                 <p>{msg.content}</p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </p>
//               </div>
//               {/* Sender Name and Photo for User's Messages (below the message) */}
//               {msg.sender === auth.user.fullName && (
//                 <div className="flex items-center justify-end mt-1">
//                   <div className="text-xs text-gray-500 mr-2">{msg.sender}</div>
//                   {msg.profilePhoto ? (
//                     <img
//                       src={msg.profilePhoto}
//                       alt={msg.sender}
//                       className="w-6 h-6 rounded-full"
//                     />
//                   ) : (
//                     <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
//                       {msg.sender.charAt(0)}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input Area */}
//       <div className="p-4 border-t border-gray-200">
//         <div className="flex items-center gap-2">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyUp={(e) => e.key === 'Enter' && handleSendMessage()}
//             placeholder="Message..."
//             className="flex-1 px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#fcda00] text-sm"
//           />
//           <button className="text-gray-500 hover:text-[#fcda00]">
//             <Smile className="h-5 w-5" />
//           </button>
//           <button className="text-gray-500 hover:text-[#fcda00]">
//             <Paperclip className="h-5 w-5" />
//           </button>
//           <button
//             onClick={handleSendMessage}
//             className="bg-[#fcda00] text-white rounded-full p-2 hover:bg-yellow-300"
//           >
//             <Send className="h-5 w-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatWithTeam; 




// import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import { useAuthGlobally } from './AuthContext';

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//     const [auth] = useAuthGlobally();
//     const [ws, setWs] = useState(null);
//     const [privateChats, setPrivateChats] = useState(new Map());
//     const [groupChats, setGroupChats] = useState(new Map());
//     const [unreadCounts, setUnreadCounts] = useState(new Map());
//     const [users, setUsers] = useState([]);
//     const [groups, setGroups] = useState([]);
//     const [onlineUsers, setOnlineUsers] = useState(new Set());
//     const [typingUsers, setTypingUsers] = useState(new Map()); // Map to track typing users per chat

//     const api = axios.create({
//         baseURL: import.meta.env.VITE_REACT_APP_URL,
//         headers: { Authorization: `Bearer ${auth?.token}` },
//     });

//     const updateUnreadCount = useCallback((chatId, messages) => {
//         const unreadCount = messages.filter(
//             msg => !msg.read && msg.from._id !== auth?.user?.id
//         ).length;
//         setUnreadCounts(prev => new Map(prev).set(chatId, unreadCount > 0 ? unreadCount : 0));
//     }, [auth?.user?.id]);

//     const fetchInitialData = useCallback(async () => {
//         if (!auth?.token) return;
//         try {
//             const [adminsRes, superAdminsRes, groupsRes] = await Promise.all([
//                 api.get('/api/v1/admin/getAllAdmin'),
//                 api.get('/api/v1/superAdmin/getAllSuperAdmins'),
//                 api.get('/api/v1/chat/group/list'),
//             ]);
//             setUsers([
//                 ...(adminsRes.data.admins || []).map(admin => ({ ...admin, role: 'admin' })),
//                 ...(superAdminsRes.data.superAdmins || []).map(superAdmin => ({ ...superAdmin, role: 'superadmin' })),
//             ]);
//             setGroups(groupsRes.data.groups || []);
//         } catch (err) {
//             console.error('Failed to fetch initial data:', err);
//         }
//     }, [auth?.token]);

//     const fetchPrivateChatHistory = useCallback(async (otherUserId) => {
//         if (!auth?.token) return;
//         try {
//             const response = await api.post('/api/v1/chat/history/private', { otherUserId });
//             const messages = response.data.messages || [];
//             const chatKey = [auth.user.id, otherUserId].sort().join('-');
//             setPrivateChats(prev => {
//                 const updated = new Map(prev);
//                 updated.set(chatKey, messages);
//                 updateUnreadCount(chatKey, messages);
//                 return updated;
//             });
//         } catch (err) {
//             console.error('Failed to fetch private chat history:', err);
//         }
//     }, [auth?.token, auth?.user?.id, updateUnreadCount]);

//     const fetchGroupChatHistory = useCallback(async (groupId) => {
//         if (!auth?.token) return;
//         try {
//             const response = await api.post('/api/v1/chat/history/group', { groupId });
//             const messages = response.data.messages || [];
//             setGroupChats(prev => {
//                 const updated = new Map(prev);
//                 updated.set(groupId, messages);
//                 updateUnreadCount(groupId, messages);
//                 return updated;
//             });
//         } catch (err) {
//             console.error('Failed to fetch group chat history:', err);
//         }
//     }, [auth?.token, auth?.user?.id, updateUnreadCount]);

//     const connectWebSocket = useCallback(() => {
//         if (!auth?.token) return;
//         const websocket = new WebSocket(
//             `${import.meta.env.VITE_WS_URL || 'ws://localhost:3000'}?token=${auth.token}`
//         );

//         websocket.onopen = () => {
//             console.log('WebSocket connected');
//             setWs(websocket);
//             websocket.send(JSON.stringify({ type: 'USER_ONLINE', userId: auth.user.id }));
//         };

//         websocket.onmessage = (event) => {
//             try {
//                 const data = JSON.parse(event.data);
//                 switch (data.type) {
//                     case 'PRIVATE_MESSAGE': {
//                         const key = [auth.user.id, data.message.from._id].sort().join('-');
//                         setPrivateChats(prev => {
//                             const updated = new Map(prev);
//                             const messages = updated.get(key) || [];
//                             if (!messages.some(m => m._id === data.message._id)) {
//                                 updated.set(key, [...messages, data.message]);
//                                 updateUnreadCount(key, [...messages, data.message]);
//                             }
//                             return updated;
//                         });
//                         break;
//                     }
//                     case 'GROUP_MESSAGE': {
//                         setGroupChats(prev => {
//                             const updated = new Map(prev);
//                             const messages = updated.get(data.groupId) || [];
//                             if (!messages.some(m => m._id === data.message._id)) {
//                                 updated.set(data.groupId, [...messages, data.message]);
//                                 updateUnreadCount(data.groupId, [...messages, data.message]);
//                             }
//                             return updated;
//                         });
//                         break;
//                     }
//                     case 'GROUP_CREATED': {
//                         setGroups(prev => [...prev, data.group]);
//                         setGroupChats(prev => new Map(prev).set(data.group._id, []));
//                         break;
//                     }
//                     case 'USER_ONLINE': {
//                         setOnlineUsers(prev => new Set(prev).add(data.userId));
//                         break;
//                     }
//                     case 'USER_OFFLINE': {
//                         setOnlineUsers(prev => {
//                             const updated = new Set(prev);
//                             updated.delete(data.userId);
//                             return updated;
//                         });
//                         break;
//                     }
//                     case 'ONLINE_USERS': {
//                         setOnlineUsers(new Set(data.users));
//                         break;
//                     }
//                     case 'TYPING': {
//                         const { chatId, userId, chatType } = data;
//                         setTypingUsers(prev => {
//                             const updated = new Map(prev);
//                             updated.set(`${chatType}-${chatId}`, userId);
//                             return updated;
//                         });
//                         setTimeout(() => {
//                             setTypingUsers(prev => {
//                                 const updated = new Map(prev);
//                                 updated.delete(`${chatType}-${chatId}`);
//                                 return updated;
//                             });
//                         }, 1500); // Clear typing indicator after 1.5 seconds
//                         break;
//                     }
//                     default:
//                         console.warn('Unknown message type:', data.type);
//                 }
//             } catch (error) {
//                 console.error('Error processing WebSocket message:', error);
//             }
//         };

//         websocket.onerror = (error) => console.error('WebSocket error:', error);
//         websocket.onclose = () => {
//             console.log('WebSocket disconnected');
//             setWs(null);
//             setTimeout(connectWebSocket, 3000); // Retry connection after 3 seconds
//         };

//         return () => {
//             websocket.close();
//             setTypingUsers(new Map()); // Clear typing state on disconnect
//         };
//     }, [auth?.token, auth?.user?.id, updateUnreadCount]);

//     useEffect(() => {
//         fetchInitialData();
//         const cleanup = connectWebSocket();
//         return cleanup;
//     }, [fetchInitialData, connectWebSocket]);

//     const sendPrivateMessage = (toId, content) => {
//         if (!ws || ws.readyState !== WebSocket.OPEN) {
//             console.error('WebSocket not connected');
//             return;
//         }

//         const tempMessage = {
//             _id: `temp-${Date.now()}`,
//             from: {
//                 _id: auth.user.id,
//                 name: auth.user.name,
//                 superAdminPhoto: auth.user.superAdminPhoto || null,
//             },
//             content,
//             timestamp: new Date().toISOString(),
//             read: true,
//         };

//         const chatKey = [auth.user.id, toId].sort().join('-');
//         setPrivateChats(prev => {
//             const updated = new Map(prev);
//             const existingMessages = updated.get(chatKey) || [];
//             updated.set(chatKey, [...existingMessages, tempMessage]);
//             return updated;
//         });

//         ws.send(JSON.stringify({ type: 'PRIVATE_MESSAGE', toUserId: toId, content }));
//     };

//     const sendGroupMessage = (groupId, content) => {
//         if (!ws || ws.readyState !== WebSocket.OPEN) {
//             console.error('WebSocket not connected');
//             return;
//         }

//         const tempMessage = {
//             _id: `temp-${Date.now()}`,
//             from: {
//                 _id: auth.user.id,
//                 name: auth.user.name,
//                 superAdminPhoto: auth.user.superAdminPhoto || null,
//             },
//             content,
//             timestamp: new Date().toISOString(),
//             read: true,
//         };

//         setGroupChats(prev => {
//             const updated = new Map(prev);
//             const existingMessages = updated.get(groupId) || [];
//             updated.set(groupId, [...existingMessages, tempMessage]);
//             return updated;
//         });

//         ws.send(JSON.stringify({ type: 'GROUP_MESSAGE', groupId, content }));
//     };

//     const createGroup = async (name, members) => {
//         try {
//             const response = await api.post('/api/v1/chat/group/create', { name, members });
//             setGroups(prev => [...prev, response.data.group]);
//         } catch (err) {
//             console.error('Failed to create group:', err);
//             throw err;
//         }
//     };

//     const sendTypingEvent = (chatId, chatType) => {
//         if (!ws || ws.readyState !== WebSocket.OPEN) {
//             console.error('WebSocket not connected');
//             return;
//         }
//         ws.send(JSON.stringify({ type: 'TYPING', chatId, chatType, userId: auth.user.id }));
//     };

//     const value = {
//         privateChats,
//         groupChats,
//         users,
//         groups,
//         unreadCounts,
//         onlineUsers,
//         typingUsers,
//         sendPrivateMessage,
//         sendGroupMessage,
//         createGroup,
//         fetchPrivateChatHistory,
//         fetchGroupChatHistory,
//         sendTypingEvent,
//     };

//     return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
// };

// export const useChat = () => {
//     const context = useContext(ChatContext);
//     if (!context) throw new Error('useChat must be used within a ChatProvider');
//     return context;
// };



// const WebSocket = require('ws');
// const jwt = require('jsonwebtoken');
// const { ConversationModel, GroupModel } = require('../models/newModel/chatModel');
// const AdminModel = require('../models/newModel/adminModel');
// const SuperAdminModel = require('../models/newModel/superAdminModel');
// require('dotenv').config();

// class WebSocketService {
//     constructor() {
//         this.clients = new Map(); // userId: WebSocket
//     }

//     initialize(server) {
//         this.wss = new WebSocket.Server({ server });

//         this.wss.on('connection', async (ws, req) => {
//             try {
//                 const url = new URL(req.url, process.env.WS_URL || 'ws://localhost');
//                 // console.log(url)
//                 const token = url.searchParams.get('token');

//                 if (!token) throw new Error('No token provided');

//                 const decoded = jwt.verify(token, process.env.SECRET_KEY);
//                 const userId = decoded._id.toString();
//                 const userRole = decoded.role;

//                 this.clients.set(userId, ws);

//                 const onlineUsers = Array.from(this.clients.keys());
//                 this.sendToClient(ws, { type: 'ONLINE_USERS', users: onlineUsers });

//                 this.broadcast({ type: 'USER_ONLINE', userId }, userId);

//                 ws.on('message', async (message) => {
//                     try {
//                         const data = JSON.parse(message.toString());
//                         await this.handleMessage(data, userId, userRole);
//                     } catch (error) {
//                         console.error(`Error processing message from ${userId}:`, error);
//                         this.sendToClient(ws, { type: 'ERROR', message: 'Invalid message format' });
//                     }
//                 });

//                 ws.on('close', () => {
//                     this.clients.delete(userId);
//                     this.broadcast({ type: 'USER_OFFLINE', userId }, userId);
//                     console.log(`WebSocket disconnected: ${userId}`);
//                 });

//                 ws.on('error', (error) => {
//                     console.error(`WebSocket error for ${userId}:`, error);
//                 });

//                 this.sendToClient(ws, { type: 'CONNECTED', userId });
//                 console.log(`WebSocket connected: ${userId}`);
//             } catch (error) {
//                 console.error('WebSocket connection error:', error.message);
//                 ws.close(1008, 'Authentication failed');
//             }
//         });
//     }

//     sendToClient(ws, message) {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify(message));
//         }
//     }

//     broadcast(message, excludeUserId) {
//         const messageString = JSON.stringify(message);
//         for (const [userId, client] of this.clients) {
//             if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
//                 client.send(messageString);
//             }
//         }
//     }

//     async handleMessage(data, senderId, senderRole) {
//         const Model = senderRole === 'superadmin' ? SuperAdminModel : AdminModel;

//         if (!Model) {
//             console.error('Invalid sender role:', senderRole);
//             return;
//         }

//         try {
//             switch (data.type) {
//                 case 'PRIVATE_MESSAGE':
//                     await this.handlePrivateMessage(senderId, data.toUserId, data.content, Model);
//                     break;
//                 case 'GROUP_MESSAGE':
//                     await this.handleGroupMessage(senderId, data.groupId, data.content, Model);
//                     break;
//                 case 'USER_ONLINE':
//                     this.broadcast({ type: 'USER_ONLINE', userId: senderId }, senderId);
//                     break;
//                 case 'TYPING':
//                     await this.handleTyping(senderId, data.chatId, data.chatType);
//                     break;
//                 default:
//                     console.warn('Unknown message type:', data.type);
//             }
//         } catch (error) {
//             console.error('Error handling WebSocket message:', error);
//         }
//     }

//     async handlePrivateMessage(fromId, toId, content, FromModel) {
//         if (!toId || !content) return;

//         try {
//             const participants = [fromId, toId].sort();
//             let conversation = await ConversationModel.findOne({ participants });

//             if (!conversation) {
//                 conversation = new ConversationModel({ participants });
//             }

//             const message = {
//                 from: fromId,
//                 content,
//                 timestamp: new Date(),
//                 read: this.clients.has(toId),
//             };

//             conversation.messages.push(message);
//             conversation.lastUpdated = new Date();
//             const savedConversation = await conversation.save();

//             const newMessage = savedConversation.messages[savedConversation.messages.length - 1];
//             const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();

//             const populatedMessage = {
//                 _id: newMessage._id.toString(),
//                 from: { _id: fromId, name: sender.name, superAdminPhoto: sender.superAdminPhoto || null },
//                 content: newMessage.content,
//                 timestamp: newMessage.timestamp.toISOString(),
//                 read: newMessage.read,
//             };

//             [fromId, toId].forEach(userId => {
//                 const ws = this.clients.get(userId);
//                 if (ws) {
//                     this.sendToClient(ws, {
//                         type: 'PRIVATE_MESSAGE',
//                         conversationId: savedConversation._id.toString(),
//                         message: populatedMessage,
//                     });
//                 }
//             });
//         } catch (error) {
//             console.error('Error handling private message:', error);
//         }
//     }

//     async handleGroupMessage(fromId, groupId, content, FromModel) {
//         if (!groupId || !content) return;

//         try {
//             const group = await GroupModel.findById(groupId);
//             if (!group || !group.members.map(m => m.toString()).includes(fromId)) {
//                 console.warn(`User ${fromId} not in group ${groupId}`);
//                 return;
//             }

//             const message = {
//                 from: fromId,
//                 content,
//                 timestamp: new Date(),
//                 read: false,
//             };

//             group.messages.push(message);
//             group.lastUpdated = new Date();
//             const savedGroup = await group.save();

//             const newMessage = savedGroup.messages[savedGroup.messages.length - 1];
//             const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();

//             const populatedMessage = {
//                 _id: newMessage._id.toString(),
//                 from: { _id: fromId, name: sender.name, superAdminPhoto: sender.superAdminPhoto || null },
//                 content: newMessage.content,
//                 timestamp: newMessage.timestamp.toISOString(),
//                 read: newMessage.read,
//             };

//             group.members.forEach(userId => {
//                 const ws = this.clients.get(userId.toString());
//                 if (ws) {
//                     this.sendToClient(ws, {
//                         type: 'GROUP_MESSAGE',
//                         groupId,
//                         message: populatedMessage,
//                     });
//                 }
//             });
//         } catch (error) {
//             console.error('Error handling group message:', error);
//         }
//     }

//     async handleTyping(senderId, chatId, chatType) {
//         try {
//             if (!chatId || !chatType) {
//                 console.warn(`Invalid TYPING event: senderId=${senderId}, chatId=${chatId}, chatType=${chatType}`);
//                 return;
//             }
//             console.log(`Processing TYPING: senderId=${senderId}, chatId=${chatId}, chatType=${chatType}`);
//             if (chatType === 'private') {
//                 const participants = chatId.split('-');
//                 const recipientId = participants.find(id => id !== senderId);
//                 if (!recipientId) {
//                     console.warn(`Invalid private chatId format: ${chatId}`);
//                     return;
//                 }
//                 const ws = this.clients.get(recipientId);
//                 if (ws) {
//                     this.sendToClient(ws, { type: 'TYPING', chatId, chatType, userId: senderId });
//                 } else {
//                     console.log(`Recipient ${recipientId} not connected`);
//                 }
//             } else if (chatType === 'group') {
//                 const group = await GroupModel.findById(chatId);
//                 if (!group) {
//                     console.warn(`Group not found: ${chatId}`);
//                     return;
//                 }
//                 group.members.forEach(userId => {
//                     if (userId.toString() !== senderId) {
//                         const ws = this.clients.get(userId.toString());
//                         if (ws) {
//                             this.sendToClient(ws, { type: 'TYPING', chatId, chatType, userId: senderId });
//                         }
//                     }
//                 });
//             } else {
//                 console.warn(`Unsupported chatType: ${chatType}`);
//             }
//         } catch (error) {
//             console.error(`Error in handleTyping for senderId=${senderId}:`, error.message);
//         }
//     }
// }

// module.exports = new WebSocketService();


// // call this api to find  all client '/api/v1/client/getClient',




// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   from: { type: mongoose.Schema.Types.ObjectId, required: true },
//   content: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
//   read: { type: Boolean, default: false },
// });

// const conversationSchema = new mongoose.Schema({
//   participants: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
//   messages: [messageSchema],
//   lastUpdated: { type: Date, default: Date.now },
// });

// const groupSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   members: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
//   createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
//   messages: [messageSchema],
//   createdAt: { type: Date, default: Date.now },
//   lastUpdated: { type: Date, default: Date.now },
// });

// const ConversationModel = mongoose.model('ConversationModel', conversationSchema);
// const GroupModel = mongoose.model('GroupModel', groupSchema);

// module.exports = { ConversationModel, GroupModel };





// const express = require('express');
// const router = express.Router();
// const chatController = require('../../controllers/chatController');
// const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

// router.post('/history/private', requireLogin, chatController.getPrivateChatHistory);
// router.post('/history/group', requireLogin, chatController.getGroupChatHistory);
// router.post('/group/create', requireLogin, chatController.createGroup);
// router.get('/group/list', requireLogin, chatController.getGroupList);
// router.post('/markAsRead', requireLogin, chatController.markMessagesAsRead);

// module.exports = router;





// const AdminModel = require('../models/newModel/adminModel');
// const SuperAdminModel = require('../models/newModel/superAdminModel');
// const { ConversationModel, GroupModel } = require('../models/newModel/chatModel');
// const webSocketService = require('../config/webSocketService');

// const getPrivateChatHistory = async (req, res) => {
//   const { otherUserId } = req.body;
//   const userId = req.user._id;
//   const userRole = req.user.role;

//   try {
//     const participants = [userId, otherUserId].sort();
//     const conversation = await ConversationModel.findOne({ participants })
//       .populate({
//         path: 'messages.from',
//         select: 'name superAdminPhoto',
//         model: userRole === 'superadmin' ? SuperAdminModel : AdminModel,
//       })
//       .lean();

//     res.json({ success: true, messages: conversation?.messages || [] });
//   } catch (error) {
//     console.error('Error fetching private chat history:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
//   }
// };

// const getGroupChatHistory = async (req, res) => {
//   const { groupId } = req.body;
//   const userId = req.user._id;
//   const userRole = req.user.role;

//   try {
//     const group = await GroupModel.findById(groupId)
//       .populate({
//         path: 'messages.from',
//         select: 'name superAdminPhoto',
//         model: userRole === 'superadmin' ? SuperAdminModel : AdminModel,
//       })
//       .lean();

//     if (!group) {
//       return res.status(404).json({ success: false, error: 'Group not found' });
//     }

//     if (!group.members.includes(userId)) {
//       return res.status(403).json({ success: false, error: 'Not authorized to view this group' });
//     }

//     res.json({ success: true, messages: group.messages });
//   } catch (error) {
//     console.error('Error fetching group chat history:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch group chat history' });
//   }
// };

// const markMessagesAsRead = async (req, res) => {
//   const { chatId, isGroup } = req.body;
//   const userId = req.user._id;

//   try {
//     if (isGroup) {
//       const group = await GroupModel.findById(chatId);
//       if (!group || !group.members.includes(userId)) {
//         return res.status(403).json({ success: false, error: 'Not authorized' });
//       }

//       group.messages = group.messages.map(msg => ({
//         ...msg,
//         read: msg.from.toString() !== userId ? true : msg.read,
//       }));
//       await group.save();
//     } else {
//       const participants = [userId, chatId].sort();
//       const conversation = await ConversationModel.findOne({ participants });

//       if (!conversation) {
//         return res.status(404).json({ success: false, error: 'Conversation not found' });
//       }

//       conversation.messages = conversation.messages.map(msg => ({
//         ...msg,
//         read: msg.from.toString() !== userId ? true : msg.read,
//       }));
//       await conversation.save();
//     }

//     res.json({ success: true });
//   } catch (error) {
//     console.error('Error marking messages as read:', error);
//     res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
//   }
// };

// const createGroup = async (req, res) => {
//   const { name, members } = req.body;
//   const createdBy = req.user._id;
//   const userRole = req.user.role;  // Add this line

//   if (!name || !members || !Array.isArray(members)) {
//     return res.status(400).json({ success: false, error: 'Name and members are required' });
//   }

//   try {
//     const group = new GroupModel({
//       name,
//       members: [...new Set([...members, createdBy])],
//       createdBy,
//     });

//     await group.save();

//     const FromModel = userRole === 'superadmin' ? SuperAdminModel : AdminModel;  // Use userRole
//     const creator = await FromModel.findById(createdBy).select('name').lean();

//     group.members.forEach(userId => {
//       const ws = webSocketService.clients.get(userId.toString());
//       if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({
//           type: 'GROUP_CREATED',
//           group: { _id: group._id, name: group.name },
//           createdBy: createdBy,
//           createdByName: creator.name,
//         }));
//       }
//     });

//     res.status(201).json({ success: true, group });
//   } catch (error) {
//     console.error('Error creating group:', error);
//     res.status(500).json({ success: false, error: 'Failed to create group' });
//   }
// };

// const getGroupList = async (req, res) => {
//   const userId = req.user._id;

//   try {
//     const groups = await GroupModel.find({ members: userId })
//       .select('name _id lastUpdated')
//       .lean();
//     res.json({ success: true, groups });
//   } catch (error) {
//     console.error('Error fetching group list:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch group list' });
//   }
// };

// module.exports = {
//   getPrivateChatHistory,
//   getGroupChatHistory,
//   createGroup,
//   getGroupList,
//   markMessagesAsRead,
// };




// lets assume we have a three admin ram, sunil , anil and our client is mohan so in our team we chat each other like ram chat with anil sunil or vice versa as an admin
// but what if any client chat with us then show to handle this mohan send msg hy, then how to hanlde this who can reply this ,
//my apporach is like we create a tabs for clients and admin in admin tabs each admin including superadmin can chat each other and in client tabs show the client coming msg like mohan msg hy, 
// and make in client chat section show the name and profilephoto who can reply those mohan msg if you have any btter approch the apply