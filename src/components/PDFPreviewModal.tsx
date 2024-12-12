import { X } from 'lucide-react';
import Button from './Button';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName: string;
}

export default function PDFPreviewModal({
  isOpen,
  onClose,
  pdfUrl,
  fileName,
}: PDFPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{fileName}</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 p-4 bg-gray-50">
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-lg border border-gray-200"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
}