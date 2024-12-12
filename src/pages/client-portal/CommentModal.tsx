import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import { useStore } from '../../store';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
  };
  clientId: string;
}

export default function CommentModal({
  isOpen,
  onClose,
  document,
  clientId,
}: CommentModalProps) {
  const { addDocumentComment, documents } = useStore();
  const [comment, setComment] = useState('');

  const currentDocument = documents.find(doc => doc.id === document.id);
  const comments = currentDocument?.comments || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addDocumentComment(document.id, {
      userId: clientId,
      content: comment.trim(),
      timestamp: new Date().toISOString(),
    });

    setComment('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Document Comments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 max-h-64 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {comment.userId === clientId ? 'You' : comment.userId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:ring-brand-yellow focus:border-brand-yellow"
              placeholder="Write your comment here..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!comment.trim()}>
              Submit Comment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}