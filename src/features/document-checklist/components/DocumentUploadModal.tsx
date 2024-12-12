import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, AlertTriangle } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useDocumentChecklistStore } from '../store/documentChecklistStore';
import type { DocumentRequirement } from '../types';

const uploadSchema = z.object({
  file: z.instanceof(File),
  notes: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentRequirement;
  applicationId: string;
  clientId: string;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  document,
  applicationId,
  clientId,
}: DocumentUploadModalProps) {
  const { addSubmission } = useDocumentChecklistStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    if (document.validationRules) {
      document.validationRules.forEach((rule) => {
        switch (rule.type) {
          case 'fileType':
            if (!file.type.includes(rule.value as string)) {
              errors.push(rule.message);
            }
            break;
          case 'fileSize':
            if (file.size > (rule.value as number)) {
              errors.push(rule.message);
            }
            break;
          // Add more validation types as needed
        }
      });
    }

    return errors;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const errors = validateFile(file);
      setValidationErrors(errors);
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile || validationErrors.length > 0) return;

    // In a real app, you would upload the file to storage and get a URL
    const fakeUrl = URL.createObjectURL(selectedFile);

    addSubmission({
      requirementId: document.id,
      clientId,
      applicationId,
      fileUrl: fakeUrl,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
      status: 'submitted',
      notes: data.notes,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-500">{document.description}</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept={document.validationRules
                ?.filter((rule) => rule.type === 'fileType')
                .map((rule) => `.${rule.value}`)
                .join(',')}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
              </p>
              {document.validationRules && (
                <p className="text-xs text-gray-500 mt-1">
                  {document.validationRules
                    .map((rule) => rule.message)
                    .join(' • ')}
                </p>
              )}
            </label>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Validation Errors
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || validationErrors.length > 0}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}