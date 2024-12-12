import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import Button from '../Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: {
    date: string;
    time: string;
    recurring: boolean;
    recurringType?: 'daily' | 'weekly' | 'monthly';
  }) => void;
}

export default function ReminderModal({
  isOpen,
  onClose,
  onSave,
}: ReminderModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleSave = () => {
    onSave({
      date: selectedDate.toISOString(),
      time: selectedTime,
      recurring: isRecurring,
      recurringType: isRecurring ? recurringType : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Set Reminder</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <div className="mt-1 relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date as Date)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                minDate={new Date()}
                dateFormat="MMMM d, yyyy"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <div className="mt-1 relative">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
              <span className="text-sm text-gray-700">Recurring Reminder</span>
            </label>

            {isRecurring && (
              <div className="mt-2">
                <select
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Set Reminder</Button>
          </div>
        </div>
      </div>
    </div>
  );
}