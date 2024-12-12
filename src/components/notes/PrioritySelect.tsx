import { useState } from 'react';
import { Flag } from 'lucide-react';
import type { NotePriority } from '../../types/note';

interface PrioritySelectProps {
  value: NotePriority;
  onChange: (priority: NotePriority) => void;
}

const priorities: { value: NotePriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500 text-white' },
  { value: 'high', label: 'High', color: 'bg-orange-500 text-white' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500 text-black' },
  { value: 'low', label: 'Low', color: 'bg-green-500 text-white' },
];

export default function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentPriority = priorities.find(p => p.value === value) || priorities[2];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentPriority.color}`}
      >
        <Flag className="h-4 w-4 mr-1" />
        {currentPriority.label}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
          {priorities.map((priority) => (
            <button
              key={priority.value}
              type="button"
              onClick={() => {
                onChange(priority.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                value === priority.value ? 'bg-gray-50' : ''
              }`}
            >
              <span className={`inline-flex items-center ${priority.color} px-2 py-0.5 rounded-full text-xs`}>
                <Flag className="h-3 w-3 mr-1" />
                {priority.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}