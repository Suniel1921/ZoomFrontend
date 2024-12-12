import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import { useStore } from '../../store';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentId: string;
  clientName: string;
}

export default function ReplyModal({
  isOpen,
  onClose,
  commentId,
  clientName,
}: ReplyModalProps) {
  const [reply, setReply] = useState('');
  const { addCommentReply } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    addCommentReply(commentId, reply.trim());
    setReply('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reply to Comment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replying to: {clientName}
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:ring-brand-yellow focus:border-brand-yellow"
              placeholder="Write your reply here..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!reply.trim()}>
              Send Reply
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}