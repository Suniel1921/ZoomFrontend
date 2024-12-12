import { Send, Users } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import type { Admin } from '../../../types/admin';
import type { Message } from '../../../store/messageStore';

interface ChatWindowProps {
  selectedChat: string | null;
  chatType: 'direct' | 'group';
  currentAdmin: Admin | null;
  selectedAdmin: Admin | null;
  admins: Admin[];
  messages: Message[];
  newMessage: string;
  onNewMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function ChatWindow({
  selectedChat,
  chatType,
  currentAdmin,
  selectedAdmin,
  admins,
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  messagesEndRef,
}: ChatWindowProps) {
  if (!selectedChat) {
    return (
      <div className="col-span-9 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="col-span-9 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {chatType === 'direct' ? (
            <>
              {selectedAdmin?.profilePhoto ? (
                <img
                  src={selectedAdmin.profilePhoto}
                  alt={selectedAdmin.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {selectedAdmin?.name[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">{selectedAdmin?.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedAdmin?.role}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-brand-black flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Team Chat</p>
                <p className="text-sm text-gray-500">
                  {admins.length} members
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentAdmin?.id
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentAdmin?.id
                  ? 'bg-brand-yellow/10 text-brand-black'
                  : 'bg-gray-100'
              }`}
            >
              {message.senderId !== currentAdmin?.id && (
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {message.senderName}
                </p>
              )}
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={onSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}