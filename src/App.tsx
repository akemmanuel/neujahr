import { useState, useCallback, useEffect, useMemo } from 'react';
import './index.css';
import { useHaptics } from './hooks/useHaptics';

// Target: January 1, 2026, 00:00:00 local time
const TARGET_DATE = new Date(2026, 0, 1, 0, 0, 0, 0);

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(target: Date, serverOffset: number = 0): TimeLeft {
  const now = Date.now() + serverOffset;
  const diff = target.getTime() - now;
  
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const total = Math.floor(diff / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return { hours, minutes, seconds, total };
}

// Star component
function Star({ style }: { style: React.CSSProperties }) {
  return (
    <div 
      className="absolute rounded-full bg-white"
      style={style}
    />
  );
}

// Rocket component
function Rocket({ id, x, onComplete }: { id: number; x: number; onComplete: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  return (
    <div
      className="absolute bottom-0 pointer-events-none"
      style={{
        left: `${x}%`,
        animation: 'rocket-fly 2.5s ease-out forwards',
      }}
    >
      {/* Rocket body */}
      <div className="relative">
        <div 
          className="w-3 h-8 rounded-t-full"
          style={{
            background: 'linear-gradient(to bottom, #ff4500, #ffd700)',
            boxShadow: '0 0 20px #ff4500, 0 0 40px #ffd700',
          }}
        />
        {/* Trail */}
        <div 
          className="absolute top-8 left-1/2 -translate-x-1/2 w-2 h-16"
          style={{
            background: 'linear-gradient(to bottom, #ffd700, #ff4500, transparent)',
            filter: 'blur(2px)',
            animation: 'flicker 0.1s infinite',
          }}
        />
      </div>
    </div>
  );
}

// Confetti piece
function ConfettiPiece({ x, color, delay, size, duration, shape }: { 
  x: number; color: string; delay: number; size: number; duration: number; shape: 'circle' | 'square'
}) {
  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: `${x}%`,
        top: 0,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : '2px',
        animation: `fall ${duration}s linear ${delay}s forwards`,
        zIndex: 100,
        boxShadow: `0 0 ${size/2}px ${color}40`,
      }}
    />
  );
}

// Explosion effect when rocket reaches top
function Explosion({ x, y, onComplete }: { x: number; y: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      angle: (360 / 20) * i,
      color: ['#ffd700', '#ff4500', '#00d4ff', '#ff00ff', '#00ff00'][Math.floor(Math.random() * 5)] ?? '#ffd700',
      distance: 30 + Math.random() * 50,
      size: 4 + Math.random() * 4,
    }))
  , []);

  return (
    <div 
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: 'explode-particle 1s ease-out forwards',
            transform: `rotate(${p.angle}deg) translateY(-${p.distance}px)`,
          }}
        />
      ))}
    </div>
  );
}

const CONFETTI_COLORS = ['#ffd700', '#ff4500', '#00d4ff', '#ff00ff', '#00ff00', '#ff69b4', '#fff'];
type ConfettiShape = 'circle' | 'square';

