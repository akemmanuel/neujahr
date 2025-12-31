import { useCallback, useRef } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Check if we're in a Capacitor environment
const isCapacitor = () => {
  return typeof window !== 'undefined' && !!(window as any).Capacitor;
};

export function useHaptics() {
  const enabled = useRef(true);

  const setEnabled = useCallback((value: boolean) => {
    enabled.current = value;
  }, []);

  // Light tick - for every second
  const tick = useCallback(async () => {
    if (!enabled.current || !isCapacitor()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Silently fail in browser
    }
  }, []);

  // Medium impact - for minute completion
  const minuteImpact = useCallback(async () => {
    if (!enabled.current || !isCapacitor()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      setTimeout(() => Haptics.impact({ style: ImpactStyle.Medium }), 150);
    } catch (e) {}
  }, []);

  // Heavy impact pattern - for hour completion
  const hourImpact = useCallback(async () => {
    if (!enabled.current || !isCapacitor()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 200);
      setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 400);
    } catch (e) {}
  }, []);

  // Notification - for last minute start
  const lastMinuteAlert = useCallback(async () => {
    if (!enabled.current || !isCapacitor()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {}
  }, []);

  // Escalating impact for final 10 seconds
  const finalCountdownImpact = useCallback(async (secondsLeft: number) => {
    if (!enabled.current || !isCapacitor()) return;
    try {
      if (secondsLeft > 5) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (secondsLeft > 1) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (secondsLeft === 1) {
        // Long vibration for the last second
        await Haptics.vibrate({ duration: 500 });
      }
    } catch (e) {}
  }, []);

  // Celebration explosion pattern
  const celebrationExplosion = useCallback(async () => {
    if (!enabled.current || !isCapacitor()) return;
    try {
      // Rapid heavy impacts
      for (let i = 0; i < 5; i++) {
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), i * 100);
      }
      // Followed by success notification
      setTimeout(() => Haptics.notification({ type: NotificationType.Success }), 600);
      // Final long vibration
      setTimeout(() => Haptics.vibrate({ duration: 1000 }), 800);
    } catch (e) {}
  }, []);

  // Custom vibration pattern
  const vibrate = useCallback(async (duration: number = 100) => {
    if (!enabled.current || !isCapacitor()) return;
    try {
      await Haptics.vibrate({ duration });
    } catch (e) {}
  }, []);

  return {
    tick,
    minuteImpact,
    hourImpact,
    lastMinuteAlert,
    finalCountdownImpact,
    celebrationExplosion,
    vibrate,
    setEnabled,
    isCapacitor: isCapacitor(),
  };
}

export default useHaptics;
