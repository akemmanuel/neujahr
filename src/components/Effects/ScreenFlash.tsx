import { useEffect, useState } from 'react';

interface ScreenFlashProps {
  trigger: boolean;
  color?: string;
  duration?: number;
}

export function ScreenFlash({ 
  trigger, 
  color = 'rgba(255, 215, 0, 0.8)', 
  duration = 300 
}: ScreenFlashProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastTrigger, setLastTrigger] = useState(false);

  useEffect(() => {
    if (trigger && !lastTrigger) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
    setLastTrigger(trigger);
  }, [trigger, lastTrigger, duration]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 animate-screen-flash"
      style={{ 
        backgroundColor: color,
        animationDuration: `${duration}ms`,
      }}
    />
  );
}

export default ScreenFlash;
