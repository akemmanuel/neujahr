import { useState, useEffect } from 'react';
import { Fireworks } from './Fireworks';
import { Confetti } from './Confetti';

interface NewYearCelebrationProps {
  active: boolean;
  onReplay?: () => void;
}

export function NewYearCelebration({ active, onReplay }: NewYearCelebrationProps) {
  const [showText, setShowText] = useState(false);
  const [showReplayButton, setShowReplayButton] = useState(false);

  useEffect(() => {
    if (active) {
      // Show "2025" text after initial explosion
      setTimeout(() => setShowText(true), 500);
      // Show replay button after 10 seconds
      setTimeout(() => setShowReplayButton(true), 10000);
    } else {
      setShowText(false);
      setShowReplayButton(false);
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fireworks */}
      <Fireworks active={active} intensity={1} />
      
      {/* Confetti */}
      <Confetti active={active} count={150} />

      {/* Main celebration content */}
      <div className="relative z-60 flex flex-col items-center gap-8 px-4">
        {/* 2025 */}
        {showText && (
          <div className="animate-zoom-in">
            <h1 
              className="font-[Cinzel] text-8xl sm:text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-gold-dark animate-pulse"
              style={{
                textShadow: '0 0 30px #FFD700, 0 0 60px #FFD700, 0 0 90px #FF6B35, 0 0 120px #FF6B35',
                WebkitTextStroke: '2px rgba(255, 215, 0, 0.3)',
              }}
            >
              2025
            </h1>
          </div>
        )}

        {/* Happy New Year */}
        {showText && (
          <div 
            className="animate-fade-in-up"
            style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
          >
            <h2 
              className="font-[Syne] text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.3em] text-champagne text-center"
              style={{
                textShadow: '0 0 20px rgba(255, 254, 242, 0.8)',
              }}
            >
              Frohes Neues Jahr!
            </h2>
          </div>
        )}

        {/* Replay button */}
        {showReplayButton && (
          <button
            onClick={onReplay}
            className="mt-8 px-8 py-4 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-bg-primary font-[Outfit] font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] active:scale-95 animate-fade-in-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            Nochmal ansehen
          </button>
        )}
      </div>

      {/* Background overlay with gradient */}
      <div 
        className="absolute inset-0 z-[-1] animate-rainbow"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(10, 10, 15, 0.7) 70%)',
        }}
      />
    </div>
  );
}

export default NewYearCelebration;
