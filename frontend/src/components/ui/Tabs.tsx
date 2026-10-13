import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('space-y-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) {
      throw new Error('TabsTrigger must be used within Tabs');
    }

    const { value: contextValue, onValueChange } = context;
    const isActive = contextValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        onClick={() => !disabled && onValueChange(value)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-900'
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) {
      throw new Error('TabsContent must be used within Tabs');
    }

    const { value: contextValue } = context;
    const isActive = contextValue === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';