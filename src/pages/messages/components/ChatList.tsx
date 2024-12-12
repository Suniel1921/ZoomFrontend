import { Users } from 'lucide-react';
import type { Admin } from '../../../types/admin';

interface ChatListProps {
  chatType: 'direct' | 'group';
  currentAdmin: Admin | null;
  admins: Admin[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({
  chatType,
  currentAdmin,
  admins,
  selectedChat,
  onSelectChat,
}: ChatListProps) {
  return (
    <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium">
          {chatType === 'direct' ? 'Direct Messages' : 'Group Chats'}
        </h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        {chatType === 'direct' ? (
          <div className="divide-y divide-gray-200">
            {admins.map((admin) => (
              admin.id !== currentAdmin?.id && (
                <button
                  key={admin.id}
                  onClick={() => onSelectChat(admin.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    selectedChat === admin.id ? 'bg-brand-yellow/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {admin.profilePhoto ? (
                      <img
                        src={admin.profilePhoto}
                        alt={admin.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {admin.name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-gray-500">{admin.role}</p>
                    </div>
                  </div>
                </button>
              )
            ))}
          </div>
        ) : (
          <div className="p-4">
            <button
              onClick={() => onSelectChat('team')}
              className={`w-full p-4 rounded-lg border ${
                selectedChat === 'team' 
                  ? 'border-brand-yellow bg-brand-yellow/10' 
                  : 'border-gray-200 hover:border-brand-yellow'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-black flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">Team Chat</p>
                  <p className="text-sm text-gray-500">
                    {admins.length} members
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}