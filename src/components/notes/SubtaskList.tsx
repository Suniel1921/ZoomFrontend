import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../Button';
import Input from '../Input';
import type { Subtask } from '../../types/note';

interface SubtaskListProps {
  subtasks?: Subtask[]; // Make subtasks optional
  onAddSubtask: (content: string) => void;
  onToggleSubtask: (id: string) => void;
  onRemoveSubtask: (id: string) => void;
  onUpdateSubtask: (id: string, content: string) => void;
}

export default function SubtaskList({
  subtasks = [], // Provide default empty array
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onUpdateSubtask,
}: SubtaskListProps) {
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(newSubtask.trim());
      setNewSubtask('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add new subtask..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSubtask();
            }
          }}
        />
        <Button onClick={handleAddSubtask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {subtasks.map((subtask) => (
        <div key={subtask.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={subtask.completed}
            onChange={() => onToggleSubtask(subtask.id)}
            className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
          />
          <Input
            value={subtask.content}
            onChange={(e) => onUpdateSubtask(subtask.id, e.target.value)}
            className={subtask.completed ? 'line-through text-gray-500' : ''}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemoveSubtask(subtask.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}