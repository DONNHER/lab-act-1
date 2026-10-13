import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Alias for leftIcon
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      icon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl transition-all duration-150
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      whitespace-nowrap
    `;

    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
      outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 active:bg-primary-100 dark:hover:bg-primary-900/20',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
    };

    const sizeStyles = {
      xs: 'px-3 py-1.5 text-xs gap-1.5',
      sm: 'px-3.5 py-2 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-5 py-3 text-base gap-2',
      xl: 'px-6 py-4 text-lg gap-2.5',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    // Use icon as alias for leftIcon
    const effectiveLeftIcon = leftIcon || icon;

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {effectiveLeftIcon && <span className="flex-shrink-0">{effectiveLeftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';