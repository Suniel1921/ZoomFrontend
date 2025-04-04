import React from "react";
import { Phone, Video, Info, MoreHorizontal } from "lucide-react";

interface ChatHeaderProps {
  selectedData: User | Client | undefined;
  selectedChat: { type: "private" | "client" | null; id: string | null };
  onlineUsers: Set<string>;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

interface User {
  _id: string;
  name?: string;
  fullName?: string;
  role?: string;
  profilePhoto?: string;
  superAdminPhoto?: string;
}

interface Client {
  _id: string;
  fullName?: string;
  profilePhoto?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedData, selectedChat, onlineUsers, showSidebar, setShowSidebar }) => {
  const photo = selectedData?.profilePhoto || (selectedData as User)?.superAdminPhoto;
  const name = selectedData?.name || selectedData?.fullName || "Unknown";

  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
      <div className="flex items-center">
        {photo ? (
          <img src={photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-600">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="ml-3">
          <div className="font-medium">{name}</div>
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
  );
};

export default ChatHeader;