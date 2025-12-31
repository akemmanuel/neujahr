import { useState, useEffect, useCallback, useRef } from 'react';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isComplete: boolean;
}

export interface CountdownEvents {
  onSecondTick: () => void;
  onMinuteComplete: () => void;
  onHourComplete: () => void;
  onLastMinute: () => void;
  onFinalCountdown: (secondsLeft: number) => void;
  onComplete: () => void;
}

// Target: January 1, 2025, 00:00:00 local time
const getTargetDate = () => {
  const now = new Date();
  // If we're already past midnight on Jan 1, 2025, use next year for demo
  const target = new Date(2025, 0, 1, 0, 0, 0, 0);
  
  if (now >= target) {
    // For testing: set target to next minute if already past
    // In production, this would show the celebration
    return target;
  }
  
  return target;
};

const calculateTimeLeft = (targetDate: Date): CountdownTime => {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isComplete: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isComplete: false,
  };
};

export function useCountdown(events?: Partial<CountdownEvents>) {
  const targetDate = useRef(getTargetDate());
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => 
    calculateTimeLeft(targetDate.current)
  );
  const lastSecond = useRef<number>(-1);
  const lastMinute = useRef<number>(-1);
  const lastHour = useRef<number>(-1);
  const hasTriggeredLastMinute = useRef(false);
  const hasCompleted = useRef(false);

  const resetCountdown = useCallback((newTarget?: Date) => {
    if (newTarget) {
      targetDate.current = newTarget;
    }
    hasTriggeredLastMinute.current = false;
    hasCompleted.current = false;
    lastSecond.current = -1;
    lastMinute.current = -1;
    lastHour.current = -1;
    setTimeLeft(calculateTimeLeft(targetDate.current));
  }, []);

  // For testing: set a custom target time
  const setTestTarget = useCallback((secondsFromNow: number) => {
    const newTarget = new Date(Date.now() + secondsFromNow * 1000);
    resetCountdown(newTarget);
  }, [resetCountdown]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate.current);
      
      // Trigger events
      if (events && newTimeLeft.seconds !== lastSecond.current) {
        // Second tick
        events.onSecondTick?.();

        // Check for minute completion (when seconds go from any number to 59, or when minute changes)
        if (lastSecond.current === 0 && newTimeLeft.seconds === 59 && lastMinute.current !== newTimeLeft.minutes) {
          events.onMinuteComplete?.();
        }

        // Check for hour completion
        if (lastMinute.current === 0 && newTimeLeft.minutes === 59 && lastHour.current !== newTimeLeft.hours) {
          events.onHourComplete?.();
        }

        // Last minute (60 seconds or less)
        if (newTimeLeft.totalSeconds <= 60 && newTimeLeft.totalSeconds > 0 && !hasTriggeredLastMinute.current) {
          hasTriggeredLastMinute.current = true;
          events.onLastMinute?.();
        }

        // Final countdown (last 10 seconds)
        if (newTimeLeft.totalSeconds <= 10 && newTimeLeft.totalSeconds > 0) {
          events.onFinalCountdown?.(newTimeLeft.totalSeconds);
        }

        // Complete
        if (newTimeLeft.isComplete && !hasCompleted.current) {
          hasCompleted.current = true;
          events.onComplete?.();
        }

        lastSecond.current = newTimeLeft.seconds;
        lastMinute.current = newTimeLeft.minutes;
        lastHour.current = newTimeLeft.hours;
      }

      setTimeLeft(newTimeLeft);
    }, 100); // Update every 100ms for smoother animations

    return () => clearInterval(interval);
  }, [events]);

  return {
    ...timeLeft,
    targetDate: targetDate.current,
    resetCountdown,
    setTestTarget,
  };
}

export default useCountdown;
