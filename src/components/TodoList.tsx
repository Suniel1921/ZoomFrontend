import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import TodoItem from './TodoItem';

export interface Todo {
  id: string;
  task: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
}

interface TodoListProps {
  todos: Todo[];
  onTodosChange: (todos: Todo[]) => void;
}

export default function TodoList({ todos, onTodosChange }: TodoListProps) {
  const [newTask, setNewTask] = useState('');

  const handleAddTodo = (e?: React.MouseEvent) => {
    // Prevent form submission
    e?.preventDefault();
    
    if (newTask.trim()) {
      onTodosChange([
        ...todos,
        {
          id: crypto.randomUUID(), // Ensure unique ID
          task: newTask.trim(),
          completed: false,
          priority: 'Medium',
        },
      ]);
      setNewTask('');
    }
  };

  const handleRemoveTodo = (id: string) => {
    onTodosChange(todos.filter(todo => todo.id !== id));
  };

  const handleToggleTodo = (id: string) => {
    onTodosChange(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
    onTodosChange(
      todos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // Prevent form submission
              handleAddTodo();
            }
          }}
        />
        <Button 
          type="button" // Explicitly set button type to prevent form submission
          onClick={handleAddTodo}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id} // Use the unique ID as key
            todo={todo}
            onToggle={() => handleToggleTodo(todo.id)}
            onRemove={() => handleRemoveTodo(todo.id)}
            onUpdate={(updates) => handleUpdateTodo(todo.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}