import { useState } from 'react';
import { ChevronLeft, Clock, Calendar, User, FileText } from 'lucide-react';
import Button from '../../../components/Button';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import { useAdminStore } from '../../../store/adminStore';
import DatePicker from 'react-datepicker';
import type { ClientProcess } from '../../../types/taskManagement';

interface StepDetailsProps {
  process: ClientProcess;
  stepId: string | null;
  onBack: () => void;
}

export default function StepDetails({ process, stepId, onBack }: StepDetailsProps) {
  // Find the current step
  const step = process.steps.find(s => s.id === stepId);
  if (!step) return null;

  const [startDate, setStartDate] = useState<Date | null>(
    step.startDate ? new Date(step.startDate) : null
  );
  const [dueDate, setDueDate] = useState<Date | null>(
    step.dueDate ? new Date(step.dueDate) : null
  );

  const { updateTaskStep, completeTaskStep } = useTaskManagementStore();
  const { admins } = useAdminStore();

  const handlers = admins.filter(admin => admin.role !== 'super_admin');

  const handleAssign = (adminId: string) => {
    updateTaskStep(process.id, step.id, { assignedTo: adminId });
  };

  const handleComplete = () => {
    completeTaskStep(process.id, step.id);
  };

  const canComplete = () => {
    // Check if all required documents for this step are verified
    const requiredDocs = step.documents.filter(d => d.required);
    const verifiedDocs = process.documents.filter(
      d => d.status === 'verified' && requiredDocs.some(rd => rd.id === d.id)
    );
    
    // Check if all dependent steps are completed
    const dependentSteps = step.dependsOn?.map(id => 
      process.steps.find(s => s.id === id)
    ) || [];
    const completedDependencies = dependentSteps.every(s => s?.status === 'completed');

    return verifiedDocs.length === requiredDocs.length && completedDependencies;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h3 className="font-medium text-lg">{step.name}</h3>
          <p className="text-sm text-gray-500">{step.description}</p>
        </div>
      </div>

      {/* Status and Assignment */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={step.status}
            onChange={(e) => updateTaskStep(process.id, step.id, {
              status: e.target.value as any
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assigned To</label>
          <select
            value={step.assignedTo || ''}
            onChange={(e) => handleAssign(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
          >
            <option value="">Unassigned</option>
            {handlers.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <div className="mt-1 relative">
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                updateTaskStep(process.id, step.id, {
                  startDate: date?.toISOString()
                });
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              dateFormat="MMMM d, yyyy"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <div className="mt-1 relative">
            <DatePicker
              selected={dueDate}
              onChange={(date) => {
                setDueDate(date);
                updateTaskStep(process.id, step.id, {
                  dueDate: date?.toISOString()
                });
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              dateFormat="MMMM d, yyyy"
              minDate={startDate || new Date()}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Required Documents */}
      {step.documents.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Required Documents</h4>
          <div className="space-y-2">
            {step.documents.map((doc) => {
              const processDoc = process.documents.find(d => d.id === doc.id);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    processDoc?.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : processDoc?.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : processDoc?.status === 'received'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {processDoc?.status || 'Required'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={step.notes || ''}
          onChange={(e) => updateTaskStep(process.id, step.id, {
            notes: e.target.value
          })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
          placeholder="Add any notes about this step..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!canComplete()}
        >
          Complete Step
        </Button>
      </div>
    </div>
  );
}