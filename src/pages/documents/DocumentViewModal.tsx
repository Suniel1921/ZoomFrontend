import { useState } from 'react';
import { X, Download, MessageSquare, Clock } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Document } from '../../types';
import { useStore } from '../../store';

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

export default function DocumentViewModal({
  isOpen,
  onClose,
  document,
}: DocumentViewModalProps) {
  const { addDocumentComment } = useStore();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      addDocumentComment(document.id, {
        text: newComment.trim(),
        author: 'Admin',
      });
      setNewComment('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{document.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Document Preview */}
          <div className="col-span-2 space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
              {document.type === 'Visa' || document.type === 'Contract' ? (
                <iframe
                  src={document.url}
                  className="w-full h-full rounded-lg"
                  title={document.name}
                />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500">Preview not available</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(document.url)}
                    className="mt-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments
              </h3>
              
              <div className="space-y-4">
                {document.comments?.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 rounded-lg p-3 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{comment.userId}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}

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

          {/* Document Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Document Details</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium">{document.type}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium">{document.category}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Size</dt>
                  <dd className="font-medium">
                    {(document.size / 1024).toFixed(2)} KB
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Uploaded</dt>
                  <dd className="font-medium">
                    {new Date(document.uploadDate).toLocaleDateString()}
                  </dd>
                </div>
                {document.metadata?.language && (
                  <div>
                    <dt className="text-gray-500">Language</dt>
                    <dd className="font-medium">{document.metadata.language}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {document.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Version History</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Current Version</p>
                    <p className="text-gray-500">
                      {new Date(document.lastModified).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(document.url)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}