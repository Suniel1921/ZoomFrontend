import React from "react";
import { MessageSquare, Check } from "lucide-react";

interface ChatMessagesProps {
  auth: any;
  currentMessages: Message[];
  isTyping: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ auth, currentMessages, isTyping, chatEndRef }) => {
  return (
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
              const isOwnMessage = msg.from._id === auth.user.id;
              const date = new Date(msg.timestamp);
              const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const showDateSeparator =
                index === 0 ||
                new Date(currentMessages[index - 1].timestamp).toDateString() !== date.toDateString();

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
              );
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
  );
};

export default ChatMessages;