import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store';
import { useAuth } from '../../App';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export default function CommentModal({
  isOpen,
  onClose,
  documentId,
}: CommentModalProps) {
  const { documents, addComment } = useStore();
  const { userType, userEmail } = useAuth();
  const [newComment, setNewComment] = useState('');

  const document = documents.find((doc) => doc.id === documentId);
  if (!document || !isOpen) return null;

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(documentId, {
        userId: userEmail || 'anonymous',
        userName: userType === 'admin' ? 'Admin' : 'Client',
        content: newComment.trim(),
      });
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="max-h-64 overflow-y-auto space-y-4">
            {document.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded-lg p-3 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{comment.userName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button onClick={handleAddComment}>Add</Button>
          </div>
        </div>
      </div>
    </div>
  );
}