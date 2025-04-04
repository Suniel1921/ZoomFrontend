import React from "react";
import { Paperclip, Image, Send } from "lucide-react";
import { cn } from "../lib/utils";

interface ChatInputProps {
  message: string;
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSend: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  replyTo?: string | null; // Optional prop for replying
  setReplyTo?: (messageId: string | null) => void; // Optional prop for setting reply
}

const ChatInput: React.FC<ChatInputProps> = ({ message, handleTyping, handleSend, inputRef, replyTo, setReplyTo }) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex flex-col">
        {replyTo && setReplyTo && (
          <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
            <span>Replying to a message</span>
            <button onClick={() => setReplyTo(null)} className="text-blue-500 hover:underline">
              Cancel
            </button>
          </div>
        )}
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
    </div>
  );
};

export default ChatInput;