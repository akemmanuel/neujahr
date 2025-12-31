import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface ParticleFieldProps {
  count?: number;
  parallaxX?: number;
  parallaxY?: number;
  intensity?: number; // 0-1, increases during final countdown
}

export function ParticleField({ 
  count = 80, 
  parallaxX = 0, 
  parallaxY = 0,
  intensity = 0,
}: ParticleFieldProps) {
  const stars = useMemo(() => {
    const generatedStars: Star[] = [];
    for (let i = 0; i < count; i++) {
      generatedStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    return generatedStars;
  }, [count]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: intensity > 0.5
            ? `radial-gradient(ellipse at bottom, rgba(139, 92, 246, ${0.3 + intensity * 0.2}) 0%, rgba(10, 10, 15, 1) 70%)`
            : 'radial-gradient(ellipse at bottom, rgba(27, 40, 56, 0.8) 0%, rgba(10, 10, 15, 1) 70%)',
        }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size + intensity * 2}px`,
            height: `${star.size + intensity * 2}px`,
            backgroundColor: intensity > 0.7 
              ? `hsl(${Math.random() * 60 + 30}, 100%, 70%)` // Gold/orange hues
              : '#FFFEF2',
            opacity: star.opacity + intensity * 0.3,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: intensity > 0.5 
              ? `0 0 ${6 + intensity * 10}px ${intensity > 0.7 ? '#FFD700' : '#FFFEF2'}`
              : `0 0 ${star.size * 2}px rgba(255, 254, 242, 0.5)`,
          }}
        />
      ))}

      {/* Extra particles during high intensity */}
      {intensity > 0.3 && (
        <>
          {Array.from({ length: Math.floor(intensity * 30) }).map((_, i) => (
            <div
              key={`extra-${i}`}
              className="absolute rounded-full animate-particle-rise"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: 0,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: ['#FFD700', '#FF6B35', '#00FFFF', '#FF00FF'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                boxShadow: '0 0 10px currentColor',
              }}
            />
          ))}
        </>
      )}

      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

export default ParticleField;
