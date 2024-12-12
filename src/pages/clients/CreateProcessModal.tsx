import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import { useTaskManagementStore } from '../../store/taskManagementStore';
import { useStore } from '../../store';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { Client, ProcessFlowTemplate } from '../../types';

const createProcessSchema = z.object({
  templateId: z.string().min(1, 'Please select a process type'),
  dueDate: z.date().optional(),
});

type CreateProcessFormData = z.infer<typeof createProcessSchema>;

interface CreateProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  templates: ProcessFlowTemplate[];
}

export default function CreateProcessModal({
  isOpen,
  onClose,
  client,
  templates,
}: CreateProcessModalProps) {
  const { createClientProcess } = useTaskManagementStore();
  const { 
    applications, 
    japanVisitApplications, 
    translations, 
    graphicDesignJobs, 
    epassportApplications,
    otherServices 
  } = useStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProcessFormData>({
    resolver: zodResolver(createProcessSchema),
  });

  const selectedTemplateId = watch('templateId');
  // const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Get service amount based on template type
  const getServiceAmount = (template: ProcessFlowTemplate) => {
    if (template.serviceType === 'us_visa' || template.serviceType === 'visitor_visa') {
      const app = applications.find(a => a.clientId === client.id);
      return app?.payment?.total || 0;
    }
    
    if (template.serviceType === 'japan_visa') {
      const app = japanVisitApplications.find(a => a.clientId === client.id);
      return app?.amount || 0;
    }
    
    if (template.serviceType === 'translation') {
      const trans = translations.find(t => t.clientId === client.id);
      return trans?.amount || 0;
    }
    
    if (template.serviceType === 'design') {
      const design = graphicDesignJobs.find(d => d.clientId === client.id);
      return design?.amount || 0;
    }
    
    if (template.serviceType === 'epassport') {
      const epass = epassportApplications.find(e => e.clientId === client.id);
      return epass?.amount || 0;
    }
    
    if (template.serviceType === 'other') {
      const service = otherServices.find(s => s.clientId === client.id);
      return service?.amount || 0;
    }

    return 0;
  };

  const onSubmit = (data: CreateProcessFormData) => {
    const template = templates.find(t => t.id === data.templateId);
    if (!template) return;

    // Get service amount
    const serviceAmount = getServiceAmount(template);

    // Create process with updated payment amount
    createClientProcess(
      data.templateId,
      client.id,
      data.dueDate?.toISOString(),
      serviceAmount
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Start New Process</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Process Type
            </label>
            <select
              {...register('templateId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">Select process type</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            {errors.templateId && (
              <p className="mt-1 text-sm text-red-600">{errors.templateId.message}</p>
            )}
          </div>

          {selectedTemplate && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Process Details</h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedTemplate.description}
              </p>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Steps:</span>{' '}
                  {selectedTemplate.steps.length}
                </p>
                <p>
                  <span className="font-medium">Required Documents:</span>{' '}
                  {selectedTemplate.documents.filter(d => d.required).length}
                </p>
                <p>
                  <span className="font-medium">Service Amount:</span>{' '}
                  ¥{getServiceAmount(selectedTemplate).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date (Optional)
            </label>
            <DatePicker
              selected={watch('dueDate')}
              onChange={(date) => setValue('dueDate', date as Date)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              dateFormat="MMMM d, yyyy"
              minDate={new Date()}
              placeholderText="Select a due date"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Start Process</Button>
          </div>
        </form>
      </div>
    </div>
  );
}