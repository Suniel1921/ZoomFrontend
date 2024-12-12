import { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import Button from '../../../components/Button';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import DatePicker from 'react-datepicker';
import type { ClientProcess } from '../../../types/taskManagement';

interface ProcessHeaderProps {
  process: ClientProcess;
  template: { name: string; description: string };
}

export default function ProcessHeader({ process, template }: ProcessHeaderProps) {
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const { updateClientProcess } = useTaskManagementStore();

  const handleDueDateChange = (date: Date | null) => {
    if (date) {
      updateClientProcess(process.id, {
        dueDate: date.toISOString()
      });
    }
    setIsEditingDueDate(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">{template.name}</h2>
          <p className="text-gray-500">{template.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-4 w-4" />
              Started: {new Date(process.startDate).toLocaleDateString()}
            </div>
            {process.dueDate && (
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <Calendar className="h-4 w-4" />
                Due: {new Date(process.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingDueDate(true)}
          >
            {process.dueDate ? 'Change Due Date' : 'Set Due Date'}
          </Button>
        </div>
      </div>

      {isEditingDueDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Select Due Date</h3>
            <DatePicker
              selected={process.dueDate ? new Date(process.dueDate) : null}
              onChange={handleDueDateChange}
              minDate={new Date()}
              inline
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditingDueDate(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => handleDueDateChange(null)}>
                Clear Due Date
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}