import { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ClientProcess } from '../../../types/taskManagement';

interface ProcessTimelineProps {
  process: ClientProcess;
}

export default function ProcessTimeline({ process }: ProcessTimelineProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
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
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200" />
      <div className="space-y-8">
        {process.steps.map((step, index) => (
          <div key={step.id} className="relative flex items-start">
            <div className="absolute left-0 w-8 h-8 bg-white flex items-center justify-center">
              {getStepIcon(step.status)}
            </div>
            <div className="ml-12">
              <h4 className="font-medium">{step.name}</h4>
              <p className="text-sm text-gray-500">{step.description}</p>
              {step.startDate && (
                <p className="text-xs text-gray-400 mt-1">
                  Started: {new Date(step.startDate).toLocaleDateString()}
                </p>
              )}
              {step.completedAt && (
                <p className="text-xs text-green-600 mt-1">
                  Completed: {new Date(step.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}