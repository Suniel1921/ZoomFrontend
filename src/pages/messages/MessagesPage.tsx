import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { useMessageStore } from '../../store/messageStore';
import { useAdminStore } from '../../store/adminStore';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';

export default function MessagesPage() {
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentAdmin, admins } = useAdminStore();
  const { messages, initializeMessages, sendMessage } = useMessageStore();

  // Initialize messages only once when component mounts
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (currentAdmin) {
      cleanup = initializeMessages(currentAdmin);
    }
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [currentAdmin, initializeMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      try {
        await sendMessage(newMessage.trim(), selectedChat, chatType);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const selectedAdmin = admins?.find(admin => admin.id === selectedChat);

  const filteredMessages = messages?.filter(msg => 
    (chatType === 'direct' && 
     ((msg.senderId === currentAdmin?.id && msg.receiverId === selectedChat) ||
      (msg.senderId === selectedChat && msg.receiverId === currentAdmin?.id))) ||
    (chatType === 'group' && msg.type === 'group')
  ) || [];

  if (!currentAdmin || !admins) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={chatType === 'direct' ? 'primary' : 'outline'}
              onClick={() => setChatType('direct')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Direct Messages
            </Button>
            <Button
              variant={chatType === 'group' ? 'primary' : 'outline'}
              onClick={() => setChatType('group')}
            >
              <Users className="h-4 w-4 mr-2" />
              Group Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        <ChatList
          chatType={chatType}
          currentAdmin={currentAdmin}
          admins={admins}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />

        <ChatWindow
          selectedChat={selectedChat}
          chatType={chatType}
          currentAdmin={currentAdmin}
          selectedAdmin={selectedAdmin}
          admins={admins}
          messages={filteredMessages}
          newMessage={newMessage}
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </Layout>
  );
}