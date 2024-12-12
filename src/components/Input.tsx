import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'shadow-sm transition-colors duration-200',
          'placeholder:text-gray-500',
          'focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;