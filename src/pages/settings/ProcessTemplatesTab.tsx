import { useState } from 'react';
import { Plus, FileText, Edit, Trash2, Copy } from 'lucide-react';
import Button from '../../components/Button';
import { useTaskManagementStore } from '../../store/taskManagementStore';
import TemplateFormModal from './components/TemplateFormModal';
import type { ProcessFlowTemplate } from '../../types/taskManagement';

export default function ProcessTemplatesTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessFlowTemplate | null>(null);
  const { templates, deleteTemplate, addTemplate } = useTaskManagementStore();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteTemplate(id);
    }
  };

  const handleDuplicate = (template: ProcessFlowTemplate) => {
    const { id, createdAt, updatedAt, ...rest } = template;
    addTemplate({
      ...rest,
      name: `${template.name} (Copy)`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Process Flow Templates</h3>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-brand-yellow transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-yellow/10 rounded-lg">
                  <FileText className="h-5 w-5 text-brand-black" />
                </div>
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                  title="Duplicate Template"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Steps</p>
                <p className="font-medium">{template.steps.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Documents</p>
                <p className="font-medium">{template.documents.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Payments</p>
                <p className="font-medium">{template.payments.length}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TemplateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedTemplate && (
        <TemplateFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}
    </div>
  );
}