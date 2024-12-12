import { Trash2 } from 'lucide-react';
import type { Todo } from './TodoList';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<Todo>) => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onRemove,
  onUpdate,
}: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
        className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
      />
      
      <input
        type="text"
        value={todo.task}
        onChange={(e) => onUpdate({ task: e.target.value })}
        className={`flex-1 bg-transparent border-none focus:ring-0 ${
          todo.completed ? 'line-through text-gray-500' : ''
        }`}
      />

      <select
        value={todo.priority}
        onChange={(e) => onUpdate({ priority: e.target.value as Todo['priority'] })}
        className="rounded-md border-gray-300 text-sm focus:border-brand-yellow focus:ring-brand-yellow"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      {todo.dueDate && (
        <input
          type="date"
          value={todo.dueDate.toISOString().split('T')[0]}
          onChange={(e) => onUpdate({ dueDate: new Date(e.target.value) })}
          className="rounded-md border-gray-300 text-sm focus:border-brand-yellow focus:ring-brand-yellow"
        />
      )}

      <button
        type="button" // Explicitly set button type to prevent form submission
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission
          onRemove();
        }}
        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}