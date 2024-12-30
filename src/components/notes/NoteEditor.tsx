import { useState, useEffect } from 'react';
import { X, Pin, Archive, Bell, ListTodo } from 'lucide-react';
import Button from '../Button';
import Input from '../Input';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ReminderModal from './ReminderModal';
import SubtaskList from './SubtaskList';
import PrioritySelect from './PrioritySelect';
import ReminderList from './ReminderList';
import axios from 'axios'; // Add Axios for API calls
import toast from 'react-hot-toast';

interface NoteEditorProps {
  noteId?: string;
  onClose: () => void;
  fetchNotes : () => void;
}

export default function NoteEditor({ noteId, onClose ,fetchNotes}: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [reminders, setReminders] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);



  const handleAddReminder = (reminderData: {
    date: string;
    time: string;
    recurring: boolean;
    recurringType?: 'daily' | 'weekly' | 'monthly';
  }) => {
    setReminders([...reminders, reminderData]);
  };


  
  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
  
    const newNote = {
      title: title.trim(),
      content: content.trim(),
      priority,
      reminders,
      subtasks,
    };
  
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/note/createNote`, newNote);
      if (response.data.success) {
        fetchNotes();
        noteId()
        toast.success('Note created successfully');
      }
      onClose();
    } catch (error: any) {
      console.error('Error creating note:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to create note.');
    }
  };
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Editor Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none focus:ring-0"
            placeholder="Note title"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="p-4 space-y-6">
          {/* Priority and Reminders */}
          <div className="flex items-center gap-4">
            <PrioritySelect value={priority} onChange={setPriority} />
            <Button variant="outline" onClick={() => setShowReminderModal(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          {/* Reminders List */}
          {reminders.length > 0 && (
            <ReminderList reminders={reminders} />
          )}

          {/* Main Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-2 border rounded-md focus:ring-brand-yellow focus:border-brand-yellow"
            placeholder="Start writing..."
          />

          {/* Subtasks */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-gray-400" />
              <h3 className="font-medium">Subtasks</h3>
            </div>
            <SubtaskList
              subtasks={subtasks}
              onAddSubtask={(content) => setSubtasks([...subtasks, { content, completed: false }])}
              onToggleSubtask={(index) =>
                setSubtasks(
                  subtasks.map((task, i) =>
                    i === index ? { ...task, completed: !task.completed } : task
                  )
                )
              }
              onRemoveSubtask={(index) =>
                setSubtasks(subtasks.filter((_, i) => i !== index))
              }
              onUpdateSubtask={(index, content) =>
                setSubtasks(
                  subtasks.map((task, i) =>
                    i === index ? { ...task, content } : task
                  )
                )
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateNote}>
            Create Note
          </Button>
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSave={handleAddReminder}
      />
    </div>
  );
}
