import { useState } from 'react';
import { Bell, Mail, MessageSquare, Phone } from 'lucide-react';
import Button from '../../components/Button';

interface NotificationChannel {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  enabled: boolean;
}

export default function NotificationSettings() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'push',
      label: 'Push Notifications',
      description: 'Receive notifications in your browser',
      icon: Bell,
      enabled: true,
    },
    {
      id: 'sms',
      label: 'SMS Notifications',
      description: 'Receive notifications via SMS',
      icon: Phone,
      enabled: false,
    },
    {
      id: 'chat',
      label: 'In-App Chat',
      description: 'Receive notifications in the chat',
      icon: MessageSquare,
      enabled: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setChannels(channels.map(channel =>
      channel.id === id ? { ...channel, enabled: !channel.enabled } : channel
    ));
  };

  const handleSave = () => {
    // In a real app, you would save these preferences to the backend
    alert('Notification preferences saved!');
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Notification Preferences
      </h3>

      <div className="space-y-6">
        <div className="space-y-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <channel.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{channel.label}</p>
                  <p className="text-sm text-gray-500">{channel.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={channel.enabled}
                  onChange={() => handleToggle(channel.id)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-yellow/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </div>
    </div>
  );
}