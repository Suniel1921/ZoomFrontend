import { format } from 'date-fns';
import { Bell, Trash2, Check } from 'lucide-react';
import type { NoteReminder } from '../../types/note';

interface ReminderListProps {
  reminders: NoteReminder[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ReminderList({ reminders, onToggle, onDelete }: ReminderListProps) {
  const formatReminderDate = (date: string, time: string) => {
    const reminderDate = new Date(date);
    return `${format(reminderDate, 'MMM d, yyyy')} at ${time}`;
  };

  const getRecurringText = (reminder: NoteReminder) => {
    if (!reminder.recurring) return '';
    switch (reminder.recurringType) {
      case 'daily':
        return 'Repeats daily';
      case 'weekly':
        return 'Repeats weekly';
      case 'monthly':
        return 'Repeats monthly';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className={`flex items-center justify-between p-2 rounded-lg ${
            reminder.completed ? 'bg-gray-100' : 'bg-brand-yellow/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggle(reminder.id)}
              className={`p-1 rounded-full ${
                reminder.completed ? 'text-gray-400' : 'text-brand-yellow'
              }`}
            >
              {reminder.completed ? (
                <Check className="h-5 w-5" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
            </button>
            <div className={reminder.completed ? 'text-gray-500' : ''}>
              <p className="font-medium">
                {formatReminderDate(reminder.date, reminder.time)}
              </p>
              {reminder.recurring && (
                <p className="text-sm text-gray-500">{getRecurringText(reminder)}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(reminder.id)}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}