import React from "react";
import { Bell, Download, Settings } from "lucide-react";

interface ChatSidebarInfoProps {
  selectedData: User | Client | undefined;
  selectedChat: { type: "private" | "client" | null; id: string | null };
  onlineUsers: Set<string>;
  currentMessages: Message[];
}

const ChatSidebarInfo: React.FC<ChatSidebarInfoProps> = ({ selectedData, selectedChat, onlineUsers, currentMessages }) => {
  return (
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
  );
};

export default ChatSidebarInfo;