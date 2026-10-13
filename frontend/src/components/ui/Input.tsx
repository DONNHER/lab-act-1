import React, { forwardRef } from 'react';
import { cn } from '../../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';