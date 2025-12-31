import { useState, useEffect, useCallback } from 'react';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  particles: Particle[];
}

interface Particle {
  angle: number;
  distance: number;
  size: number;
}

interface FireworksProps {
  active: boolean;
  intensity?: number; // 0-1
}

const COLORS = ['#FFD700', '#FF6B35', '#00FFFF', '#FF00FF', '#8B5CF6', '#FFFEF2', '#10B981'];

export function Fireworks({ active, intensity = 1 }: FireworksProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);

  const createFirework = useCallback(() => {
    const particleCount = 12 + Math.floor(Math.random() * 8);
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: (360 / particleCount) * i + Math.random() * 20,
        distance: 50 + Math.random() * 50,
        size: 3 + Math.random() * 4,
      });
    }

    const newFirework: Firework = {
      id: Date.now() + Math.random(),
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#FFD700',
      size: 100 + Math.random() * 50,
      particles,
    };

    setFireworks(prev => [...prev, newFirework]);

    // Remove firework after animation
    setTimeout(() => {
      setFireworks(prev => prev.filter(f => f.id !== newFirework.id));
    }, 1500);
  }, []);

  useEffect(() => {
    if (!active) {
      setFireworks([]);
      return;
    }

    // Initial burst
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createFirework(), i * 200);
    }

    // Continuous fireworks
    const interval = setInterval(() => {
      const count = Math.ceil(intensity * 3);
      for (let i = 0; i < count; i++) {
        setTimeout(() => createFirework(), i * 100);
      }
    }, 800 / intensity);

    return () => clearInterval(interval);
  }, [active, intensity, createFirework]);

  if (!active && fireworks.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="absolute animate-firework-burst"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            width: `${firework.size}px`,
            height: `${firework.size}px`,
          }}
        >
          {/* Center flash */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: firework.color,
              boxShadow: `0 0 20px ${firework.color}, 0 0 40px ${firework.color}`,
            }}
          />
          
          {/* Particles */}
          {firework.particles.map((particle, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: firework.color,
                boxShadow: `0 0 ${particle.size * 2}px ${firework.color}`,
                transform: `rotate(${particle.angle}deg) translateY(-${particle.distance}px)`,
                transformOrigin: '0 0',
                animation: 'firework-burst 1s ease-out forwards',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Fireworks;
