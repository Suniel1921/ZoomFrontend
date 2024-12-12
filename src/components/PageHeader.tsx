import { LucideIcon, Filter } from 'lucide-react';
import Button from './Button';

interface Action {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'outline';
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: Action;
  actions?: Action[];
  onFilter?: () => void;
  showFilter?: boolean;
}

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  actions,
  onFilter,
  showFilter = false
}: PageHeaderProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6 text-gray-400 flex-shrink-0" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {showFilter && (
            <Button variant="outline" onClick={onFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
          {action && (
            <Button onClick={action.onClick} variant={action.variant}>
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {actions && actions.map((action, index) => (
            <Button 
              key={index}
              onClick={action.onClick} 
              variant={action.variant}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}