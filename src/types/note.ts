export type NotePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  content: string;
  completed: boolean;
  createdAt: string;
}

export interface NoteReminder {
  id: string;
  date: string;
  time: string;
  recurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
}

export interface Note {
  id: string;
  adminId: string;
  adminName: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  priority: NotePriority;
  subtasks: Subtask[];
  reminders: NoteReminder[];
  dueDate?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  createdAt: string;
  updatedAt: string;
}