import { forwardRef } from 'react';
import { cn } from '../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            "block w-full rounded-lg border border-gray-300 bg-white shadow-sm",
            "focus:border-brand-yellow focus:ring-brand-yellow",
            "py-2.5 pl-4 pr-10 text-sm transition-colors duration-200",
            "disabled:bg-gray-50 disabled:text-gray-500",
            "hover:border-gray-400",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;