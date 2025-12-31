import { createRoot } from "react-dom/client";
import { useState, useEffect, useCallback } from "react";
import "./index.css";

// Test version with 70 seconds countdown
const TestApp = () => {
  const [secondsLeft, setSecondsLeft] = useState(70);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setIsComplete(true);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const reset = useCallback(() => {
    setSecondsLeft(70);
    setIsComplete(false);
  }, []);

  const fmt = (n: number) => String(n).padStart(2, '0');
  
  const hours = 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const isLastMinute = secondsLeft <= 60 && secondsLeft > 0;
  const isFinal10 = secondsLeft <= 10 && secondsLeft > 0;
  const intensity = isFinal10 ? (10 - secondsLeft) / 10 : 0;

  if (isComplete) {
    return (
      <div className="relative w-full h-full bg-void overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 
            className="font-[Cinzel] text-8xl sm:text-9xl font-black animate-scale-in"
            style={{
              color: '#d4af37',
              textShadow: '0 0 40px rgba(212,175,55,0.6), 0 0 80px rgba(212,175,55,0.3)',
            }}
          >
            2026
          </h1>

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

          <button
            onClick={reset}
            className="mt-12 px-8 py-3 rounded-full bg-[#d4af37] text-[#050507] font-semibold tracking-wider uppercase text-sm hover:bg-[#ffd700] transition-colors animate-fade-in"
            style={{ animationDelay: '1s', animationFillMode: 'both' }}
          >
            Nochmal (70s)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-void overflow-hidden">
      
      {/* Stars Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 60 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isFinal10
            ? `radial-gradient(circle at 50% 50%, rgba(255,69,0,${0.1 + intensity * 0.15}) 0%, transparent 60%)`
            : 'radial-gradient(circle at 50% 100%, rgba(30,30,50,0.8) 0%, transparent 50%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        
        {/* Title */}
        <h1 
          className="font-[Syne] text-sm tracking-[0.5em] uppercase mb-12 transition-colors duration-500"
          style={{ 
            color: isFinal10 ? '#ff4500' : isLastMinute ? '#d4af37' : '#666',
          }}
        >
          Test: 70 Sekunden
        </h1>

        {/* Countdown */}
        <div className="flex items-center gap-3 sm:gap-4">
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
              {fmt(hours)}
            </div>
            <span className="text-xs tracking-[0.3em] uppercase mt-2 text-gray-500">Std</span>
          </div>

          <span className="font-[Cinzel] text-4xl sm:text-6xl text-gray-600 mb-6 px-1 text-center">:</span>

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
              {fmt(minutes)}
            </div>
            <span className="text-xs tracking-[0.3em] uppercase mt-2 text-gray-500">Min</span>
          </div>

          <span className="font-[Cinzel] text-4xl sm:text-6xl text-gray-600 mb-6 px-1 text-center">:</span>

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
              {fmt(seconds)}
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
            {secondsLeft}
          </div>
        )}

        {/* Last minute text */}
        {isLastMinute && !isFinal10 && (
          <p className="mt-12 text-sm tracking-[0.3em] uppercase text-[#d4af37] animate-pulse">
            Die letzte Minute
          </p>
        )}

        {/* Reset button */}
        <button
          onClick={reset}
          className="absolute bottom-6 px-4 py-2 text-xs rounded bg-white/5 text-gray-500 hover:bg-white/10 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(<TestApp />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
