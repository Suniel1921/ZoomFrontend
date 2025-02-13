import { useState, useEffect } from 'react';
import { X, Search, Plus, Pin, Archive, StickyNote, Flag } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import NoteEditor from './NoteEditor';
import SortableNote from './SortableNote';
import Button from '../Button';
import Input from '../Input';
import { Modal } from 'antd';
import type { NotePriority } from '../../types/note';
import { useAuthGlobally } from '../../context/AuthContext';
import axios from 'axios';

const priorityConfig: Record<NotePriority, { icon: typeof Flag; color: string }> = {
  urgent: { icon: Flag, color: 'text-red-500' },
  high: { icon: Flag, color: 'text-orange-500' },
  medium: { icon: Flag, color: 'text-yellow-500' },
  low: { icon: Flag, color: 'text-green-500' }
};

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pinned' | 'archived'>('all');
  const [notes, setNotes] = useState<any[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [auth] = useAuthGlobally();
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<any>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch notes from the backend or localStorage
  const fetchNotes = async () => {
    if (auth?.user?.id && isOpen) {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/note/getAllNotes`);
        const fetchedNotes = response.data.notes;
  
        // Retrieve the saved order from localStorage
        const savedOrder = JSON.parse(localStorage.getItem('notesOrder') || '[]');
  
        // Reorder the notes based on the saved order
        const orderedNotes = savedOrder.length
          ? fetchedNotes.sort((a, b) => savedOrder.indexOf(a._id) - savedOrder.indexOf(b._id))
          : fetchedNotes;
  
        setNotes(orderedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  

  useEffect(() => {
    fetchNotes();
  }, [auth?.user?.id, isOpen]);
  

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
  
    if (over && active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        const newNotes = arrayMove(items, oldIndex, newIndex);
        // Save the updated notes order to localStorage
        localStorage.setItem('notesOrder', JSON.stringify(newNotes.map(note => note._id)));
        return newNotes;
      });
    }
  };
  

  // Filter notes based on search and filter
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                          (filter === 'pinned' && note.isPinned) ||
                          (filter === 'archived' && note.isArchived);
    return matchesSearch && matchesFilter;
  });

  // Sort notes with pinned ones at the top
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/note/deleteNote/${noteId}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50">
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

      <div className="h-[calc(100vh-16rem)] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading notes...</div>
        ) : sortedNotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notes found</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedNotes.map(note => note._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200">
                {sortedNotes.map((note) => (
                  <SortableNote
                    key={note._id}
                    note={note}
                    priorityConfig={priorityConfig}
                    onEdit={handleEditNote}
                    onDelete={(noteId) => setIsDeleting(noteId)}
                    isSelected={selectedNote === note._id}
                    onSelect={() => setSelectedNote(note._id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="absolute bottom-4 right-4">
        <Button onClick={handleNewNote}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {isEditorOpen && (
        <NoteEditor
          onClose={() => {
            setIsEditorOpen(false);
            setEditingNote(null);
          }}
          noteId={editingNote?._id}
          fetchNotes={fetchNotes}
          initialData={editingNote}
        />
      )}

      <Modal
        title="Delete Note"
        open={isDeleting !== null}
        onOk={() => handleDeleteNote(isDeleting!)}
        onCancel={() => setIsDeleting(null)}
        okText="Yes, Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this note?</p>
      </Modal>
    </div>
  );
}

