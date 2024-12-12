import { useState } from 'react';
import { X, ChevronRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Button from '../../../components/Button';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import StepDetails from './StepDetails';
import ProcessTimeline from './ProcessTimeline';
import ProcessHeader from './ProcessHeader';
import ProcessSummary from './ProcessSummary';
import ProcessNotes from './ProcessNotes';

interface ProcessDetailsProps {
  processId: string;
  onClose: () => void;
}

export default function ProcessDetails({ processId, onClose }: ProcessDetailsProps) {
  const [activeTab, setActiveTab] = useState('steps');
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  
  const { getClientProcessById, getTemplateById } = useTaskManagementStore();
  const process = getClientProcessById(processId);
  const template = process ? getTemplateById(process.templateId) : null;

  if (!process || !template) return null;

  const renderStepStatus = (step: any) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <p className="text-sm text-gray-500">
              Started on {new Date(process.startDate).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Process Summary */}
        <div className="p-6 border-b">
          <ProcessSummary process={process} />
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('steps')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'steps'
                  ? 'border-brand-yellow text-brand-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Steps
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-brand-yellow text-brand-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notes'
                  ? 'border-brand-yellow text-brand-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notes
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'steps' && (
            <div className="space-y-4">
              {selectedStep ? (
                <StepDetails
                  process={process}
                  stepId={selectedStep}
                  onBack={() => setSelectedStep(null)}
                />
              ) : (
                process.steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStep(step.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        {renderStepStatus(step)}
                        <div>
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-gray-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <ProcessTimeline process={process} />
          )}

          {activeTab === 'notes' && (
            <ProcessNotes process={process} />
          )}
        </div>
      </div>
    </div>
  );
}