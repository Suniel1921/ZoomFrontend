import React from "react";
import { cn } from "../lib/utils";
import { Plus } from "lucide-react";

interface ChatListProps {
  auth: any;
  activeTab: "inbox" | "clients";
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: User[];
  filteredClients: Client[];
  privateChats: Map<string, Message[]>;
  clientChats: Map<string, Message[]>;
  onlineUsers: Set<string>;
  selectedChat: { type: "private" | "client" | null; id: string | null };
  setSelectedChat: (chat: { type: "private" | "client" | null; id: string | null }) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  auth,
  activeTab,
  searchTerm,
  setSearchTerm,
  filteredUsers,
  filteredClients,
  privateChats,
  clientChats,
  onlineUsers,
  selectedChat,
  setSelectedChat,
}) => {
  return (
    <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder={activeTab === "inbox" ? "Search team..." : "Search clients..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-800 border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3">{activeTab === "inbox" ? "Team" : "Clients"}</h2>
          <div className="space-y-3">
            {activeTab === "inbox" &&
              filteredUsers.map((user) => {
                const chatId = [auth.user.id, user._id].sort().join("-");
                const lastMessage = privateChats.get(chatId)?.slice(-1)[0];
                const messageCount = privateChats.get(chatId)?.length || 0;

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
                    {messageCount > 0 && (
                      <span className="ml-2 bg-blue-500 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 text-xs">
                        {messageCount}
                      </span>
                    )}
                  </div>
                );
              })}

            {activeTab === "clients" &&
              filteredClients.map((client) => {
                const lastMessage = clientChats.get(client._id)?.slice(-1)[0];
                const messageCount = clientChats.get(client._id)?.length || 0;

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
                    {messageCount > 0 && (
                      <span className="ml-2 bg-blue-500 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 text-xs">
                        {messageCount}
                      </span>
                    )}
                  </div>
                );
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
  );
};

export default ChatList;