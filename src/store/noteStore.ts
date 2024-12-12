import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUUID } from '../utils/cryptoPolyfill';
import type { Note, Subtask, NoteReminder, NotePriority } from '../types/note';

interface NoteStore {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'adminId' | 'adminName' | 'createdAt' | 'updatedAt'>, adminId: string, adminName: string) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  addAttachment: (id: string, attachment: Note['attachments'][0]) => void;
  removeAttachment: (id: string, attachmentId: string) => void;
  addSubtask: (noteId: string, content: string) => void;
  updateSubtask: (noteId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  removeSubtask: (noteId: string, subtaskId: string) => void;
  toggleSubtask: (noteId: string, subtaskId: string) => void;
  addReminder: (noteId: string, reminder: Omit<NoteReminder, 'id' | 'completed'>) => void;
  updateReminder: (noteId: string, reminderId: string, updates: Partial<NoteReminder>) => void;
  removeReminder: (noteId: string, reminderId: string) => void;
  toggleReminder: (noteId: string, reminderId: string) => void;
  updatePriority: (noteId: string, priority: NotePriority) => void;
  getNotesByAdmin: (adminId: string) => Note[];
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note, adminId, adminName) => {
        const newNote: Note = {
          ...note,
          id: generateUUID(),
          adminId,
          adminName,
          tags: note.tags || [],
          subtasks: note.subtasks || [],
          reminders: note.reminders || [],
          priority: note.priority || 'medium',
          attachments: note.attachments || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
        return newNote;
      },

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      togglePin: (id) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
          ),
        })),

      toggleArchive: (id) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isArchived: !note.isArchived } : note
          ),
        })),

      addTag: (id, tag) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id && !note.tags.includes(tag)
              ? { ...note, tags: [...note.tags, tag] }
              : note
          ),
        })),

      removeTag: (id, tag) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, tags: note.tags.filter((t) => t !== tag) }
              : note
          ),
        })),

      addAttachment: (id, attachment) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  attachments: [...(note.attachments || []), attachment],
                }
              : note
          ),
        })),

      removeAttachment: (id, attachmentId) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  attachments: note.attachments?.filter(
                    (a) => a.id !== attachmentId
                  ),
                }
              : note
          ),
        })),

      addSubtask: (noteId, content) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  subtasks: [
                    ...(note.subtasks || []),
                    {
                      id: generateUUID(),
                      content,
                      completed: false,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : note
          ),
        })),

      updateSubtask: (noteId, subtaskId, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  subtasks: (note.subtasks || []).map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, ...updates }
                      : subtask
                  ),
                }
              : note
          ),
        })),

      removeSubtask: (noteId, subtaskId) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  subtasks: (note.subtasks || []).filter((st) => st.id !== subtaskId),
                }
              : note
          ),
        })),

      toggleSubtask: (noteId, subtaskId) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  subtasks: (note.subtasks || []).map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                }
              : note
          ),
        })),

      addReminder: (noteId, reminder) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  reminders: [
                    ...(note.reminders || []),
                    {
                      ...reminder,
                      id: generateUUID(),
                      completed: false,
                    },
                  ],
                }
              : note
          ),
        })),

      updateReminder: (noteId, reminderId, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  reminders: (note.reminders || []).map((reminder) =>
                    reminder.id === reminderId
                      ? { ...reminder, ...updates }
                      : reminder
                  ),
                }
              : note
          ),
        })),

      removeReminder: (noteId, reminderId) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  reminders: (note.reminders || []).filter((r) => r.id !== reminderId),
                }
              : note
          ),
        })),

      toggleReminder: (noteId, reminderId) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  reminders: (note.reminders || []).map((reminder) =>
                    reminder.id === reminderId
                      ? { ...reminder, completed: !reminder.completed }
                      : reminder
                  ),
                }
              : note
          ),
        })),

      updatePriority: (noteId, priority) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, priority }
              : note
          ),
        })),

      getNotesByAdmin: (adminId) => {
        const { notes } = get();
        return notes.filter(note => note.adminId === adminId);
      },
    }),
    {
      name: 'notes-store',
    }
  )
);