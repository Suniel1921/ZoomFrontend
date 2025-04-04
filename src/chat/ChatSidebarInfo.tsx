import React, { useState } from "react";
import { Bell, Download, Settings } from "lucide-react";

interface ChatSidebarInfoProps {
  selectedData: User | Client | undefined;
  selectedChat: { type: "private" | "client" | null; id: string | null };
  onlineUsers: Set<string>;
  currentMessages: Message[];
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

interface Message {
  _id: string;
  from: { _id: string; name: string; profilePhoto?: string };
  content: string;
  timestamp: string;
}

// Modal Component
const ProfilePhotoModal: React.FC<{ photo: string; isOpen: boolean; onClose: () => void }> = ({ photo, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="relative bg-white rounded-lg p-4 max-w-md w-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img src={photo} alt="Full Profile" className="w-full h-auto rounded-lg object-cover" />
      </div>
    </div>
  );
};

const ChatSidebarInfo: React.FC<ChatSidebarInfoProps> = ({ selectedData, selectedChat, onlineUsers, currentMessages }) => {
  const photo = selectedData?.profilePhoto || (selectedData as User)?.superAdminPhoto;
  const name = selectedData?.name || selectedData?.fullName || "Unknown";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePhotoClick = () => {
    if (photo) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-[280px] border-l border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-center">Chat Information</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex flex-col items-center">
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover mb-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handlePhotoClick}
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-full ${
                selectedChat.type === "private" ? "bg-blue-100" : "bg-purple-100"
              } flex items-center justify-center text-2xl font-semibold ${
                selectedChat.type === "private" ? "text-blue-600" : "text-purple-600"
              } mb-2`}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className="text-lg font-semibold">{name}</h3>
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

      {/* Modal for full-size profile photo */}
      {photo && (
        <ProfilePhotoModal
          photo={photo}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ChatSidebarInfo;