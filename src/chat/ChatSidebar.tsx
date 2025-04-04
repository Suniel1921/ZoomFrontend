import React from "react";
import { Users, User, Settings } from "lucide-react";
import { cn } from "../lib/utils";

interface ChatSidebarProps {
  auth: any;
  activeTab: "inbox" | "clients";
  setActiveTab: (tab: "inbox" | "clients") => void;
  unreadCounts: Map<string, number>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ auth, activeTab, setActiveTab, unreadCounts }) => {
  return (
    <div className="w-[80px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col items-center py-4">
      <div className="mb-8">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {auth.user.profilePhoto || auth.user.superAdminPhoto ? (
            <img
              src={auth.user.profilePhoto || auth.user.superAdminPhoto}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
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
            activeTab === "inbox" ? "bg-[#fcda00]/20  text-[#fcda00]" : "text-gray-500 hover:bg-gray-100"
          )}
          onClick={() => setActiveTab("inbox")}
        >
          <div className="relative">
            <Users size={22} />
            {unreadCounts.size > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center">
                {Array.from(unreadCounts.values()).reduce((a: number, b: number) => a + b, 0)}
              </span>
            )}
          </div>
        </button>
        <button
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            activeTab === "clients" ? "bg-[#fcda00]/20  text-[#fcda00]" : "text-gray-500 hover:bg-gray-100"
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
  );
};

export default ChatSidebar;