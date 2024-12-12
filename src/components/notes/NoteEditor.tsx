import { useState, useRef, useEffect } from 'react';
import { X, Pin, Archive, Bell, Flag, ListTodo, Trash2, Check } from 'lucide-react';
import Button from '../Button';
import Input from '../Input';
import { useNoteStore } from '../../store/noteStore';
import { useAdminStore } from '../../store/adminStore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ReminderModal from './ReminderModal';
import SubtaskList from './SubtaskList';
import PrioritySelect from './PrioritySelect';
import ReminderList from './ReminderList';

interface NoteEditorProps {
  noteId: string;
  onClose: () => void;
}

export default function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const { 
    notes, 
    updateNote, 
    togglePin, 
    toggleArchive, 
    deleteNote, 
    addAttachment, 
    removeAttachment,
    addSubtask,
    updateSubtask,
    removeSubtask,
    toggleSubtask,
    addReminder,
    updateReminder,
    removeReminder,
    toggleReminder,
    updatePriority
  } = useNoteStore();
  const { currentAdmin } = useAdminStore();
  const note = notes.find(n => n.id === noteId);
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure the current admin can only edit their own notes
  if (!currentAdmin || !note || note.adminId !== currentAdmin.id) {
    return null;
  }

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (note) {
        updateNote(noteId, { title, content });
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [title, content, noteId, updateNote]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
      onClose();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file);
      addAttachment(noteId, {
        id: crypto.randomUUID(),
        name: file.name,
        url: fileUrl,
        type: file.type
      });
    }
  };

  const handleAddReminder = (reminderData: {
    date: string;
    time: string;
    recurring: boolean;
    recurringType?: 'daily' | 'weekly' | 'monthly';
  }) => {
    addReminder(noteId, reminderData);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePin(noteId)}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                note.isPinned ? 'text-brand-yellow' : 'text-gray-500'
              }`}
            >
              <Pin className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleArchive(noteId)}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                note.isArchived ? 'text-brand-yellow' : 'text-gray-500'
              }`}
            >
              <Archive className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-gray-100 text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-4 space-y-6">
          {/* Priority and Reminders */}
          <div className="flex items-center gap-4">
            <PrioritySelect
              value={note.priority}
              onChange={(priority) => updatePriority(noteId, priority)}
            />
            <Button
              variant="outline"
              onClick={() => setShowReminderModal(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          {/* Reminders List */}
          {note.reminders && note.reminders.length > 0 && (
            <ReminderList
              reminders={note.reminders}
              onToggle={(reminderId) => toggleReminder(noteId, reminderId)}
              onDelete={(reminderId) => removeReminder(noteId, reminderId)}
            />
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
              subtasks={note.subtasks}
              onAddSubtask={(content) => addSubtask(noteId, content)}
              onToggleSubtask={(subtaskId) => toggleSubtask(noteId, subtaskId)}
              onRemoveSubtask={(subtaskId) => removeSubtask(noteId, subtaskId)}
              onUpdateSubtask={(subtaskId, content) => updateSubtask(noteId, subtaskId, { content })}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Add Attachment
            </Button>
            {note.attachments && note.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {note.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{attachment.name}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={attachment.url}
                        download
                        className="text-brand-black hover:text-brand-yellow"
                      >
                        Download
                      </a>
                      <button 
                        onClick={() => removeAttachment(noteId, attachment.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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