export function App() {
  const [serverOffset, setServerOffset] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'offline'>('syncing');
  const [time, setTime] = useState<TimeLeft>(() => calculateTimeLeft(TARGET_DATE));
  const [lastSecond, setLastSecond] = useState(-1);
  const [lastMinute, setLastMinute] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const [rockets, setRockets] = useState<Array<{ id: number; x: number }>>([]);
  const [explosions, setExplosions] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string; delay: number; size: number; duration: number; shape: ConfettiShape }>>([]);
  
  const haptics = useHaptics();

  // Sync with world time API (Atomuhr) - uses local timezone
  useEffect(() => {
    const syncTime = async () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const beforeRequest = Date.now();
        const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
        const afterRequest = Date.now();
        const data = await response.json();
        
        const latency = (afterRequest - beforeRequest) / 2;
        const serverTime = new Date(data.datetime).getTime();
        const localTime = afterRequest;
        const offset = serverTime - localTime + latency;
        
        setServerOffset(offset);
        setSyncStatus('synced');
        console.log(`Atomuhr synced (${timezone}). Offset: ${offset}ms`);
      } catch (error) {
        console.warn('Could not sync with time server, using local time');
        setSyncStatus('offline');
      }
    };

    syncTime();
    const syncInterval = setInterval(syncTime, 5 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, []);

  // Memoized stars
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 4,
    }));
  }, []);

  // Determine states
  const isLastMinute = time.total <= 60 && time.total > 0;
  const isFinal10 = time.total <= 10 && time.total > 0;

  // Calculate how close we are to new year (0 = far away, 1 = very close)
  // Based on last 24 hours
  const proximityToNewYear = useMemo(() => {
    const hoursLeft = time.total / 3600;
    if (hoursLeft > 24) return 0;
    return 1 - (hoursLeft / 24);
  }, [time.total]);

  // Spawn confetti on minute change
  const spawnMinuteConfetti = useCallback(() => {
    // Base amount: 8, max: 50 (closer to new year = more confetti)
    const amount = Math.floor(8 + proximityToNewYear * 42);
    
    const newConfetti = Array.from({ length: amount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? '#ffd700',
      delay: Math.random() * 0.3,
      size: 6 + Math.random() * 8,
      duration: 2 + Math.random() * 1.5,
      shape: (Math.random() > 0.5 ? 'circle' : 'square') as ConfettiShape,
    }));
    
    setConfetti(prev => [...prev, ...newConfetti]);
    
    // Cleanup after animation
    setTimeout(() => {
      setConfetti(prev => prev.filter(c => !newConfetti.find(nc => nc.id === c.id)));
    }, 5000);
  }, [proximityToNewYear]);

  // Launch rockets on hour change
  const launchRockets = useCallback(() => {
    const rocketCount = 3;
    const newRockets = Array.from({ length: rocketCount }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + (i * 30) + Math.random() * 10,
    }));
    
    setRockets(prev => [...prev, ...newRockets]);
    
    // Create explosions when rockets reach top
    newRockets.forEach((rocket, i) => {
      setTimeout(() => {
        setExplosions(prev => [...prev, { 
          id: rocket.id, 
          x: rocket.x, 
          y: 15 + Math.random() * 10 
        }]);
      }, 1500 + i * 200);
    });
  }, []);

  const removeRocket = useCallback((id: number) => {
    setRockets(prev => prev.filter(r => r.id !== id));
  }, []);

  const removeExplosion = useCallback((id: number) => {
    setExplosions(prev => prev.filter(e => e.id !== id));
  }, []);

  // Celebration effect
  const triggerCelebration = useCallback(() => {
    haptics.celebrationExplosion();
    setIsComplete(true);
    setShowFlash(true);
    
    // Massive confetti
    const newConfetti = Array.from({ length: 150 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? '#ffd700',
      delay: Math.random() * 3,
      size: 6 + Math.random() * 10,
      duration: 3 + Math.random() * 2,
    }));
    setConfetti(newConfetti);
    
    // Launch celebration rockets
    for (let i = 0; i < 5; i++) {
      setTimeout(() => launchRockets(), i * 500);
    }
    
    setTimeout(() => setShowFlash(false), 500);
  }, [haptics, launchRockets]);

  // Main timer
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = calculateTimeLeft(TARGET_DATE, serverOffset);
      
      if (newTime.seconds !== lastSecond && newTime.total > 0) {
        haptics.tick();

        // Minute changed - detect when minute value changes
        if (lastMinute !== -1 && newTime.minutes !== lastMinute) {
          console.log('Minute changed!', lastMinute, '->', newTime.minutes);
          haptics.minuteImpact();
          spawnMinuteConfetti();
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 200);
        }

        // Hour changed - detect when we go from minute 0 to 59 (hour decreased)
        if (lastMinute === 0 && newTime.minutes === 59) {
          console.log('Hour changed!');
          haptics.hourImpact();
          launchRockets();
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }

        // Final 10 seconds
        if (newTime.total <= 10 && newTime.total > 0) {
          haptics.finalCountdownImpact(newTime.total);
          if (newTime.total <= 3) {
            setShake(true);
            setTimeout(() => setShake(false), 100);
          }
        }

        setLastSecond(newTime.seconds);
        setLastMinute(newTime.minutes);
      }

      // Completed
      if (newTime.total === 0 && !isComplete) {
        triggerCelebration();
      }

      setTime(newTime);
    }, 100);

    return () => clearInterval(interval);
  }, [serverOffset, lastSecond, lastMinute, isComplete, haptics, spawnMinuteConfetti, launchRockets, triggerCelebration]);

  const fmt = (n: number) => String(n).padStart(2, '0');
  const intensity = isFinal10 ? (10 - time.total) / 10 : 0;

  return (
    <div className={`relative w-full h-full bg-void overflow-hidden ${shake ? 'animate-shake' : ''}`}>
      
      {/* Stars Background */}
      <div className="absolute inset-0">
        {stars.map(star => (
          <Star 
            key={star.id}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animation: `twinkle ${3 + star.delay}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isComplete 
            ? 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.15) 0%, transparent 60%)'
            : isFinal10
              ? `radial-gradient(circle at 50% 50%, rgba(255,69,0,${0.1 + intensity * 0.15}) 0%, transparent 60%)`
              : 'radial-gradient(circle at 50% 100%, rgba(30,30,50,0.8) 0%, transparent 50%)',
        }}
      />

      {/* Rockets */}
      {rockets.map(rocket => (
        <Rocket key={rocket.id} id={rocket.id} x={rocket.x} onComplete={removeRocket} />
      ))}

      {/* Explosions */}
      {explosions.map(exp => (
        <Explosion key={exp.id} x={exp.x} y={exp.y} onComplete={() => removeExplosion(exp.id)} />
      ))}

      {/* Confetti */}
      {confetti.map(c => (
        <ConfettiPiece key={c.id} x={c.x} color={c.color} delay={c.delay} size={c.size} duration={c.duration} />
      ))}

      {/* Screen Flash */}
      {showFlash && (
        <div 
          className="absolute inset-0 z-50 pointer-events-none"
          style={{
            background: isComplete 
              ? 'rgba(255,215,0,0.4)' 
              : 'rgba(255,255,255,0.2)',
            animation: 'fade-in 0.1s ease-out reverse forwards',
          }}
        />
      )}

      {/* Main Content */}
      {!isComplete ? (
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
          
          {/* Title */}
          <h1 
            className="font-[Syne] text-sm tracking-[0.5em] uppercase mb-12 transition-colors duration-500"
            style={{ 
              color: isFinal10 ? '#ff4500' : isLastMinute ? '#d4af37' : '#666',
            }}
          >
            Neujahr 2026
          </h1>

          {/* Countdown */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div 
                className="font-[Cinzel] text-6xl sm:text-8xl font-bold transition-all duration-300 w-[1.3em] text-center"
                style={{ 
                  color: '#e8e8e8',
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum"',
                  textShadow: isFinal10 
                    ? `0 0 ${20 + intensity * 40}px rgba(255,69,0,${0.5 + intensity * 0.5})`
                    : 'none',
                }}
              >
                {fmt(time.hours)}
              </div>
              <span className="text-xs tracking-[0.3em] uppercase mt-2 text-gray-500">Std</span>
            </div>

            <span className="font-[Cinzel] text-4xl sm:text-6xl text-gray-600 mb-6 w-[0.5em] text-center">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div 
                className="font-[Cinzel] text-6xl sm:text-8xl font-bold transition-all duration-300 w-[1.3em] text-center"
                style={{ 
                  color: isLastMinute ? '#d4af37' : '#e8e8e8',
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum"',
                  textShadow: isLastMinute 
                    ? '0 0 20px rgba(212,175,55,0.5)'
                    : 'none',
                }}
              >
                {fmt(time.minutes)}
              </div>
              <span className="text-xs tracking-[0.3em] uppercase mt-2 text-gray-500">Min</span>
            </div>

            <span className="font-[Cinzel] text-4xl sm:text-6xl text-gray-600 mb-6 w-[0.5em] text-center">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div 
                className="font-[Cinzel] text-6xl sm:text-8xl font-bold transition-all duration-150 w-[1.3em] text-center"
                style={{ 
                  color: isFinal10 ? '#ff4500' : '#e8e8e8',
                  fontVariantNumeric: 'tabular-nums',
                  fontFeatureSettings: '"tnum"',
                  textShadow: isFinal10 
                    ? `0 0 ${30 + intensity * 50}px rgba(255,69,0,${0.8 + intensity * 0.2}), 0 0 ${60 + intensity * 80}px rgba(255,69,0,0.4)`
                    : 'none',
                  transform: isFinal10 ? `scale(${1 + intensity * 0.15})` : 'scale(1)',
                }}
              >
                {fmt(time.seconds)}
              </div>
              <span className="text-xs tracking-[0.3em] uppercase mt-2 text-gray-500">Sek</span>
            </div>
          </div>

          {/* Final countdown big number */}
          {isFinal10 && (
            <div 
              className="absolute font-[Cinzel] text-[12rem] sm:text-[16rem] font-black pointer-events-none select-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: `2px rgba(255,69,0,${0.2 + intensity * 0.3})`,
                opacity: 0.3 + intensity * 0.4,
                transform: `scale(${0.8 + intensity * 0.4})`,
                transition: 'all 0.15s ease-out',
              }}
            >
              {time.total}
            </div>
          )}

          {/* Last minute text */}
          {isLastMinute && !isFinal10 && (
            <p className="mt-12 text-sm tracking-[0.3em] uppercase text-[#d4af37] animate-pulse">
              Die letzte Minute
            </p>
          )}

          {/* Sync Status */}
          <div className="absolute bottom-6 flex items-center gap-2 text-xs text-gray-600">
            <div 
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-green-500' : 
                syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} 
            />
            <span>
              {syncStatus === 'synced' ? 'Atomuhr synchronisiert' : 
               syncStatus === 'syncing' ? 'Synchronisiere...' : 
               'Offline-Modus'}
            </span>
          </div>
        </div>
      ) : (
        /* Celebration Screen */
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          
          {/* 2026 */}
          <h1 
            className="font-[Cinzel] text-8xl sm:text-9xl font-black animate-scale-in"
            style={{
              color: '#d4af37',
              textShadow: '0 0 40px rgba(212,175,55,0.6), 0 0 80px rgba(212,175,55,0.3)',
            }}
          >
            2026
          </h1>

          {/* Happy New Year */}
          <p 
            className="mt-6 font-[Syne] text-xl sm:text-2xl tracking-[0.3em] uppercase animate-fade-in"
            style={{ 
              color: '#e8e8e8',
              animationDelay: '0.4s',
              animationFillMode: 'both',
            }}
          >
            Frohes Neues Jahr
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
