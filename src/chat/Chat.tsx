"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Send,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Image,
  Info,
  Users,
  Settings,
  Download,
  Plus,
  MessageSquare,
  Check,
  User,
} from "lucide-react"
import { useChat } from "../context/ChatWithTeamContext"
import { useAuthGlobally } from "../context/AuthContext"
import { cn } from "../lib/utils"


interface SelectedChat {
  type: "private" | "client" | null
  id: string | null
}

interface User {
  _id: string
  name: string
  role?: string
  profilePhoto?: string
}

interface Client {
  _id: string
  fullName?: string
  profilePhoto?: string
}

interface Message {
  _id: string
  from: { _id: string; name: string; profilePhoto?: string }
  content: string
  timestamp: string
  read?: boolean
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
  } = useChat() || {}

  const [auth] = useAuthGlobally()
  const [selectedChat, setSelectedChat] = useState<SelectedChat>({ type: null, id: null })
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"inbox" | "clients">("inbox")
  const [showSidebar, setShowSidebar] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (!selectedChat.id || !auth?.user?.id) return

    const fetchChat = async () => {
      try {
        if (selectedChat.type === "private") {
          await fetchPrivateChatHistory(selectedChat.id)
          const chatId = [auth.user.id, selectedChat.id].sort().join("-")
          markMessagesAsRead(chatId, "private")
        } else if (selectedChat.type === "client") {
          await fetchClientChatHistory(selectedChat.id)
          markMessagesAsRead(selectedChat.id, "client")
        }
        scrollToBottom()
      } catch (error) {
        console.error("Error fetching chat:", error)
      }
    }
    fetchChat()
  }, [selectedChat, auth?.user?.id, fetchPrivateChatHistory, fetchClientChatHistory, markMessagesAsRead, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [privateChats, clientChats, selectedChat, scrollToBottom])

  const handleSend = useCallback(() => {
    if (!message.trim() || !selectedChat.id || !auth?.user?.id) return
    
    if (selectedChat.type === "private") {
      sendPrivateMessage(selectedChat.id, message)
    } else if (selectedChat.type === "client") {
      sendClientMessage(selectedChat.id, message)
    }
    setMessage("")
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    inputRef.current?.focus()
  }, [message, selectedChat, sendPrivateMessage, sendClientMessage, auth?.user?.id])

  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value)
      if (!selectedChat.id || !e.target.value || !auth?.user?.id) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        return
      }
      const chatId =
        selectedChat.type === "private" ? [auth.user.id, selectedChat.id].sort().join("-") : selectedChat.id
      sendTypingEvent(chatId, selectedChat.type!)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {}, 1500)
    },
    [selectedChat, auth?.user?.id, sendTypingEvent]
  )

  const filteredUsers = users.filter((user: User) => 
    user._id !== auth?.user?.id && 
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    privateChats.has([auth?.user?.id, user._id].sort().join("-")))
  )
  
  const filteredClients = clients.filter((client: Client) =>
    clientChats.has(client._id) &&
    (client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || true)
  )

  const chatKey = selectedChat.type === "private" 
    ? [auth?.user?.id, selectedChat.id!].sort().join("-") 
    : selectedChat.id!
  const currentMessages: Message[] =
    selectedChat.type === "private" 
      ? privateChats.get(chatKey) || [] 
      : clientChats.get(chatKey) || []
  const selectedData: User | Client | undefined =
    selectedChat.type === "private"
      ? users.find((u: User) => u._id === selectedChat.id)
      : clients.find((c: Client) => c._id === selectedChat.id)
  const isTyping =
    typingUsers instanceof Map &&
    typingUsers.has(`${selectedChat.type}-${chatKey}`) &&
    typingUsers.get(`${selectedChat.type}-${chatKey}`) !== auth?.user?.id

  if (!auth?.user?.id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 mb-2"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white text-gray-800 overflow-hidden">
      {/* Left Sidebar - Navigation */}
      <div className="w-[80px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col items-center py-4">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {auth.user.profilePhoto ? (
              <img src={auth.user.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-gray-600">
                {auth.user.name ? auth.user.name.charAt(0) : "U"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6 flex-1">
          <button
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              activeTab === "inbox" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"
            )}
            onClick={() => setActiveTab("inbox")}
          >
            <div className="relative">
              <Users size={22} />
              {unreadCounts.size > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                  {Array.from(unreadCounts.values()).reduce((a: number, b: number) => a + b, 0)}
                </span>
              )}
            </div>
          </button>

          <button
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              activeTab === "clients" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"
            )}
            onClick={() => setActiveTab("clients")}
          >
            <User size={22} />
          </button>
        </div>

        <div className="mt-auto">
          <button className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100">
            <Settings size={22} />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder={activeTab === "inbox" ? "Search team..." : "Search clients..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3">{activeTab === "inbox" ? "Team" : "Clients"}</h2>

            <div className="space-y-3">
              {activeTab === "inbox" && filteredUsers.map((user: User) => {
                const chatId = [auth.user.id, user._id].sort().join("-")
                const lastMessage = privateChats.get(chatId)?.slice(-1)[0]
                
                return (
                  <div
                    key={user._id}
                    onClick={() => setSelectedChat({ type: "private", id: user._id })}
                    className={cn(
                      "flex items-center p-3 rounded-xl cursor-pointer",
                      selectedChat.type === "private" && selectedChat.id === user._id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="relative">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-600">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      {onlineUsers.has(user._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-start">
                        <span className="font-medium truncate">{user.name || "Unknown User"}</span>
                        <span className="text-xs text-gray-500">
                          {lastMessage?.timestamp
                            ? new Date(lastMessage.timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                              ? "Today"
                              : new Date(lastMessage.timestamp).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {lastMessage?.content || "Start a conversation"}
                      </div>
                    </div>
                    {unreadCounts.get(chatId) > 0 && (
                      <span className="ml-2 bg-blue-500 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 text-xs">
                        {unreadCounts.get(chatId)}
                      </span>
                    )}
                  </div>
                )
              })}

              {activeTab === "clients" && filteredClients.map((client: Client) => {
                const lastMessage = clientChats.get(client._id)?.slice(-1)[0]
                
                return (
                  <div
                    key={client._id}
                    onClick={() => setSelectedChat({ type: "client", id: client._id })}
                    className={cn(
                      "flex items-center p-3 rounded-xl cursor-pointer",
                      selectedChat.type === "client" && selectedChat.id === client._id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    )}
                  >
                    {client.profilePhoto ? (
                      <img src={client.profilePhoto} alt={client.fullName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-lg font-semibold text-purple-600">
                        {client.fullName ? client.fullName.charAt(0).toUpperCase() : "C"}
                      </div>
                    )}
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-start">
                        <span className="font-medium truncate">{client.fullName || "Unknown Client"}</span>
                        <span className="text-xs text-gray-500">
                          {lastMessage?.timestamp
                            ? new Date(lastMessage.timestamp).toLocaleDateString() === new Date().toLocaleDateString()
                              ? "Today"
                              : new Date(lastMessage.timestamp).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {lastMessage?.content || "Start a conversation"}
                      </div>
                    </div>
                    {unreadCounts.get(client._id) > 0 && (
                      <span className="ml-2 bg-blue-500 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 text-xs">
                        {unreadCounts.get(client._id)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center">
            <Plus size={18} className="mr-2" />
            Create New Group
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat.id ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                {selectedData?.profilePhoto ? (
                  <img src={selectedData.profilePhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-600">
                    {(selectedData?.name || selectedData?.fullName) 
                      ? (selectedData.name || selectedData.fullName).charAt(0).toUpperCase() 
                      : "U"}
                  </div>
                )}
                <div className="ml-3">
                  <div className="font-medium">{selectedData?.name || selectedData?.fullName || "Unknown"}</div>
                  {selectedChat.type === "private" && (
                    <div className="text-xs text-gray-500">
                      {(selectedData as User)?.role === "superadmin" ? "Super Admin" : "Admin"} •{" "}
                      {onlineUsers.has(selectedData?._id || "") ? (
                        <span className="text-green-400">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Video size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setShowSidebar(!showSidebar)}>
                  <Info size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreHorizontal size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex">
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                  {currentMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 py-20">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                          <MessageSquare size={28} />
                        </div>
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentMessages.map((msg: Message, index: number) => {
                        const isOwnMessage = msg.from._id === auth.user.id
                        const date = new Date(msg.timestamp)
                        const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        const showDateSeparator =
                          index === 0 ||
                          new Date(currentMessages[index - 1].timestamp).toDateString() !== date.toDateString()

                        return (
                          <React.Fragment key={msg._id}>
                            {showDateSeparator && (
                              <div className="text-center text-sm text-gray-500 mb-6 mt-4">
                                {date.toDateString() === new Date().toDateString()
                                  ? "Today"
                                  : date.toLocaleDateString(undefined, {
                                      weekday: "long",
                                      month: "short",
                                      day: "numeric",
                                    })}
                              </div>
                            )}

                            {isOwnMessage ? (
                              <div className="mb-6">
                                <div className="bg-blue-500 text-white p-3 rounded-lg shadow-sm inline-block max-w-md ml-auto">
                                  <p>{msg.content}</p>
                                  <div className="flex items-center justify-end mt-1 text-xs text-blue-100">
                                    {formattedTime}
                                    {msg.read && (
                                      <span className="ml-1">
                                        <Check size={12} />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mb-6">
                                <div className="flex items-start mb-1">
                                  {msg.from.profilePhoto ? (
                                    <img src={msg.from.profilePhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mr-3" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 mr-3 flex items-center justify-center text-sm font-semibold text-blue-600">
                                      {msg.from.name ? msg.from.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="bg-white p-3 rounded-lg shadow-sm inline-block max-w-md">
                                      <p className="text-gray-800">{msg.content}</p>
                                      <div className="flex items-center justify-end mt-1 text-xs text-gray-400">
                                        {formattedTime}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        )
                      })}
                      {isTyping && (
                        <div className="mb-6">
                          <div className="flex items-start mb-1">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 mr-3"></div>
                            <div className="flex-1">
                              <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                                <div className="flex items-center gap-1">
                                  <span className="animate-bounce delay-0 h-1.5 w-1.5 bg-gray-400 rounded-full"></span>
                                  <span className="animate-bounce delay-150 h-1.5 w-1.5 bg-gray-400 rounded-full"></span>
                                  <span className="animate-bounce delay-300 h-1.5 w-1.5 bg-gray-400 rounded-full"></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {showSidebar && (
                <div className="w-[280px] border-l border-gray-200 bg-white flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-center">Chat Information</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 flex flex-col items-center">
                      {selectedData?.profilePhoto ? (
                        <img src={selectedData.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover mb-2" />
                      ) : (
                        <div
                          className={`w-16 h-16 rounded-full ${
                            selectedChat.type === "private" ? "bg-blue-100" : "bg-purple-100"
                          } flex items-center justify-center text-2xl font-semibold ${
                            selectedChat.type === "private" ? "text-blue-600" : "text-purple-600"
                          } mb-2`}
                        >
                          {(selectedData?.name || selectedData?.fullName) 
                            ? (selectedData.name || selectedData.fullName).charAt(0).toUpperCase() 
                            : "U"}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold">{selectedData?.name || selectedData?.fullName || "Unknown"}</h3>
                      {selectedChat.type === "private" && (
                        <div className="text-sm text-gray-500 mt-1">
                          {(selectedData as User)?.role === "superadmin" ? "Super Admin" : "Admin"} •{" "}
                          {onlineUsers.has(selectedData?._id || "") ? (
                            <span className="text-green-400">Online</span>
                          ) : (
                            "Offline"
                          )}
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2 flex justify-around border-b border-gray-200">
                      <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                          <Bell size={18} />
                        </div>
                        <span className="text-xs">Notification</span>
                      </button>
                      <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                          <Download size={18} />
                        </div>
                        <span className="text-xs">Pin Chat</span>
                      </button>
                      <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                          <Settings size={18} />
                        </div>
                        <span className="text-xs">Setting</span>
                      </button>
                    </div>

                    {currentMessages.length > 0 && (
                      <>
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Shared Files</h4>
                          </div>
                          <div className="text-sm text-gray-500 text-center py-2">No files shared yet</div>
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Shared Links</h4>
                          </div>
                          <div className="text-sm text-gray-500 text-center py-2">No links shared yet</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="flex items-center space-x-2 mr-3">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Paperclip size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Image size={20} className="text-gray-600" />
                  </button>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={cn(
                    "ml-3 p-2 rounded-full",
                    message.trim() ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-400"
                  )}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
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
  )
}

const Bell = ({ size = 24, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
    </svg>
  )
}

export default Chat