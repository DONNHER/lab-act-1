import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils';

export interface TooltipProps {
  /** The content to display in the tooltip */
  content: React.ReactNode;
  /** The child element that triggers the tooltip */
  children: React.ReactElement;
  /** Position of the tooltip relative to the trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing the tooltip (ms) */
  delay?: number;
  /** Delay before hiding the tooltip (ms) */
  hideDelay?: number;
  /** Additional class names for the tooltip */
  className?: string;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position: positionProp = 'top',
  delay = 200,
  hideDelay = 100,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!triggerRect || !tooltipRef.current) return { top: 0, left: 0 };

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8; // gap between trigger and tooltip

    let top = 0;
    let left = 0;

    switch (positionProp) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();

  // Wrap the child in a span to attach ref and event handlers
  const childWithProps = (
    <span
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      aria-describedby={isVisible ? 'tooltip' : undefined}
    >
      {children}
    </span>
  );

  const tooltipContent = isVisible && triggerRect ? (
    createPortal(
      <div
        ref={tooltipRef}
        id="tooltip"
        role="tooltip"
        className={cn(
          'fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
        onMouseEnter={() => {
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }
        }}
        onMouseLeave={hideTooltip}
      >
        {content}
        {/* Arrow */}
        <div
          className={cn(
            'absolute w-2 h-2 bg-gray-900 rotate-45',
            positionProp === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
            positionProp === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
            positionProp === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
            positionProp === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
          )}
        />
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      {childWithProps}
      {tooltipContent}
    </>
  );
};

export default Tooltip;