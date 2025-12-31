import { useState, useEffect, useCallback, useRef } from 'react';
import { Motion } from '@capacitor/motion';

interface MotionData {
  x: number;
  y: number;
  z: number;
}

interface ParallaxOffset {
  x: number;
  y: number;
}

// Check if we're in a Capacitor environment
const isCapacitor = () => {
  return typeof window !== 'undefined' && !!(window as any).Capacitor;
};

export function useMotion() {
  const [acceleration, setAcceleration] = useState<MotionData>({ x: 0, y: 0, z: 0 });
  const [parallax, setParallax] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState(false);
  const lastShake = useRef(0);
  const shakeThreshold = 15;
  const shakeCooldown = 1000; // 1 second cooldown between shakes
  const onShakeCallback = useRef<(() => void) | null>(null);

  // Smooth parallax calculation
  const calculateParallax = useCallback((x: number, y: number) => {
    // Clamp values and normalize to -1 to 1 range
    const normalizedX = Math.max(-1, Math.min(1, x / 10));
    const normalizedY = Math.max(-1, Math.min(1, y / 10));
    
    // Convert to pixel offset (max 30px movement)
    return {
      x: normalizedX * 30,
      y: normalizedY * 30,
    };
  }, []);

  // Detect shake gesture
  const detectShake = useCallback((x: number, y: number, z: number) => {
    const now = Date.now();
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

    if (totalAcceleration > shakeThreshold && now - lastShake.current > shakeCooldown) {
      lastShake.current = now;
      setIsShaking(true);
      onShakeCallback.current?.();
      
      // Reset shaking state after animation
      setTimeout(() => setIsShaking(false), 500);
    }
  }, []);

  // Set shake callback
  const onShake = useCallback((callback: () => void) => {
    onShakeCallback.current = callback;
  }, []);

  useEffect(() => {
    if (!isCapacitor()) {
      // Fallback: Use DeviceOrientation API for browsers
      const handleOrientation = (event: DeviceOrientationEvent) => {
        const x = event.gamma || 0; // Left/right tilt (-90 to 90)
        const y = event.beta || 0;  // Front/back tilt (-180 to 180)
        
        setParallax(calculateParallax(x / 9, y / 18));
      };

      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
      }
      return;
    }

    const startWatching = async () => {
      try {
        await Motion.addListener('accel', (event) => {
          const { x, y, z } = event.acceleration || { x: 0, y: 0, z: 0 };
          
          setAcceleration({ x, y, z });
          setParallax(calculateParallax(x, y));
          detectShake(x, y, z);
        });
      } catch (e) {
        console.log('Motion sensor not available');
      }
    };

    startWatching();

    return () => {
      Motion.removeAllListeners();
    };
  }, [calculateParallax, detectShake]);

  return {
    acceleration,
    parallax,
    isShaking,
    onShake,
    isCapacitor: isCapacitor(),
  };
}

export default useMotion;
