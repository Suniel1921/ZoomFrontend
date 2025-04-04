import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { useChat } from "../context/ChatWithTeamContext";
import { useAuthGlobally } from "../context/AuthContext";
import ChatSidebar from "./ChatSidebar";
import ChatList from "./ChatList";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatSidebarInfo from "./ChatSidebarInfo";
import ChatInput from "./ChatInput";

interface SelectedChat {
  type: "private" | "client" | null;
  id: string | null;
}

interface User {
  _id: string;
  name: string;
  role?: string;
  profilePhoto?: string;
  superAdminPhoto?: string;
}

interface Client {
  _id: string;
  fullName?: string;
  profilePhoto?: string;
}

interface Message {
  _id: string;
  from: { _id: string; name: string; profilePhoto?: string };
  content: string;
  timestamp: string;
  read?: boolean;
}

const Chat: React.FC = () => {
  const {
    privateChats = new Map<string, Message[]>(),
    clientChats = new Map<string, Message[]>(),
    users = [],
    clients = [],
    unreadCounts = new Map(),
    onlineUsers = new Set(),
    typingUsers = new Map(),
    sendPrivateMessage = () => {},
    sendClientMessage = () => {},
    fetchPrivateChatHistory = async () => {},
    fetchClientChatHistory = async () => {},
    sendTypingEvent = () => {},
    markMessagesAsRead = () => {},
  } = useChat() || {};

  const [auth] = useAuthGlobally();
  const [selectedChat, setSelectedChat] = useState<SelectedChat>({ type: null, id: null });
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "clients">("inbox");
  const [showSidebar, setShowSidebar] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!selectedChat.id || !auth?.user?.id) return;

    const fetchChat = async () => {
      try {
        if (selectedChat.type === "private") {
          await fetchPrivateChatHistory(selectedChat.id);
          const chatId = [auth.user.id, selectedChat.id].sort().join("-");
          markMessagesAsRead(chatId, "private");
        } else if (selectedChat.type === "client") {
          await fetchClientChatHistory(selectedChat.id);
          markMessagesAsRead(selectedChat.id, "client");
        }
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };
    fetchChat();
  }, [selectedChat, auth?.user?.id, fetchPrivateChatHistory, fetchClientChatHistory, markMessagesAsRead, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [privateChats, clientChats, selectedChat, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !selectedChat.id || !auth?.user?.id) return;

    if (selectedChat.type === "private") {
      sendPrivateMessage(selectedChat.id, message);
    } else if (selectedChat.type === "client") {
      sendClientMessage(selectedChat.id, message);
    }
    setMessage("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    inputRef.current?.focus();
  }, [message, selectedChat, sendPrivateMessage, sendClientMessage, auth?.user?.id]);

  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
      if (!selectedChat.id || !e.target.value || !auth?.user?.id) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        return;
      }
      const chatId =
        selectedChat.type === "private" ? [auth.user.id, selectedChat.id].sort().join("-") : selectedChat.id;
      sendTypingEvent(chatId, selectedChat.type!);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {}, 1500);
    },
    [selectedChat, auth?.user?.id, sendTypingEvent]
  );

  const filteredUsers = users.filter(
    (user: User) =>
      user._id !== auth?.user?.id &&
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        privateChats.has([auth?.user?.id, user._id].sort().join("-")))
  );

  const filteredClients = clients.filter(
    (client: Client) =>
      clientChats.has(client._id) && (client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || true)
  );

  const chatKey =
    selectedChat.type === "private" ? [auth?.user?.id, selectedChat.id!].sort().join("-") : selectedChat.id!;
  const currentMessages: Message[] =
    selectedChat.type === "private" ? privateChats.get(chatKey) || [] : clientChats.get(chatKey) || [];
  const selectedData: User | Client | undefined =
    selectedChat.type === "private"
      ? users.find((u: User) => u._id === selectedChat.id)
      : clients.find((c: Client) => c._id === selectedChat.id);
  const isTyping =
    typingUsers instanceof Map &&
    typingUsers.has(`${selectedChat.type}-${chatKey}`) &&
    typingUsers.get(`${selectedChat.type}-${chatKey}`) !== auth?.user?.id;

  if (!auth?.user?.id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 mb-2"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-800">
      <ChatSidebar auth={auth} activeTab={activeTab} setActiveTab={setActiveTab} unreadCounts={unreadCounts} />
      <ChatList
        auth={auth}
        activeTab={activeTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredUsers={filteredUsers}
        filteredClients={filteredClients}
        privateChats={privateChats}
        clientChats={clientChats}
        onlineUsers={onlineUsers}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        unreadCounts={unreadCounts}
      />
      <div className="flex-1 flex flex-col h-screen">
        {selectedChat.id ? (
          <div className="flex flex-col h-full">
            <ChatHeader
              selectedData={selectedData}
              selectedChat={selectedChat}
              onlineUsers={onlineUsers}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
            <div className="flex-1 flex overflow-hidden">
              <ChatMessages auth={auth} currentMessages={currentMessages} isTyping={isTyping} chatEndRef={chatEndRef} />
              {showSidebar && (
                <ChatSidebarInfo
                  selectedData={selectedData}
                  selectedChat={selectedChat}
                  onlineUsers={onlineUsers}
                  currentMessages={currentMessages}
                />
              )}
            </div>
            <ChatInput message={message} handleTyping={handleTyping} handleSend={handleSend} inputRef={inputRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                <MessageSquare size={28} />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a Chat</h2>
              <p className="text-gray-500">Choose a team member or client to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;