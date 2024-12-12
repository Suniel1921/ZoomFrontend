import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, ArrowUp, ArrowDown, FileText, DollarSign } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import type { ProcessFlowTemplate, TaskStep, DocumentRequirement, PaymentMilestone } from '../../../types/taskManagement';

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  serviceType: z.string().min(1, 'Service type is required'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ProcessFlowTemplate;
}

export default function TemplateFormModal({
  isOpen,
  onClose,
  template,
}: TemplateFormModalProps) {
  const { addTemplate, updateTemplate } = useTaskManagementStore();
  const [steps, setSteps] = useState<TaskStep[]>(template?.steps || []);
  const [documents, setDocuments] = useState<DocumentRequirement[]>(template?.documents || []);
  const [payments, setPayments] = useState<PaymentMilestone[]>(template?.payments || []);
  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    dependsOn: [] as string[],
  });
  const [newDocument, setNewDocument] = useState({
    name: '',
    description: '',
    required: true,
  });
  const [newPayment, setNewPayment] = useState({
    name: '',
    amount: 0,
    requiredForStep: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template && {
      name: template.name,
      description: template.description,
      serviceType: template.serviceType,
    },
  });

  const handleAddStep = () => {
    if (newStep.name && newStep.description) {
      setSteps([
        ...steps,
        {
          id: crypto.randomUUID(),
          name: newStep.name,
          description: newStep.description,
          order: steps.length,
          status: 'pending',
          dependsOn: newStep.dependsOn,
          documents: [],
        },
      ]);
      setNewStep({ name: '', description: '', dependsOn: [] });
    }
  };

  const handleAddDocument = () => {
    if (newDocument.name && newDocument.description) {
      setDocuments([
        ...documents,
        {
          id: crypto.randomUUID(),
          ...newDocument,
          status: 'required',
        },
      ]);
      setNewDocument({ name: '', description: '', required: true });
    }
  };

  const handleAddPayment = () => {
    if (newPayment.name && newPayment.amount > 0) {
      setPayments([
        ...payments,
        {
          id: crypto.randomUUID(),
          ...newPayment,
          status: 'pending',
          paidAmount: 0,
        },
      ]);
      setNewPayment({ name: '', amount: 0, requiredForStep: '' });
    }
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter((payment) => payment.id !== id));
  };

  const handleMoveStep = (id: string, direction: 'up' | 'down') => {
    const index = steps.findIndex((step) => step.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const step = newSteps[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    newSteps[index] = newSteps[swapIndex];
    newSteps[swapIndex] = step;

    // Update order
    newSteps.forEach((step, i) => {
      step.order = i;
    });

    setSteps(newSteps);
  };

  const onSubmit = (data: TemplateFormData) => {
    const templateData = {
      ...data,
      steps,
      documents,
      payments,
    };

    if (template) {
      updateTemplate(template.id, templateData);
    } else {
      addTemplate(templateData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <Input {...register('name')} className="mt-1" />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Type
              </label>
              <Input {...register('serviceType')} className="mt-1" />
              {errors.serviceType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.serviceType.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Steps Section */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Process Steps</h3>

            {/* Add New Step */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Step Name"
                value={newStep.name}
                onChange={(e) =>
                  setNewStep({ ...newStep, name: e.target.value })
                }
              />
              <Input
                placeholder="Step Description"
                value={newStep.description}
                onChange={(e) =>
                  setNewStep({ ...newStep, description: e.target.value })
                }
              />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Depends On
                </label>
                <select
                  multiple
                  value={newStep.dependsOn}
                  onChange={(e) =>
                    setNewStep({
                      ...newStep,
                      dependsOn: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  {steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Button
                  type="button"
                  onClick={handleAddStep}
                  disabled={!newStep.name || !newStep.description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                    {step.dependsOn?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Depends on:{' '}
                        {step.dependsOn
                          .map(
                            (id) => steps.find((s) => s.id === id)?.name
                          )
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveStep(step.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveStep(step.id, 'down')}
                      disabled={index === steps.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveStep(step.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Required Documents</h3>

            {/* Add New Document */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Document Name"
                value={newDocument.name}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, name: e.target.value })
                }
              />
              <Input
                placeholder="Document Description"
                value={newDocument.description}
                onChange={(e) =>
                  setNewDocument({ ...newDocument, description: e.target.value })
                }
              />
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newDocument.required}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, required: e.target.checked })
                    }
                    className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm text-gray-700">Required Document</span>
                </label>
              </div>
              <div className="col-span-2">
                <Button
                  type="button"
                  onClick={handleAddDocument}
                  disabled={!newDocument.name || !newDocument.description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.description}</p>
                    {doc.required && (
                      <span className="text-xs text-red-600">Required</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Payments Section */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Payment Milestones</h3>

            {/* Add New Payment */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Payment Name"
                value={newPayment.name}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, name: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Amount"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })
                }
              />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Required for Step
                </label>
                <select
                  value={newPayment.requiredForStep}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, requiredForStep: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="">Select step</option>
                  {steps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Button
                  type="button"
                  onClick={handleAddPayment}
                  disabled={!newPayment.name || newPayment.amount <= 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </div>

            {/* Payments List */}
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{payment.name}</p>
                    <p className="text-sm text-gray-500">
                      Amount: ¥{payment.amount.toLocaleString()}
                    </p>
                    {payment.requiredForStep && (
                      <p className="text-xs text-gray-400">
                        Required for: {steps.find(s => s.id === payment.requiredForStep)?.name}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePayment(payment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}