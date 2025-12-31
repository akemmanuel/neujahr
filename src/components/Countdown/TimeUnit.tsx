import { useEffect, useState } from 'react';

interface TimeUnitProps {
  value: number;
  label: string;
  isActive?: boolean;
  isFinal?: boolean;
  intensity?: number; // 0-1 for final countdown intensity
}

export function TimeUnit({ value, label, isActive = false, isFinal = false, intensity = 0 }: TimeUnitProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setPrevValue(value);
        setIsFlipping(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const displayValue = String(value).padStart(2, '0');

  // Dynamic glow based on intensity
  const glowStyle = isFinal ? {
    textShadow: `0 0 ${20 + intensity * 40}px #FFD700, 0 0 ${40 + intensity * 60}px #FFD700, 0 0 ${60 + intensity * 80}px #FF6B35`,
    transform: `scale(${1 + intensity * 0.3})`,
  } : {};

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-b from-white/10 to-white/5
          backdrop-blur-xl border border-white/20
          px-4 py-3 min-w-[80px] sm:min-w-[100px]
          transition-all duration-300
          ${isActive ? 'ring-2 ring-gold/50 shadow-[0_0_30px_rgba(255,215,0,0.3)]' : ''}
          ${isFinal ? 'ring-2 ring-orange-glow/70 shadow-[0_0_40px_rgba(255,107,53,0.5)]' : ''}
        `}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" 
          style={{ animationName: 'none' }} // Will be activated on special events
        />
        
        {/* Number */}
        <div 
          className={`
            font-[Cinzel] font-black text-5xl sm:text-6xl md:text-7xl
            text-transparent bg-clip-text
            bg-gradient-to-b from-gold-light via-gold to-gold-dark
            transition-all duration-200
            ${isFlipping ? 'animate-number-flip' : ''}
          `}
          style={glowStyle}
        >
          {displayValue}
        </div>
      </div>

      {/* Label */}
      <span className={`
        font-[Outfit] text-xs sm:text-sm uppercase tracking-[0.2em]
        transition-colors duration-300
        ${isFinal ? 'text-orange-glow font-semibold' : 'text-champagne/60'}
      `}>
        {label}
      </span>
    </div>
  );
}

export default TimeUnit;
