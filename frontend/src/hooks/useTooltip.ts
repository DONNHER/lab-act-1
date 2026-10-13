import { useState, useRef, useEffect, useCallback } from 'react';

interface UseTooltipOptions {
  /** Delay before showing the tooltip (ms) */
  delay?: number;
  /** Delay before hiding the tooltip (ms) */
  hideDelay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
}

interface UseTooltipReturn {
  /** Whether the tooltip is currently visible */
  isVisible: boolean;
  /** Ref to attach to the trigger element */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** Function to show the tooltip */
  show: () => void;
  /** Function to hide the tooltip */
  hide: () => void;
  /** Current position of the tooltip */
  position: { top: number; left: number } | null;
}

/**
 * Hook for managing tooltip state and positioning
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const { delay = 200, hideDelay = 100, disabled = false } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        setPosition(triggerRef.current.getBoundingClientRect());
      }
      setIsVisible(true);
    }, delay);
  }, [delay, disabled]);

  const hide = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [hideDelay]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return {
    isVisible,
    triggerRef,
    show,
    hide,
    position,
  };
}

export default useTooltip;