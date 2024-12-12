import { useState } from 'react';
import { X, Search, Plus, Pin, Archive, Tag, Calendar, Paperclip, StickyNote, Flag } from 'lucide-react';
import { useNoteStore } from '../../store/noteStore';
import { useAdminStore } from '../../store/adminStore';
import NoteEditor from './NoteEditor';
import Button from '../Button';
import Input from '../Input';
import { format } from 'date-fns';
import type { NotePriority } from '../../types/note';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const priorityConfig: Record<NotePriority, { icon: typeof Flag; color: string }> = {
  urgent: { icon: Flag, color: 'text-red-500' },
  high: { icon: Flag, color: 'text-orange-500' },
  medium: { icon: Flag, color: 'text-yellow-500' },
  low: { icon: Flag, color: 'text-green-500' }
};

export default function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pinned' | 'archived'>('all');
  const { notes, addNote, getNotesByAdmin } = useNoteStore();
  const { currentAdmin } = useAdminStore();

  if (!currentAdmin) return null;

  const adminNotes = getNotesByAdmin(currentAdmin.id);
  const filteredNotes = adminNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'pinned' && note.isPinned) ||
                         (filter === 'archived' && note.isArchived);
    return matchesSearch && matchesFilter;
  });

  const handleNewNote = () => {
    const newNote = addNote({
      title: 'Untitled Note',
      content: '',
      tags: [],
      isPinned: false,
      isArchived: false,
      priority: 'medium',
      subtasks: [],
      reminders: [],
    }, currentAdmin.id, currentAdmin.name);
    setSelectedNote(newNote.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-brand-yellow" />
            <h2 className="text-lg font-semibold">My Notes</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'pinned' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pinned')}
          >
            <Pin className="h-4 w-4 mr-1" />
            Pinned
          </Button>
          <Button
            variant={filter === 'archived' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('archived')}
          >
            <Archive className="h-4 w-4 mr-1" />
            Archived
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="h-[calc(100vh-16rem)] overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notes found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotes.map((note) => {
              const PriorityIcon = priorityConfig[note.priority].icon;
              const priorityColor = priorityConfig[note.priority].color;
              
              return (
                <div
                  key={note.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedNote === note.id ? 'bg-brand-yellow/10' : ''
                  }`}
                  onClick={() => setSelectedNote(note.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{note.title}</h3>
                        <PriorityIcon className={`h-4 w-4 ${priorityColor}`} />
                        {note.isPinned && (
                          <Pin className="h-4 w-4 text-brand-yellow" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {note.content}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    {note.reminders && note.reminders.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {note.reminders.length} reminder{note.reminders.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    {note.subtasks && note.subtasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {note.subtasks.filter(st => st.completed).length}/{note.subtasks.length} tasks
                      </div>
                    )}
                    {note.attachments?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {note.attachments.length}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Note Button */}
      <div className="absolute bottom-4 right-4">
        <Button onClick={handleNewNote}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Note Editor */}
      {selectedNote && (
        <NoteEditor
          noteId={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
}