import { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import Button from '../../../components/Button';
import type { TaskStep } from '../../../types/taskManagement';

interface TaskStepCardProps {
  step: TaskStep;
  isActive: boolean;
  onSelect: () => void;
  completedDocs: number;
  totalDocs: number;
}

export default function TaskStepCard({
  step,
  isActive,
  onSelect,
  completedDocs,
  totalDocs,
}: TaskStepCardProps) {
  const getStatusIcon = () => {
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
    <Button
      variant="outline"
      onClick={onSelect}
      className={`w-full justify-between ${
        isActive ? 'border-brand-yellow bg-brand-yellow/5' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="text-left">
          <p className="font-medium">{step.name}</p>
          <p className="text-sm text-gray-500">{step.description}</p>
          {totalDocs > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Documents: {completedDocs}/{totalDocs}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </Button>
  );
}