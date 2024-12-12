import { useState } from 'react';
import { FileCheck, AlertTriangle, Clock, Upload, Eye, X } from 'lucide-react';
import Button from '../../../components/Button';
import { useDocumentChecklistStore } from '../store/documentChecklistStore';
import type { DocumentRequirement, DocumentSubmission } from '../types';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';

interface DocumentChecklistTableProps {
  applicationId: string;
  templateId: string;
  clientId: string;
}

export default function DocumentChecklistTable({
  applicationId,
  templateId,
  clientId,
}: DocumentChecklistTableProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentRequirement | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentSubmission | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const {
    templates,
    submissions,
    getSubmissionsByApplication,
    getMissingDocuments,
  } = useDocumentChecklistStore();

  const template = templates.find((t) => t.id === templateId);
  const applicationSubmissions = getSubmissionsByApplication(applicationId);
  const missingDocuments = getMissingDocuments(applicationId, templateId);

  if (!template) return null;

  const getDocumentStatus = (doc: DocumentRequirement) => {
    const submission = applicationSubmissions.find(
      (s) => s.requirementId === doc.id
    );

    if (!submission) {
      return doc.required ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Required
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Optional
        </span>
      );
    }

    switch (submission.status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <FileCheck className="h-3 w-3 mr-1" />
            Verified
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {template.baseDocuments.map((doc) => {
              const submission = applicationSubmissions.find(
                (s) => s.requirementId === doc.id
              );

              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDocumentStatus(doc)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.priority === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : doc.priority === 'high'
                        ? 'bg-yellow-100 text-yellow-700'
                        : doc.priority === 'medium'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {doc.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      {submission ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPreviewDoc(submission);
                            setIsPreviewModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setIsUploadModalOpen(true);
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedDoc && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedDoc(null);
          }}
          document={selectedDoc}
          applicationId={applicationId}
          clientId={clientId}
        />
      )}

      {previewDoc && (
        <DocumentPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setPreviewDoc(null);
          }}
          submission={previewDoc}
        />
      )}
    </div>
  );
}