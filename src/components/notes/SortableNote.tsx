import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pin, Archive, Tag, Calendar, Paperclip, Flag, Edit, Trash, GripVertical } from 'lucide-react';
import type { NotePriority } from '../../types/note';

interface SortableNoteProps {
  note: any;
  priorityConfig: Record<NotePriority, { icon: typeof Flag; color: string }>;
  onEdit: (note: any) => void;
  onDelete: (noteId: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export default function SortableNote({
  note,
  priorityConfig,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
}: SortableNoteProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const PriorityIcon = priorityConfig[note.priority].icon;
  const priorityColor = priorityConfig[note.priority].color;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-brand-yellow/10' : ''} 
        ${isDragging ? 'shadow-lg rounded-lg' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{note.title}</h3>
            <PriorityIcon className={`h-4 w-4 ${priorityColor}`} />
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{note.content}</p>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{note.reminders.date}</p>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{note.reminders.time}</p>
          
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
                {note.subtasks.filter(st => st.isCompleted).length}/{note.subtasks.length} tasks
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note._id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

